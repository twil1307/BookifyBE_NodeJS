const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Transact = require("../models/Transact");
const Hotel = require("../models/Hotel");
const BankingAccount = require("../models/BankingAccount");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");

module.exports.bookingRoom = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingRequest = new Booking(req.body);
    bookingRequest.checkin = new Date(req.body.checkin);
    bookingRequest.checkout = new Date(req.body.checkout);

    const hotelRoomIdsAndPrice = await Hotel.findById(bookingRequest.hotelId)
      .select("Rooms roomType")
      .sort({ _id: 1 });

    console.log(hotelRoomIdsAndPrice);

    // Filter out _id only
    const hotelRoomIds = hotelRoomIdsAndPrice.Rooms;

    console.log(hotelRoomIds);

    // Get out price only
    const roomPrice = hotelRoomIdsAndPrice.roomType.roomPrice;

    bookingRequest.price = roomPrice;

    // Get all (distinct) the rooms Ids which is overlapped in the check in and check out date range
    const bookingCheck = await Booking.find("roomId", {
      $and: [
        {
          $or: [
            {
              $and: [
                { checkin: { $lte: bookingRequest.checkin } },
                { checkout: { $gte: bookingRequest.checkout } },
              ],
            },
            {
              $and: [
                { checkin: { $lte: bookingRequest.checkin } },
                {
                  checkout: {
                    $lt: bookingRequest.checkout,
                    $gt: bookingRequest.checkin,
                  },
                },
              ],
            },
            {
              $and: [
                {
                  checkin: {
                    $lt: bookingRequest.checkout,
                    $gt: bookingRequest.checkin,
                  },
                },
                { checkout: { $gte: bookingRequest.checkout } },
              ],
            },
            {
              $and: [
                { checkin: { $gt: bookingRequest.checkin } },
                { checkout: { $lt: bookingRequest.checkout } },
              ],
            },
          ],
        },
        {
          hotelId: bookingRequest.hotelId,
        },
      ],
    });

    console.log(bookingCheck);

    bookingRequest.user = req.user._id;

    // Compare 2 array
    // Check if rooms id is equal to the rooms of overlap day, if equals => all the rooms in the date range are booked
    // else => get out all the not booked room and set the first room to guest
    let areFullyBooked =
      JSON.stringify(bookingCheck) === JSON.stringify(hotelRoomIds);

    if (areFullyBooked) {
      await session.commitTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Hotel fully booked",
      });
    } else {
      // Get all the rooms availale in the hotel in date range (not being overlapping)
      const roomAvailable = hotelRoomIds.filter((element) =>
        bookingCheck.every((item) => item.toString() !== element.toString())
      );

      // console.log(roomAvailable);

      // push the first room of the array for the booking request of guest
      bookingRequest.roomId = roomAvailable[0];

      // minus user money
      const bankingAccount = await BankingAccount.findById(
        req.user.bankingAccountNumber
      );

      if (bankingAccount.amount - bookingRequest.price < 0) {
        throw new AppError("Your account doesn't have enough balance", 400);
      }

      await BankingAccount.findByIdAndUpdate(req.user.bankingAccountNumber, {
        $inc: { amount: -bookingRequest.price },
      });

      // const transact = new Transact({
      //   ammount: bookingRequest.price,
      //   hotelId: bookingRequest.hotelId,
      //   user: bookingRequest.user,
      // });

      // // save transact history
      // await transact.save();

      // save booking to db
      await bookingRequest.save();

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Your booking has been successfully",
        booking: bookingRequest,
      });
    }
  } catch (error) {
    console.log("Aborting booking request");

    await session.abortTransaction();

    session.endSession();

    next(error);
  }
});
