const Booking = require("../models/Booking");
const catchAsync = require("../utils/catchAsync");

module.exports.bookingRoom = catchAsync(async (req, res, next) => {
  //   const hotelId = req.params.hotelId;

  const bookingRequest = new Booking(req.body);
  bookingRequest.checkin = new Date(req.body.checkin);
  bookingRequest.checkout = new Date(req.body.checkout);

  //   console.log(bookingRequest);

  bookingRequest.userId = req.user._id;

  const bookingData = await bookingRequest.save();

  return res.status(200).json({
    message: "Booking successfully",
    data: {
      booking: bookingData,
    },
  });
});
