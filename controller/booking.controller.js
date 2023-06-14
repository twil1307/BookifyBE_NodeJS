const Booking = require("../models/Booking");
const Room = require("../models/RoomType");
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
    const hotelRoomIds = await Room.distinct("_id", {
      hotelId: bookingRequest.hotelId,
    });

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

    // Check if rooms id is equal to the rooms of overlap day, if equals => all the rooms in the date range are booked
    // else => get out all the not booked room and set the first room to guest
    const areFullyBooked =
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
      await bookingCheck.save();

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Your booking has been successfully",
      });
    }
  } catch (error) {
    await session.abortTransaction();

    session.endSession();
  }
});
