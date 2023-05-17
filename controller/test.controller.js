const cloudinary = require("../service/uploadImg");

// Testing purpose only
module.exports.sayHello = (req, res) => {
  return res.json({
    message: "Hello, world",
  });
};
