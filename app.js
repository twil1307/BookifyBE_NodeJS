var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
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
    origin: process.env.FRONTEND_URL ?? "http://localhost:*",
    optionsSuccessStatus: 200,
  })
);

// Router require ------------------------------------------
var amenityRouter = require("./routes/amentity");
var dashboardRouter = require("./routes/dashboard");
var hotelRouter = require("./routes/hotel");
var userRouter = require("./routes/user");

app.use("/amenity", amenityRouter);
app.use("/dashboard", dashboardRouter);
app.use("/hotel", hotelRouter);
app.use("/user", userRouter);

const Demo = require("./models/Demo");
app.use("/demo", (req, res, next) => {
  const urlString = req.url;
  const parsedUrl = new URL(urlString, `http://${req.headers.host}`);
  const queryParams = parsedUrl.searchParams;

  const paramsObject = Object.fromEntries(queryParams.entries());

  console.log(paramsObject);

  const schema1Object = new Demo(paramsObject);

  console.log(schema1Object);

  res.json(schema1Object);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
