var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// Database configuration ----------------------------
require("./config/database");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Router require ------------------------------------------
var indexRouter = require("./routes/test");

app.use("/test", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Running application
app.listen(process.env.DEV_PORT, process.env.DEV_HOSTNAME, () => {
  console.log(
    `Server running at http://${process.env.DEV_HOSTNAME}:${process.env.DEV_PORT}`
  );
});

module.exports = app;
