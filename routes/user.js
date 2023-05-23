var express = require("express");
var router = express.Router();
const testMiddleware = require("../middleware/testMiddleware");
const testController = require("../controller/test.controller");
const userController = require("../controller/user.controller");
const userMiddleware = require("../middleware/jwtMiddleware");
const {
  userImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const isExactUser = require("../middleware/isExactUser");

/* GET home page. */
router.get("/:userId", formDataRetrieve.none(), userController.getUser);

// signup new user
router.post("/", formDataRetrieve.none(), userController.signUpUser);

// update user info
router.put(
  "/:userId",
  jwtMiddleware,
  isExactUser,
  userImageUploaderLocal.single("avatar"),
  userController.updateUser
);

// login
router.post("/login", formDataRetrieve.none(), userController.logIn);

// refresh new access and refresh token after access token expired
router.post("/refresh", userController.refreshNewTokens);

// compare password
router.put(
  "/compareCurrentPassword/:userId",
  jwtMiddleware,
  isExactUser,
  formDataRetrieve.none(),
  userController.compareCurrentPassword
);

// compare password
router.put(
  "/changePassword/:userId",
  jwtMiddleware,
  isExactUser,
  formDataRetrieve.none(),
  userController.changePassword
);

module.exports = router;
