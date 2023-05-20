var express = require("express");
var router = express.Router();
const testMiddleware = require("../middleware/testMiddleware");
const testController = require("../controller/test.controller");
const userController = require("../controller/user.controller");
const userMiddleware = require("../middleware/jwtMiddleware");

/* GET home page. */
router.get("/", testMiddleware, testController.sayHello);

router.post("/", userController.signUpUser);
router.put("/", userController.updateUser);
router.post("/login", userController.logIn);
router.post("/refresh", userController.refreshNewTokens);

module.exports = router;
