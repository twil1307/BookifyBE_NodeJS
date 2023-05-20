const { upload } = require("../service/uploadImg");

// Testing purpose only
module.exports.sayHello = (req, res, next) => {
  console.log("=--------=");
  console.log(req.user);

  return res.json({
    message: "req.user",
  });
};
