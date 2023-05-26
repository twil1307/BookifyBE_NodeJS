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
    sourceId: {
      type: Number,
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
    description: {
      type: Date,
      required: true,
      default: Data.now,
    },
    country: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    closing: {
      type: String,
      required: true,
    },
    opening: {
      type: String,
      required: true,
    },
    checkin: {
      type: String,
      required: true,
    },
    checkout: {
      type: String,
      required: true,
    },
    averagePirce: {
      type: Number,
      required: true,
    },
    rating: {
      type: Rating,
      default: 0,
    },
    hotelAmenities: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity",
    },
    images: {
      type: {
        imagesPath: { type: String, required: true },
        imagesType: { type: Number, required: true },
      },
      required: false,
    },
    selfDescription: {
      type: String,
      required: false,
    },
    salt: {
      type: String,
      required: false,
    },
    bankingAccountNumber: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
