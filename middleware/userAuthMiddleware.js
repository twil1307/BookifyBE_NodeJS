require("dotenv").config();
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const Hotel = require("../models/Hotel");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isExactUser = catchAsync(async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.params.userId);
  const userObjId = req.user._id;

  if (!userId.equals(userObjId)) {
    return res
      .status(401)
      .json({ error: "You are not authorized to access this" });
  } else {
    next();
  }
});

const hasRole = (...role) => {
  return (req, res, next) => {
    const currentUserRole = req.user.role;
    if (role.includes(currentUserRole)) {
      next();
    } else {
      return res.status(401).json({
        error: "You are not authorized to access this",
      });
    }
  };
};

const isExactHost = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const userId = req.user._id;

  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    return res.status(404).json({ error: "Hotel not found" });
  }

  if (!userId.equals(hotel.user)) {
    return res
      .status(401)
      .json({ error: "You are not authorized to access this" });
  } else {
    next();
  }
});

const isUserAvailable = catchAsync(async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next();
    }

    const token = refreshToken.replace("Refresh ", "");

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return next();
      }

      const idFind = decoded._id;

      User.findOne({ _id: idFind })
        .select("-password")
        .then((user) => {
          if (user) {
            req.user = user;
            return next();
          } else {
            return next();
          }
        })
        .catch((err) => {
          next();
        });
    });
  } catch (error) {
    return next();
  }
});

module.exports = { isExactUser, hasRole, isExactHost, isUserAvailable };
