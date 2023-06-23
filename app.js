var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const globalErrorHandler = require("./utils/globalErrorHandler");
require("dotenv").config();

// Database configuration ----------------------------
require("./config/database");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

// Router require ------------------------------------------
var amenityRouter = require("./routes/amentity");
var dashboardRouter = require("./routes/dashboard");
var hotelRouter = require("./routes/hotel");
var userRouter = require("./routes/user");
var bookingRouter = require("./routes/booking");
var dashboardRouter = require("./routes/dashboard");
const AppError = require("./utils/appError");

// Count page visitor

app.use("/amenity", amenityRouter);
app.use("/dashboard", dashboardRouter);
app.use("/hotel", hotelRouter);
app.use("/user", userRouter);
app.use("/booking", bookingRouter);
app.use("/dashboard", dashboardRouter);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  // next(createError(404));
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error handler
app.use(globalErrorHandler);

module.exports = app;
