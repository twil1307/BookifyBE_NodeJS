var express = require("express");
var router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { hasRole } = require("../middleware/userAuthMiddleware");
const amenityController = require("../controller/amenity.controller");
const { userImageUploaderLocal } = require("../service/uploadImg");
const Roles = require("../enum/Role");

router.post(
  "/type",
  userImageUploaderLocal.none(),
  jwtMiddleware,
  hasRole(Roles.ADMIN, Roles.USER),
  amenityController.signNewAmenityType
);

router.get(
  "/type",
  jwtMiddleware,
  hasRole(Roles.ADMIN, Roles.USER),
  amenityController.getAllAmenityType
);

router.get(
  "/",
  jwtMiddleware,
  hasRole(Roles.ADMIN, Roles.USER),
  amenityController.getAllAmenities
);

module.exports = router;
