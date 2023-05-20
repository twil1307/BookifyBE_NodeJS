const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (userObj) => {
  const accessToken = jwt.sign(
    { _id: userObj._id, role: userObj.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5s", //access token expirate in 10m
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

module.exports = { generateAccessToken, generateRefreshToken };
