var express = require("express");
var router = express.Router();
const dashboardController = require("../controller/dashboard.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole, isExactHost } = require("../middleware/userAuthMiddleware");
const {
  hotelImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");
const { isUserEverStayHere } = require("../middleware/reviewQualify");
const Roles = require("../enum/Role");

// get all hotel (admin?)
router.get(
  "/hotels",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  dashboardController.getAllHotelsDashBoard
);

// get a hotel income per month (host)
router.get(
  "/hotels/months/income",
  jwtMiddleware,
  formDataRetrieve.none(),
  hasRole(Roles.HOST, Roles.ADMIN),
  dashboardController.getHotelIncomePerMonth
);

module.exports = router;
