const jwt = require("jsonwebtoken");
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

module.exports = { generateAccessToken, generateRefreshToken, expireTokens };
