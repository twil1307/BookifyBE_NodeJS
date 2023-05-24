const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
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
  },
  backgroundImg: {
    type: String,
    required: [true, "backgroundImg required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAllowPet: {
    type: Boolean,
    default: false,
  },
  isHasCamera: {
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
  averagePirce: {
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
  images: {
    type: {
      imagesPath: { type: String, required: true },
      imagesType: { type: Number, required: true },
    },
    required: false,
  },
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
  bookmarkedBy: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  ],
  signAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Hotel", hotelSchema);
