const PageView = require("../models/PageView");
const catchAsync = require("../utils/catchAsync");

const countPageViews = catchAsync(async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId; // Extract the URL from the request

    // Save the page view data to the database
    await PageView.create({ hotelId });

    console.log("Viewed");

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.log(error);
  }
});

module.exports = { countPageViews };
