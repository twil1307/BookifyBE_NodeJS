const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");

const isUserEverStayHere = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const hotelId = req.params.hotelId;

  const userBooking = await Booking.find({
    userId: userId,
    hotelId: hotelId,
  });

  if (userBooking && userBooking.length > 0 && userBooking != null) {
    const currentDate = new Date();
    const specificDate = new Date(userBooking.checkout);
    if (currentDate < specificDate) {
      return res.status(405).json({
        message: "You can not review this hotel until your checkout date",
      });
    } else {
      next();
    }
  } else {
    return res.status(405).json({
      message: "You have'nt stayed here before",
    });
  }
});

module.exports = { isUserEverStayHere };
