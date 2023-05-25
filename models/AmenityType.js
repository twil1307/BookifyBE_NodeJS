const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const amenityTypeSchema = new Schema({
  amenityTypeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  amenityTypeName: {
    type: String,
    required: true,
  },
  amenityTypeNumber: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("AmenityType", amenityTypeSchema);
