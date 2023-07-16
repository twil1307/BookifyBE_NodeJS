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
  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
  },
});

module.exports = mongoose.model("Room", roomSchema);
