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
        console.log(err.name);
        if (err.name == "TokenExpiredError" || err.message == "jwt expired") {
          return res.status(469).json({ error: err.message });
        } else {
          return res.status(401).json({ error: err.message });
        }
      }

      const idFind = decoded._id;

      User.findOne({ _id: idFind })
        .select("-password")
        .then((user) => {
          if (user) {
            req.user = user;
            return next();
          } else {
            return res.status(401).json({ error: "User not available" });
          }
        })
        .catch((err) => {
          return res.status(401).json({ error: "User not available" });
        });
    });
  } catch (error) {
    return res.json({ error: error });
  }
};
