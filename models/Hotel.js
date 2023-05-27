const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = new Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    hotelType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "HotelType",
    },
    hotelName: {
      type: String,
      required: [true, "hotelName required"],
      unique: true,
    },
    backgroundImg: {
      type: String,
      required: [true, "backgroundImg required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAnimalAccept: {
      type: Boolean,
      default: false,
    },
    isCamera: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description required"],
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
    averagePrice: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    hotelAmenities: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Amenity",
    },
    images: [
      {
        type: {
          imagePath: { type: String, required: true },
          imageType: { type: Number, required: true },
        },
      },
    ],
    reviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "HotelType",
    },
    roomType: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "RoomType",
      },
    ],
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hotel", hotelSchema);
