const User = require("../models/User");
const { hashPassword, comparePassword } = require("../service/passwordService");
const {
  generateAccessToken,
  generateRefreshToken,
  expireTokens,
} = require("../service/jwtService");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

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

module.exports.updateUser = async (req, res) => {
  try {
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

    User.findByIdAndUpdate(userId, userObj, { new: true })
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });

    // return res.status(200).json({ userObj });
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: error.message });
  }
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
                    displayName: `${user.subName} ${user.name}`,
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

module.exports.compareCurrentPassword = async (req, res) => {
  try {
    // Hash user password
    const passwordPlain = req.body.currentPassword;

    const { password } = await User.findById(req.user._id).select("password");

    const compareRes = await comparePassword(passwordPlain, password);

    if (compareRes) {
      return res.status(202).json({
        message: "Password matched",
      });
    } else {
      return res.status(401).json({
        message: "Wtf, who tf",
      });
    }
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.changePassword = async (req, res) => {
  try {
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

      return res
        .status(200)
        .json({ message: "Passwords updated successfully" });
    } else {
      return res.status(500).json({ message: "Passwords updated failed" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
