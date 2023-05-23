var express = require("express");
var router = express.Router();
const testMiddleware = require("../middleware/testMiddleware");
const testController = require("../controller/test.controller");
const jwtMiddleware = require("../middleware/jwtMiddleware");

/* GET home page. */
router.get("/test", jwtMiddleware, testController.sayHello);

module.exports = router;
