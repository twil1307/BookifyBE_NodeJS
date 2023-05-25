const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelTypeSchema = new Schema({
  hotelTypeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  hotelType: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },

  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("HotelType", hotelTypeSchema);
