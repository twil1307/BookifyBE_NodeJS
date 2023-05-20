const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "Invalid authorization - Please log in 1" });
    }

    const token = accessToken.replace("Bearer ", "");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: err.message });
      }

      const idFind = decoded._id;

      User.findOne({ _id: idFind })
        .then((user) => {
          if (user) {
            req.user = user;
            return next();
          } else {
            return res.status(422).json({ error: "Token not verified 3" });
          }
        })
        .catch((err) => {
          console.log("haha");
          console.log(err);
        });
    });
  } catch (error) {
    console.log("error here");
    return res.json({ error: error });
  }
};
