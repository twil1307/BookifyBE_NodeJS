require("dotenv").config();
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");

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

const hasRole = (role) => {
  return (req, res, next) => {
    const currentUserRole = req.user.role;
    if (currentUserRole === role) {
      next();
    } else {
      return res.status(401).json({
        error: "You are not authorized to access this",
      });
    }
  };
};

module.exports = { isExactUser, hasRole };
