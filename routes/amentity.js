var express = require("express");
var router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole } = require("../middleware/userAuthMiddleware");
const amenityController = require("../controller/amenity.controller");
const { userImageUploaderLocal } = require("../service/uploadImg");

router.post(
  "/type",
  userImageUploaderLocal.none(),
  jwtMiddleware,
  hasRole(3),
  amenityController.signNewAmenityType
);

module.exports = router;
