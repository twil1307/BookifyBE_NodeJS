const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const amenitySchema = new Schema(
  {
    amenityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    amenityName: {
      type: String,
      required: true,
    },
    amenityTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AmenityType",
    },
    icon: {
      type: String,
      required: true,
    },

    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Amenity", amenitySchema);
