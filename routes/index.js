var express = require("express");
var app = express();

var indexRouter = require("./test");

app.use("/test", indexRouter);
// app.use("/", userRouter);
// app.use("/", hotelRouter);

module.exports = app;
