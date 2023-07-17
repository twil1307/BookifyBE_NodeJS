const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const User = require("../models/User");
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
  getDashboardExchangeMonthly,
  getDashboardExchangeYearly,
  extractArray,
} = require("../service/dashBoardService");

// Get all hotel for dashboard (To enable hotel (?))
module.exports.getAllHotelsDashBoard = catchAsync(async (req, res, next) => {
  const hotels = await Hotel.find({})
    .populate({ path: "user", select: "_id subName name username" })
    .select("hotelName createdAt user isVerified");

  return res.status(200).json({
    hotels: hotels,
  });
});

module.exports.verifyHotel = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;

  const hotelVerified = await Hotel.findByIdAndUpdate(hotelId, {
    $set: { isVerified: true },
  });

  console.log("-------------------------------");

  console.log(hotelVerified.user);

  const userRegisHost = await User.findByIdAndUpdate(hotelVerified.user, {
    $set: { role: 2 },
  });

  return res.status(200).json({
    message: "Verify hotel and update user role successfully",
    user: userRegisHost,
  });
});

module.exports.verifyBooking = catchAsync(async (req, res, next) => {
  const bookingId = req.params.bookingId;

  await Booking.findByIdAndUpdate(bookingId, { $set: { status: true } });

  return res.status(200).json({
    message: "Accept booking successfully",
  });
});

module.exports.disableBooking = catchAsync(async (req, res, next) => {
  const bookingId = req.params.bookingId;

  const booking = await Booking.findByIdAndUpdate(bookingId, {
    $set: { status: null },
  });

  console.log(booking);

  const bankingAccountNumber = await User.findById;

  return res.status(200).json({
    message: "Accept booking successfully",
  });
});

module.exports.disableHotel = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  await Hotel.findByIdAndUpdate(hotelId, { $set: { isVerified: false } });

  return res.status(200).json({
    message: "Verify hotel successfully",
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

    const [labelIncome, valueIncome] = extractArray(monthsIncome);
    const [labelEstimate, valueEstimate] = extractArray(estimateObj);

    return res.status(200).json({
      income: {
        label: labelIncome,
        value: valueIncome,
      },
      total: total,
      esimate: {
        label: labelEstimate,
        value: valueEstimate,
      },
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
      hotelBookingData = await Booking.find({
        $and: [{ hotelId: hotelId }, { status: true }],
      });
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

  console.log(currentDay, currentMonth, currentYear);

  switch (type) {
    case "pending":
      hotelBookingData = await Booking.find({
        $and: [
          { $expr: { $eq: [{ $dayOfMonth: "$checkin" }, currentDay] } },
          { $expr: { $eq: [{ $month: "$checkin" }, currentMonth] } },
          { $expr: { $eq: [{ $year: "$checkin" }, currentYear] } },
          { hotelId: hotelId },
          { status: false },
        ],
      })
        .populate({
          path: "roomId",
          populate: {
            path: "roomTypeId",
            select: "bedType",
          },
        })
        .populate({
          path: "user",
          select: "username subName name avatar",
        });
      break;
    case "booked":
      hotelBookingData = await Booking.find({
        $and: [
          { $expr: { $eq: [{ $dayOfMonth: "$checkin" }, currentDay] } },
          { $expr: { $eq: [{ $month: "$checkin" }, currentMonth] } },
          { $expr: { $eq: [{ $year: "$checkin" }, currentYear] } },
          { hotelId: hotelId },
          { status: true },
        ],
      })
        .populate({
          path: "roomId",
          populate: {
            path: "roomTypeId",
            select: "bedType",
          },
        })
        .populate({
          path: "user",
          select: "username subName name avatar",
        });
      break;
    case "checkout":
      hotelBookingData = await Booking.find({
        $and: [
          { $expr: { $eq: [{ $dayOfMonth: "$checkout" }, currentDay] } },
          { $expr: { $eq: [{ $month: "$checkout" }, currentMonth] } },
          { $expr: { $eq: [{ $year: "$checkout" }, currentYear] } },
          { hotelId: hotelId },
          { status: true },
        ],
      })
        .populate({
          path: "roomId",
          populate: {
            path: "roomTypeId",
            select: "bedType",
          },
        })
        .populate({
          path: "user",
          select: "username subName name avatar",
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

    const [labelDailyBooking, valueLabelBooking] = extractArray(dailyBooking);
    const [labelTrendyBooking, valueTrendyBooking] =
      extractArray(trendingBooking);

    return res.status(200).json({
      overallData: {
        numberOfBooking,
        numberOfVisitors,
        numberOfPayment,
        numberOfRating,
        numberOfNewUser,
      },
      chartData: {
        dailyBooking: { label: labelDailyBooking, value: valueLabelBooking },
        trendingBooking: {
          label: labelTrendyBooking,
          value: valueTrendyBooking,
        },
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
      getDashboardExchangeMonthly(req, res, next);
      break;

    case "year":
      getDashboardExchangeYearly(req, res, next);
      break;

    default:
      return res.status(404).json({
        message: `Type ${type} not supported`,
      });
  }
});
