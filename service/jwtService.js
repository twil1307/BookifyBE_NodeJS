const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const cookie = require("cookie");

const generateAccessToken = (userObj) => {
  const accessToken = jwt.sign(
    { _id: userObj._id, role: userObj.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m", //access token expirate in 10m
    }
  );
  return accessToken;
};

const generateRefreshToken = (userObj) => {
  const refreshToken = jwt.sign(
    { _id: userObj._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } //refresh token expirate in 10m
  );
  return refreshToken;
};

const verifyToken = async (accessToken) => {
  const token = accessToken.replace("Bearer ", "");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return null;
    }

    const idFind = decoded._id;

    User.findOne({ _id: idFind })
      .select("-password")
      .then((user) => {
        if (user) {
          console.log(user);
          return user;
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

// Clear the cookie by setting an expired token value and past expiration date
const expireTokens = [
  cookie.serialize("accessToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    secure: false, // Set to true if using HTTPS
    sameSite: "strict",
  }),
  cookie.serialize("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    secure: false, // Set to true if using HTTPS
    sameSite: "strict",
  }),
];

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  expireTokens,
};
