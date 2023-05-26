const User = require("../models/User");
const { hashPassword, comparePassword } = require("../service/passwordService");
const {
  generateAccessToken,
  generateRefreshToken,
  expireTokens,
} = require("../service/jwtService");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("-password");

  if (user) {
    return res.status(200).json(user);
  } else {
    return next(new AppError("User not found", 404));
  }
});

module.exports.signUpUser = catchAsync(async (req, res, next) => {
  // check existed user
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    // return res.status(422).json({ error: "Username already exists" });
    return next(new AppError("Username already exists", 422));
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
});

module.exports.updateUser = catchAsync(async (req, res, next) => {
  const file = req.file;
  let imageUrl = null;
  const userObj = req.body;
  if (file) {
    imageUrl = file.path;
    userObj.avatar = imageUrl.split("public")[1].replaceAll("\\", "/");
  }
  if (userObj.dob) {
    userObj.dob = new Date(userObj.dob).toDateString();
  }
  const userId = req.params.userId;

  const newUser = await User.findByIdAndUpdate(userId, userObj, { new: true });
  return res.status(200).json({
    user: newUser,
  });
});

module.exports.logIn = catchAsync(async (req, res, next) => {
  const userObj = new User(req.body);

  const user = await User.findOne({ username: userObj.username });

  if (user) {
    const result = await comparePassword(userObj.password, user.password);

    if (!result) {
      return next(new AppError("Password is incorrect", 403));
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
            displayName: `${user.subName} ${user.name}`,
          },
        });
    }
  } else {
    return next(new AppError("No user found", 404));
  }
});

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

module.exports.compareCurrentPassword = catchAsync(async (req, res, next) => {
  // Hash user password
  const passwordPlain = req.body.currentPassword;

  const { password } = await User.findById(req.user._id).select("password");

  const compareRes = await comparePassword(passwordPlain, password);

  if (compareRes) {
    return res.status(202).json({
      message: "Password matched",
    });
  } else {
    return next(new AppError("Password is incorrect", 401));
  }
});

module.exports.changePassword = catchAsync(async (req, res, next) => {
  const newPasword = req.body.newPassword;
  const userId = req.params.userId;

  const newHashPassword = await hashPassword(newPasword);

  const user = await User.updateOne(
    { _id: userId },
    { $set: { password: newHashPassword } }
  );

  if (user) {
    // Clear the cookie by setting an expired token value and past expiration date
    res.setHeader("Set-Cookie", expireTokens);

    return res.status(200).json({ message: "Passwords updated successfully" });
  } else {
    return next(new AppError("Passwords updated failed", 500));
  }
});
