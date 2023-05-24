var express = require("express");
var router = express.Router();
const hotelController = require("../controller/hotel.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole } = require("../middleware/userAuthMiddleware");
const {
  hotelImageUploader,
  formDataRetrieve,
} = require("../service/uploadImg");

// Create new hotel with role admin
router.post(
  "/",
  jwtMiddleware,
  hasRole(3),
  hotelImageUploader.single("backgroundImage"),
  hotelImageUploader.array("hotelImage", 5),
  hotelImageUploader.array("viewImage", 5),
  formDataRetrieve.none(),
  (req, res) => {
    return res.json({ message: "Hello" });
  }
);

router.post(
  "/type",
  formDataRetrieve.none(),
  jwtMiddleware,
  hasRole(3),
  hotelController.signNewHotelType
);

module.exports = router;
