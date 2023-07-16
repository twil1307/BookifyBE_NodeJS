var express = require("express");
var router = express.Router();
const dashboardController = require("../controller/dashboard.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole, isExactHost } = require("../middleware/userAuthMiddleware");
const {
  hotelImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");
const { isExactHotelHost } = require("../middleware/reviewQualify");
const Roles = require("../enum/Role");

// get a hotel income per month (host)
router.get(
  "/hotels/manage/income/:hotelId",
  jwtMiddleware,
  isExactHost,
  hasRole(Roles.HOST, Roles.ADMIN),
  dashboardController.getHotelIncomeMonths
);

// Should be included in 1 route only?
router.get(
  "/hotels/manage/booking/:hotelId",
  jwtMiddleware,
  isExactHost,
  hasRole(Roles.HOST, Roles.ADMIN),
  dashboardController.getHotelBookingAll
);

router.get(
  "/hotels/manage/booking/today/:hotelId",
  jwtMiddleware,
  isExactHost,
  hasRole(Roles.HOST, Roles.ADMIN),
  dashboardController.getHotelBookingToday
);

router.get(
  "/hotels/manage/details/:hotelId",
  jwtMiddleware,
  isExactHost,
  hasRole(Roles.HOST, Roles.ADMIN),
  dashboardController.getHotelDetailsInfo
);

router.get(
  "/income",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  dashboardController.getDashBoardDetailsInfo
);

router.get(
  "/exchange",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  dashboardController.getDashBoardExchangeInfo
);

// get all hotel (admin?)
router.get(
  "/hotels",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  dashboardController.getAllHotelsDashBoard
);

router.put(
  "/hotels/verify/:hotelId",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  dashboardController.verifyHotel
);

router.put(
  "/hotels/disable/:hotelId",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  dashboardController.disableHotel
);

module.exports = router;
