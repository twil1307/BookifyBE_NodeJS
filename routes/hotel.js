var express = require("express");
var router = express.Router();
const hotelController = require("../controller/hotel.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole } = require("../middleware/userAuthMiddleware");
const {
  hotelImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");

// Create new hotel with role admin
router.post(
  "/",
  jwtMiddleware,
  hasRole(3),
  hotelImageUploaderLocal.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "hotelImage", maxCount: 5 },
    { name: "viewImage", maxCount: 5 },
  ]),
  hotelController.signNewHotel
);

router.post(
  "/type",
  formDataRetrieve.none(),
  jwtMiddleware,
  hasRole(3),
  hotelController.signNewHotelType
);

module.exports = router;
