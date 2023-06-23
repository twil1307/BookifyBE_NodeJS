const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const PageView = require("../models/PageView");
const User = require("../models/User");
const Reports = require("../models/Report");
const AppError = require("../utils/appError");

const getUserBookingHistoryTypeAll = catchAsync(async (req, res, next) => {
  const bookingHistory = await Booking.find({})
    .populate([
      {
        path: "hotelId",
        select: "hotelId hotelName address district city country",
      },
      // { path: "roomId", select: "bedType" },
    ])
    .select("-user -updatedAt")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    booking: bookingHistory,
  });
});

const getUserBookingHistoryTypeToday = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const todayDate = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const bookingHistory = await Booking.find({
    $and: [
      { $expr: { $eq: [{ $dayOfMonth: "$createdAt" }, todayDate] } },
      { $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] } },
      { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      { user: req.user._id },
    ],
  })
    .populate([
      {
        path: "hotelId",
        select: "hotelId hotelName address district city country",
      },
      // { path: "roomId", select: "bedType" },
    ])
    .select("-user -updatedAt")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    booking: bookingHistory,
  });
});

const getUserBookingHistoryTypeBooked = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const bookingHistory = await Booking.find({
    $and: [{ checkout: { $lt: currentDate } }, { user: req.user._id }],
  })
    .populate([
      {
        path: "hotelId",
        select: "hotelId hotelName address district city country",
      },
      // { path: "roomId", select: "bedType" },
    ])
    .select("-user -updatedAt")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    booking: bookingHistory,
  });
});

const getUserBookingHistoryTypeCanceled = catchAsync(async (req, res, next) => {
  const currentDate = new Date();

  const bookingHistory = await Booking.find({
    $and: [
      { checkout: { $lt: currentDate } },
      { user: req.user._id },
      { status: false },
    ],
  })
    .populate([
      {
        path: "hotelId",
        select: "hotelId hotelName address district city country",
      },
      // { path: "roomId", select: "bedType" },
    ])
    .select("-user -updatedAt")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    booking: bookingHistory,
  });
});

module.exports = {
  getUserBookingHistoryTypeAll,
  getUserBookingHistoryTypeToday,
  getUserBookingHistoryTypeBooked,
  getUserBookingHistoryTypeCanceled,
};
