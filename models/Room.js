const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
});

module.exports = mongoose.model("Room", roomSchema);
