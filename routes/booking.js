var express = require("express");
var router = express.Router();
const bookingController = require("../controller/booking.controller");
const {
  userImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { isExactUser } = require("../middleware/userAuthMiddleware");
const Booking = require("../models/Booking");
const catchAsync = require("../utils/catchAsync");

/* GET user */
// router.get("/:userId", formDataRetrieve.none(), userController.getUser);

// booking a room
router.post(
  "/",
  jwtMiddleware,
  formDataRetrieve.none(),
  bookingController.bookingRoom
);

module.exports = router;
