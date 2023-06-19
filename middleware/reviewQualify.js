const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");

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

const isExactHotelHost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const hotelId = req.query.hotelId;

  const hotelOwnerId = await Hotel.findById(hotelId).select("userId -_id");

  console.log(hotelOwnerId);

  if (!userId.equals(hotelOwnerId)) {
    return res.status(401).json({
      message: "You are not authorized",
    });
  } else {
    next();
  }
});

module.exports = { isUserEverStayHere, isExactHotelHost };
