const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User booking required"],
      ref: "User",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Room booking required"],
      ref: "RoomType",
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Hotel booking required"],
      ref: "Hotel",
    },
    price: {
      type: Number,
      required: [true, "Price required"],
    },
    checkin: {
      type: String,
      required: [true, "Check in time required"],
    },
    checkout: {
      type: String,
      required: [true, "Check out time required"],
    },
    aldult: {
      type: Number,
      default: 0,
    },
    child: {
      type: Number,
      default: 0,
    },
    infant: {
      type: Number,
      default: 0,
    },
    pet: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
