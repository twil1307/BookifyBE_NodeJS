const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    content: {
      type: String,
      required: [true, "Content required"],
    },
    sourceId: {
      type: Number,
      default: 0,
    },
    communicationPoint: {
      type: Number,
      required: [true, "Communication point required"],
    },
    accuracyPoint: {
      type: Number,
      default: [true, "Accuracy point required"],
    },
    locationPoint: {
      type: Number,
      default: [true, "Location point required"],
    },
    valuePoint: {
      type: Number,
      default: [true, "Value point required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
