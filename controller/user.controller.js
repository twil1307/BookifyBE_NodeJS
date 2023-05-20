const User = require("../models/User");
const { hashPassword, comparePassword } = require("../service/passwordService");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../service/jwtService");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.signUpUser = async (req, res) => {
  try {
    // check existed user
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(422).json({ error: "Username already exists" });
    }

    // Hash user password
    const userObj = new User(req.body);
    const hashedPassword = await hashPassword(userObj.password);
    userObj.password = hashedPassword;

    // Save user
    await userObj.save();
    return res.status(200).json({
      message: "User saved successfully",
    });
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateUser = (req, res) => {
  const userObj = new User(req.body);

  User.findOne({ _id: req._id })
    .then((user) => {
      return res.json(user);
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};

module.exports.logIn = (req, res) => {
  const userObj = new User(req.body);

  User.findOne({ username: userObj.username })
    .then((user) => {
      if (user) {
        comparePassword(userObj.password, user.password)
          .then((result) => {
            console.log(result);
            if (!result) {
              return res.status(422).json({
                error: "Password is incorrect",
              });
            } else {
              const accessToken = generateAccessToken(user);
              const refreshToken = generateRefreshToken(user);

              return res
                .status(200)
                .cookie("accessToken", "Bearer " + accessToken, {
                  httpOnly: true,
                  secure: false,
                })
                .cookie("refreshToken", "Refresh " + refreshToken, {
                  httpOnly: true,
                  secure: false,
                })
                .json({
                  message: "Login successfully",
                  user: {
                    _id: user._id,
                    role: user.role,
                    username: user.username,
                    displayName: user.subname + user.name,
                  },
                });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        return res.status(422).json({
          error: "No user found",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};

module.exports.refreshNewTokens = (req, res, next) => {
  const { refreshToken } = req.cookies;

  console.log(refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ error: "Login again" });
  }

  const token = refreshToken.replace("Refresh ", "");

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: err.message });
    }

    const idFind = decoded._id;

    User.findOne({ _id: idFind })
      .then((user) => {
        if (user) {
          return user;
        } else {
          return res.status(422).json({ error: "Token not verified 3" });
        }
      })
      .then((user) => {
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        return res
          .status(200)
          .cookie("accessToken", "Bearer " + newAccessToken, {
            httpOnly: true,
            secure: false,
          })
          .cookie("refreshToken", "Refresh " + newRefreshToken, {
            httpOnly: true,
            secure: false,
          })
          .json({
            message: "Retrieve new token successfully",
          });
      })
      .catch((err) => {
        console.log("haha");
        console.log(err);
      });
  });
};
