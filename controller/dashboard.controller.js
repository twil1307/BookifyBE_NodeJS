const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const {
  getHotelIncome,
  getHotelIncomeByMonth,
  getHotelIncomeMonths,
  getHotelRating,
  getHotelVisitors,
  getNumberOfVisitorByMonth,
  getNumberOfBookingByMonth,
  getNumberOfRatingByMonth,
  getNumberOfUserRegisteredByMonth,
  getReportData,
  getDashboardIncomeByMonthly,
} = require("../service/dashBoardService");

// Get all hotel for dashboard (To enable hotel (?))
module.exports.getAllHotelsDashBoard = catchAsync(async (req, res, next) => {
  const hotels = await Hotel.find({})
    .populate({ path: "user", select: "_id subName name" })
    .select("hotelName createdAt user");

  return res.status(200).json({
    hotels: hotels,
  });
});

module.exports.getHotelIncomeMonths = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const { month } = req.query;

  // in case request sent not include month, server will return the whole 12 months data
  if (!month) {
    const bookingData = await Booking.find({ hotelId: hotelId }).select(
      "createdAt price"
    );
    const { monthsIncome, total } = await getHotelIncome(bookingData);

    return res.status(200).json({
      income: monthsIncome,
      total: total,
    });
  } else {
    // if there is month, server will return the a specific month data
    const bookingData = await Booking.find({
      $and: [
        {
          $expr: { $eq: [{ $month: "$createdAt" }, month] },
        },
        {
          hotelId: hotelId,
        },
      ],
    });

    const { monthsIncome, estimateObj, total, estimate } =
      await getHotelIncomeByMonth(bookingData);

    return res.status(200).json({
      income: monthsIncome,
      total: total,
      esimate: estimateObj,
      estimateTotal: estimate,
    });
  }
});

module.exports.getHotelBookingAll = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const { type } = req.query;

  let hotelBookingData = null;

  const currentDate = new Date();

  switch (type) {
    case "incoming":
      hotelBookingData = await Booking.find({
        $and: [
          { checkin: { $gt: currentDate } },
          { hotelId: hotelId },
          { status: true },
        ],
      });
      break;
    case "pending":
      hotelBookingData = await Booking.find({ status: false });
      break;
    case "booked":
      hotelBookingData = await Booking.find({
        $and: [
          { checkin: { $lte: currentDate } },
          { checkout: { $gte: currentDate } },
          { hotelId: hotelId },
          { status: true },
        ],
      });
      break;
    case "checkout":
      hotelBookingData = await Booking.find({
        $and: [
          { checkout: { $lt: currentDate } },
          { hotelId: hotelId },
          { status: true },
        ],
      });
      break;
    default:
      return res.status(400).json({
        message: "Type required",
      });
  }

  return res.status(200).json({
    data: hotelBookingData,
  });
});

module.exports.getHotelBookingToday = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const type = req.query.type;
  let hotelBookingData;

  const currentDate = new Date();

  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // const currentDay = 11;
  // const currentMonth = 8;
  // const currentYear = 2023;

  switch (type) {
    case "pending":
      hotelBookingData = hotelBookingData = await Booking.find({
        $and: [
          { $expr: { $eq: [{ $dayOfMonth: "$checkin" }, currentDay] } },
          { $expr: { $eq: [{ $month: "$checkin" }, currentMonth] } },
          { $expr: { $eq: [{ $year: "$checkin" }, currentYear] } },
          { hotelId: hotelId },
          { status: false },
        ],
      });
      break;
    case "booked":
      hotelBookingData = hotelBookingData = await Booking.find({
        $and: [
          { $expr: { $eq: [{ $dayOfMonth: "$checkin" }, currentDay] } },
          { $expr: { $eq: [{ $month: "$checkin" }, currentMonth] } },
          { $expr: { $eq: [{ $year: "$checkin" }, currentYear] } },
          { hotelId: hotelId },
          { status: true },
        ],
      });
      break;
    case "checkout":
      hotelBookingData = hotelBookingData = await Booking.find({
        $and: [
          { $expr: { $eq: [{ $dayOfMonth: "$checkout" }, currentDay] } },
          { $expr: { $eq: [{ $month: "$checkout" }, currentMonth] } },
          { $expr: { $eq: [{ $year: "$checkout" }, currentYear] } },
          { hotelId: hotelId },
          { status: true },
        ],
      });
      break;
    default:
      return res.status(400).json({
        message: "Type required",
      });
  }

  return res.status(200).json({
    data: hotelBookingData,
  });
});

module.exports.getHotelDetailsInfo = catchAsync(async (req, res, next) => {
  const type = req.query.type;

  switch (type) {
    case "income":
      getHotelIncomeMonths(req, res, next);
      break;
    case "ratings":
      getHotelRating(req, res, next);
      break;
    case "views":
      getHotelVisitors(req, res, next);
      break;
    default:
      return res.status(404).json({
        message: `${type} is not supported`,
      });
      break;
  }
});

module.exports.getDashBoardDetailsInfo = catchAsync(async (req, res, next) => {
  // booking data, payment data
  try {
    const { numberOfBooking, dailyBooking, trendingBooking, numberOfPayment } =
      await getNumberOfBookingByMonth(req, res, next);

    console.log(numberOfBooking);

    const { numberOfVisitors } = await getNumberOfVisitorByMonth(
      req,
      res,
      next
    );

    const { numberOfRating } = await getNumberOfRatingByMonth(req, res, next);

    const { numberOfNewUser } = await getNumberOfUserRegisteredByMonth(
      req,
      res,
      next
    );

    const reportData = await getReportData(req, res, next);

    return res.status(200).json({
      overallData: {
        numberOfBooking,
        numberOfVisitors,
        numberOfPayment,
        numberOfRating,
        numberOfNewUser,
      },
      chartData: {
        dailyBooking,
        trendingBooking,
      },
      reports: reportData,
    });
  } catch (error) {
    next(error);
  }
});

module.exports.getDashBoardExchangeInfo = catchAsync(async (req, res, next) => {
  const type = req.query.type;

  switch (type) {
    case "month":
      getDashboardIncomeByMonthly(req, res, next);
      break;

    default:
      break;
  }
});
