const Booking = require("../models/Booking");
const Room = require("../models/Room");
const BankingAccount = require("../models/BankingAccount");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

module.exports.bookingRoom = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingRequest = new Booking(req.body);
    bookingRequest.checkin = new Date(req.body.checkin);
    bookingRequest.checkout = new Date(req.body.checkout);

    // Get all room Ids
    // - solution 1
    // const hotelRoomIds2 = await Room.distinct("_id", {
    //   hotelId: bookingRequest.hotelId,
    // });

    // - solution 2
    // Get both roomId and price
    const hotelRoomIdsAndPrice = await Room.find({
      hotelId: bookingRequest.hotelId,
    })
      .select("_id roomTypeId")
      .populate({ path: "roomTypeId", select: "roomPrice" })
      .sort({ _id: 1 });

    // Filter out _id only
    const hotelRoomIds = hotelRoomIdsAndPrice.map((obj) => obj._id);

    // Get out price only
    const roomPrice = hotelRoomIdsAndPrice[0].roomTypeId.roomPrice;

    bookingRequest.price = roomPrice;

    // Get all (distinct) the rooms Ids which is overlapped in the check in and check out date range
    const bookingCheck = await Booking.distinct("roomId", {
      $and: [
        {
          $or: [
            {
              $and: [
                { checkin: { $lte: bookingRequest.checkin } },
                { checkout: { $gte: bookingRequest.checkin } },
              ],
            },
            {
              $and: [
                { checkin: { $lt: bookingRequest.checkin } },
                { checkout: { $gte: bookingRequest.checkout } },
              ],
            },
            {
              $and: [
                { checkin: { $lte: bookingRequest.checkin } },
                { checkout: { $gte: bookingRequest.checkout } },
              ],
            },
          ],
        },
        {
          hotelId: bookingRequest.hotelId,
        },
      ],
    });

    bookingRequest.userId = req.user._id;

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

      // push the first room of the array for the booking request of guest
      bookingRequest.roomId = roomAvailable[0];

      // save booking to db
      await bookingRequest.save();

      // minus user money
      await BankingAccount.findByIdAndUpdate(req.user.bankingAccountNumber, {
        $inc: { amount: -bookingRequest.price },
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Your booking has been successfully",
        booking: bookingRequest,
      });
    }
  } catch (error) {
    await session.abortTransaction();

    session.endSession();
  }
});
