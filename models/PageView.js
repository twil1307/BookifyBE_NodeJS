const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pageViewSchema = new Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PageView", pageViewSchema);
