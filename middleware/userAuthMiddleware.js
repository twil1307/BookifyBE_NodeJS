require("dotenv").config();
const mongoose = require("mongoose");

const isExactUser = (req, res, next) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.userId);
    const userObjId = req.user._id;

    if (!userId.equals(userObjId)) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this" });
    } else {
      next();
    }
  } catch (error) {
    return res.status(404).json({
      error: "No user found",
    });
  }
};

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
