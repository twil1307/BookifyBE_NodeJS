const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const PageView = require("../models/PageView");
const User = require("../models/User");
const Reports = require("../models/Report");
const AppError = require("../utils/appError");

const getHotelIncome = async (bookingData) => {
  const daysObj = {};

  let total = 0;

  for (var i = 1; i <= 12; i++) {
    daysObj[i] = 0;
  }

  bookingData.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const month = date.getMonth() + 1;

    daysObj[month] += item.price;

    total += item.price;

    return accumulator;
  }, {});

  console.log(daysObj);

  return { daysObj, total };
};

const getHotelIncomeByMonth = async (bookingData) => {
  let total = 0;
  let estimate = 0;
  let estimateObj = {};

  const monthsIncome = bookingData.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const day = date.getDate();

    if (!accumulator[day]) {
      accumulator[day] = 0;
      estimateObj[day] = 0;
    }

    const estimateRandom = getRandomIncome(-item.price, item.price);

    accumulator[day] += item.price;
    estimateObj[day] += item.price + estimateRandom;

    total += item.price;

    estimate += item.price + estimateRandom;

    return accumulator;
  }, {});

  return { monthsIncome, estimateObj, total, estimate };
};

const getHotelIncomeMonths = catchAsync(async (req, res, next) => {
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

const getDashboardExchangeMonthly = catchAsync(async (req, res, next) => {
  const year = req.query.year;
  // if there is month, server will return the a specific month data
  const bookingData = await Booking.find({
    $and: [
      {
        $expr: { $eq: [{ $year: "$createdAt" }, year] },
      },
    ],
  })
    .select("createdAt price user")
    .populate("user", "subName name username");

  const { monthlyData, total } = await getDashboardIncomeMonthly(bookingData);

  const transactData = await getDashboardIncomeHistory(bookingData);

  const [label, value] = extractArray(monthlyData);

  return res.status(200).json({
    income: { label, value },
    total: total,
    transactData: transactData,
  });
});

const getDashboardIncomeHistory = async (bookingData) => {
  const data = bookingData.map((booking) => ({
    username: booking.user.username,
    subName: booking.user.subName,
    name: booking.user.name,
    userId: booking.user._id,
    createdAt: booking.createdAt,
    price: booking.price,
    bookingId: booking._id,
  }));

  return data;
};

const getDashboardIncomeMonthly = async (bookingData) => {
  const monthShortNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let total = 0;

  const monthlyData = {};

  for (let i = 0; i < monthShortNames.length; i++) {
    monthlyData[monthShortNames[i]] = 0;
  }

  bookingData.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const month = date.getMonth();
    const monthStr = monthShortNames[month];

    // if (!accumulator[monthStr]) {
    //   accumulator[monthStr] = 0;
    // }

    monthlyData[monthStr] += item.price;
    // accumulator[monthStr] += item.price;

    total += item.price;

    return accumulator;
  }, {});

  return { monthlyData, total };
};

const getDashboardExchangeYearly = catchAsync(async (req, res, next) => {
  // if there is month, server will return the a specific month data
  const bookingData = await Booking.find({})
    .select("createdAt price user")
    .populate("user", "subName name username");

  const transactData = await getDashboardIncomeHistory(bookingData);

  const { yearlyData, total } = await getDashboardIncomeYearly(bookingData);

  const [label, value] = extractArray(yearlyData);

  return res.status(200).json({
    income: {
      label,
      value,
    },
    total: total,
    transactData: transactData,
  });
});

const getDashboardIncomeYearly = async (bookingData) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  let total = 0;
  const yearlyData = {};

  for (let i = currentYear; i >= currentYear - 9; i--) {
    yearlyData[i] = 0;
  }

  bookingData.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const year = date.getFullYear() + "";

    yearlyData[year] += item.price;

    total += item.price;

    return accumulator;
  }, {});

  return { yearlyData, total };
};

const getHotelRating = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const point = req.query.point;

  let reviewsList;

  if (!point) {
    reviewsList = await Review.find({ hotelId: hotelId }).populate({
      path: "user",
      select: "subName name avatar",
    });
  } else {
    reviewsList = await Review.find({
      $and: [{ hotelId: hotelId }, { averagePoint: point }],
    }).populate({
      path: "user",
      select: "subName name avatar",
    });
  }

  console.log(reviewsList);

  return res.status(200).json({
    ratings: reviewsList,
  });
});

const getHotelVisitors = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const hotelId = req.params.hotelId;
  const month = req.query.month;

  const numberOfVisitors = await PageView.find({
    $and: [
      { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
      { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      { hotelId: hotelId },
    ],
  });

  const numberOfBooking = await Booking.find({
    $and: [
      { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
      { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      { hotelId: hotelId },
    ],
  });

  const dailyViews = getHotelVisitorsByDays(numberOfVisitors);
  const dailyBooking = getHotelBookingByDays(numberOfBooking);

  return res.status(200).json({
    totalViewsNumber: numberOfVisitors.length,
    totalBookingNumber: numberOfBooking.length,
    dailyViews: dailyViews,
    dailyBookings: dailyBooking,
  });
});

const getHotelVisitorsByDays = (vistorData) => {
  const dailyViews = vistorData.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const day = date.getDate();

    if (!accumulator[day]) {
      accumulator[day] = 0;
    }

    accumulator[day] += 1;

    return accumulator;
  }, {});

  return dailyViews;
};

const getHotelBookingByDays = (bookingData) => {
  const dailyBooking = bookingData.reduce((accumulator, item) => {
    const date = new Date(item.createdAt);
    const day = date.getDate();

    if (!accumulator[day]) {
      accumulator[day] = 0;
    }

    accumulator[day] += 1;

    return accumulator;
  }, {});

  return dailyBooking;
};

const getRandomIncome = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const getNumberOfBookingByMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const month = req.query.month;

    const { previousMonth, previousYear } = getPreviousMonthAndPreviousYear(
      month,
      currentYear
    );

    let fluctuations = 0;

    // Get booking data this month
    const bookingData = await Booking.find({
      $or: [
        {
          $and: [
            { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
            { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
          ],
        },
        {
          $and: [
            { $expr: { $eq: [{ $month: "$createdAt" }, previousMonth] } },
            { $expr: { $eq: [{ $year: "$createdAt" }, previousYear] } },
          ],
        },
      ],
    }).populate({
      path: "hotelId",
      select: "_id",
      populate: {
        path: "hotelType",
        select: "hotelType",
      },
    });

    // Filter out the booking data for this month and the previous month
    const numberOfBookingThisMonth = bookingData.filter((booking) => {
      return (
        booking.createdAt.getMonth() + 1 == month &&
        booking.createdAt.getFullYear() == currentYear
      );
    });

    const numberOfBookingPreviousMonth = bookingData.filter((booking) => {
      return (
        booking.createdAt.getMonth() + 1 == month - 1 &&
        booking.createdAt.getFullYear() == previousYear
      );
    });

    // Calculate how many percent increased or decreased compare this month to previous month
    if (numberOfBookingPreviousMonth.length != 0) {
      fluctuations =
        ((numberOfBookingThisMonth.length -
          numberOfBookingPreviousMonth.length) /
          numberOfBookingPreviousMonth.length) *
        100;
    }

    // Get total booking of each date booking
    const dailyBooking = getHotelBookingByDays(numberOfBookingThisMonth);
    const trendingBooking = getBookingTrending(numberOfBookingThisMonth);

    return {
      numberOfBooking: {
        total: numberOfBookingThisMonth.length,
        fluctuations: fluctuations,
      },
      dailyBooking,
      trendingBooking,
      numberOfPayment: {
        total: numberOfBookingThisMonth.length,
        fluctuations: fluctuations,
      },
    };
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getPreviousMonthAndPreviousYear = (month, currentYear) => {
  // Get booking data for the previous month
  let previousMonth = month - 1;
  let previousYear = currentYear;
  if (previousMonth === 0) {
    // Adjust for January, set previous month to December of the previous year
    previousMonth = 12;
    previousYear = currentYear - 1;
  }

  return { previousMonth, previousYear };
};

const getBookingTrending = (bookingData) => {
  console.log(bookingData[0]);

  const trendingBooking = bookingData.reduce((accumulator, item) => {
    const hotelType = item.hotelId.hotelType.hotelType;

    if (!accumulator[hotelType]) {
      accumulator[hotelType] = 0;
    }

    accumulator[hotelType] += 1;

    return accumulator;
  }, {});

  return trendingBooking;
};

const getNumberOfVisitorByMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const month = req.query.month;
    let fluctuations = 0;

    const { previousMonth, previousYear } = getPreviousMonthAndPreviousYear(
      month,
      currentYear
    );

    // Get number of visitors this month
    const numberOfVisitorsThisMonth = await PageView.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      ],
    });

    // Get number of visitors previous month
    const numberOfVisitorsPreviousMonth = await PageView.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, previousMonth] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, previousYear] } },
      ],
    });

    console.log(numberOfVisitorsPreviousMonth);

    // calculate the fluctuations between 2 months
    if (numberOfVisitorsPreviousMonth != 0) {
      fluctuations =
        ((numberOfVisitorsThisMonth - numberOfVisitorsPreviousMonth) /
          numberOfVisitorsPreviousMonth) *
        100;
    }

    return {
      numberOfVisitors: {
        total: numberOfVisitorsPreviousMonth,
        fluctuations: fluctuations,
      },
    };
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getNumberOfRatingByMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const month = req.query.month;
    let fluctuations = 0;

    // Get number of visitors this month
    const numberOfReviewThisMonth = await Review.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      ],
    });

    const { previousMonth, previousYear } = getPreviousMonthAndPreviousYear(
      month,
      currentYear
    );

    // Get number of visitors previous month
    const numberOfReviewPreviousMonth = await Review.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, previousMonth] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, previousYear] } },
      ],
    });

    // calculate the fluctuations between 2 months
    if (numberOfReviewPreviousMonth != 0) {
      fluctuations =
        ((numberOfReviewThisMonth - numberOfReviewPreviousMonth) /
          numberOfReviewPreviousMonth) *
        100;
    }

    return {
      numberOfRating: {
        total: numberOfReviewPreviousMonth,
        fluctuations: fluctuations,
      },
    };
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getNumberOfUserRegisteredByMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const month = req.query.month;
    let fluctuations = 0;

    // Get number of visitors this month
    const numberOfNewUserThisMonth = await User.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      ],
    });

    const { previousMonth, previousYear } = getPreviousMonthAndPreviousYear(
      month,
      currentYear
    );

    // Get number of visitors previous month
    const numberOfNewUserPreviousMonth = await User.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, previousMonth] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, previousYear] } },
      ],
    });

    // calculate the fluctuations between 2 months
    if (numberOfNewUserPreviousMonth != 0) {
      fluctuations =
        ((numberOfNewUserThisMonth - numberOfNewUserPreviousMonth) /
          numberOfNewUserPreviousMonth) *
        100;
    }

    return {
      numberOfNewUser: {
        total: numberOfNewUserThisMonth,
        fluctuations: fluctuations,
      },
    };
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getReportData = async (req, res, next) => {
  try {
    const reports = Reports.find().populate([
      { path: "hotelId", select: "hotelName" },
      { path: "user", select: "username subName name avatar" },
    ]);

    return reports;
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const extractArray = (obj) => {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  return [keys, values];
};

module.exports = {
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
};
