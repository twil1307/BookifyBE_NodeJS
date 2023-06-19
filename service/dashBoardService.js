const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const PageView = require("../models/PageView");
const User = require("../models/User");
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

const getHotelRating = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const point = req.query.point;

  let reviewsList;

  if (!point) {
    reviewsList = await Review.find({ hotelId: hotelId })
      .populate({
        path: "hotelId",
        select: "hotelName backgroundImg",
      })
      .populate({
        path: "userId",
        select: "subName name avatar",
      });
  } else {
    reviewsList = await Review.find({
      $and: [{ hotelId: hotelId }, { averagePoint: point }],
    })
      .populate({
        path: "hotelId",
        select: "hotelName backgroundImg",
      })
      .populate({
        path: "userId",
        select: "subName name avatar",
      });
  }

  return res.status(200).json({
    reviews: reviewsList,
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

    let fluctuations = 0;

    // Get booking data this month
    const numberOfBookingThisMonth = await Booking.find({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      ],
    }).populate({
      path: "hotelId",
      select: "_id",
      populate: {
        path: "hotelType",
        select: "hotelType",
      },
    });

    // Get booking data previous month
    const numberOfBookingPreviousMonth = await Booking.find({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month - 1] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
      ],
    });

    // Calculate how many percent increased or decreased compare this month to previous month
    if (numberOfBookingPreviousMonth.length != 0) {
      fluctuations =
        ((numberOfBooking.length - numberOfBookingPreviousMonth.length) /
          numberOfBookingPreviousMonth.length) *
        100;
    }

    // Get total booking of each date booking
    const dailyBooking = getHotelBookingByDays(numberOfBookingThisMonth);

    return {
      numberOfBooking: {
        total: numberOfBookingThisMonth.length,
        fluctuations: fluctuations,
      },
      dailyBooking,
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

const getBookingTrending = (bookingData) => {
  const dailyViews = bookingData.reduce((accumulator, item) => {
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

const getNumberOfVisitorByMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const month = req.query.month;
    let fluctuations = 0;

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
        { $expr: { $eq: [{ $month: "$createdAt" }, month - 1] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
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

    // Get number of visitors previous month
    const numberOfReviewPreviousMonth = await Review.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month - 1] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
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

    // Get number of visitors previous month
    const numberOfNewUserPreviousMonth = await User.countDocuments({
      $and: [
        { $expr: { $eq: [{ $month: "$createdAt" }, month - 1] } },
        { $expr: { $eq: [{ $year: "$createdAt" }, currentYear] } },
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
};
