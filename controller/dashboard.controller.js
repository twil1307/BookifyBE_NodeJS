const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

// Get all hotel for dashboard (To enable hotel (?))
module.exports.getAllHotelsDashBoard = catchAsync(async (req, res, next) => {
  const hotels = await Hotel.find({})
    .populate({ path: "userId", select: "_id subName name" })
    .select("hotelName createdAt userId");

  return res.status(200).json({
    hotels: hotels,
  });
});

module.exports.getHotelIncomePerMonth = catchAsync(async (req, res, next) => {
  const hotels = await Booking.find({ hotelId: req.body.hotelId }).select(
    "createdAt price"
  );

  const testDate = new Date(hotels[hotels.length - 1].createdAt);
  const testDate2 = new Date("2023-07-07T08:11:24.059Z");

  console.log(testDate2.getDate());
  console.log(testDate.toLocaleDateString());

  const monthlyPriceSum = hotels.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const month = date.getMonth() + 1;

    if (!accumulator[month]) {
      accumulator[month] = 0;
    }

    accumulator[month] += item.price;

    return accumulator;
  }, {});

  return res.status(200).json({
    hotels: monthlyPriceSum,
  });
});
