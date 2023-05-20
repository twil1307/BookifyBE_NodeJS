require("dotenv").config();
const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.userId);
    const userObjId = req.user._id;

    console.log(userId, userObjId);

    console.log(userId);

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
