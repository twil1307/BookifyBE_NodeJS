var express = require("express");
var router = express.Router();
const testMiddleware = require("../middleware/testMiddleware");
const testController = require("../controller/test.controller");

/* GET home page. */
router.get("/", testMiddleware, testController.sayHello);

module.exports = router;
