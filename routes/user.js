var express = require("express");
var router = express.Router();
const userController = require("../controller/user.controller");
const {
  userImageUploaderLocal,
  formDataRetrieve,
} = require("../service/uploadImg");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { isExactUser } = require("../middleware/userAuthMiddleware");

// update user banking account
router.put(
  "/bankingAccount",
  jwtMiddleware,
  formDataRetrieve.none(),
  userController.updateUserBankingAccount
);

// Get user money ammount
router.get("/amount", jwtMiddleware, userController.getUserRemainingAmount);

router.get(
  "/bookingHistory",
  jwtMiddleware,
  userController.getUserBookingHistory
);

/* GET user */
router.get("/:userId", formDataRetrieve.none(), userController.getUser);

// signup new user
router.post("/", formDataRetrieve.none(), userController.signUpUser);

// update user info
router.put(
  "/",
  jwtMiddleware,
  userImageUploaderLocal.single("avatar"),
  userController.updateUser
);

// verify jwt token
router.post("/verifyjwt", userController.verifyJwtToken);

// login
router.post("/login", formDataRetrieve.none(), userController.logIn);

router.post("/logout", formDataRetrieve.none(), userController.logOut);

// refresh new access and refresh token after access token expired
router.post("/refresh", userController.refreshNewTokens);

// compare password
router.post(
  "/compareCurrentPassword",
  jwtMiddleware,
  formDataRetrieve.none(),
  userController.compareCurrentPassword
);

// change password
router.put(
  "/changePassword",
  jwtMiddleware,
  formDataRetrieve.none(),
  userController.changePassword
);

// add favorites
router.put(
  "/favorite/:hotelId",
  jwtMiddleware,
  userController.addOrRemoveFavorite
);

module.exports = router;
