var express = require("express");
var router = express.Router();
const testMiddleware = require("../middleware/testMiddleware");
const testController = require("../controller/test.controller");
const userController = require("../controller/user.controller");
const userMiddleware = require("../middleware/jwtMiddleware");
const { userImageUploaderLocal } = require("../service/uploadImg");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const isExactUser = require("../middleware/isExactUser");

/* GET home page. */
router.get("/", testMiddleware, testController.sayHello);

router.post("/", userController.signUpUser);
router.put(
  "/:userId",
  jwtMiddleware,
  isExactUser,
  userImageUploaderLocal.single("avatar"),
  userController.updateUser
);
router.post("/login", userController.logIn);
router.post("/refresh", userController.refreshNewTokens);

module.exports = router;
