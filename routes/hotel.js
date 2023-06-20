var express = require("express");
var router = express.Router();
const hotelController = require("../controller/hotel.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole, isExactHost } = require("../middleware/userAuthMiddleware");
const {
  hotelImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");
const { isUserEverStayHere } = require("../middleware/reviewQualify");
const Roles = require("../enum/Role");

router.get("/test", (req, res, next) => {
  console.log(JSON.parse(req.query.p));  
  return res.json("Ok hup'");
})

// Create new hotel with role admin
router.post(
  "/",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  hotelImageUploaderLocal.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "hotelImage", maxCount: 5 },
    { name: "viewImage", maxCount: 5 },
  ]),
  hotelController.signNewHotel
);

// create hotel type
router.post(
  "/type",
  formDataRetrieve.none(),
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  hotelController.signNewHotelType
);

// Get specific hotel
router.get("/:hotelId", hotelController.getHotel);

// update hotel
router.put(
  "/:hotelId",
  jwtMiddleware,
  hasRole(Roles.ADMIN, Roles.HOST),
  isExactHost,
  hotelImageUploaderLocal.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "hotelImage", maxCount: 5 },
    { name: "viewImage", maxCount: 5 },
  ]),
  hotelController.updateHotel
);

// get all hotel
router.get("/", hotelController.getAllHotels);

// delete hotel
router.delete(
  "/:hotelId",
  jwtMiddleware,
  hasRole(Roles.ADMIN),
  hotelController.deleteHotel
);

// review hotel
router.post(
  "/:hotelId/review",
  formDataRetrieve.none(),
  jwtMiddleware,
  isUserEverStayHere,
  hotelController.reviewHotel
);

module.exports = router;
