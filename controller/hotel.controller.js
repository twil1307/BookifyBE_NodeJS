const Hotel = require("../models/Hotel");
const HotelType = require("../models/HotelType");
const Amenity = require("../models/Amenity");
const RoomType = require("../models/RoomType");
require("dotenv").config();
const cookie = require("cookie");

// Start transaction
// const mongoose = require("mongoose");
// const session = await mongoose.startSession();
// session.startTransaction();

module.exports.signNewHotel = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Success",
    });

    // const hotelSign = new Hotel(req.body);
    // hotelSign.userId = req.user._id;
    // const roomTypeSign = new RoomType(req.body);
    // const hotelAmenitySign = req.body.amenities;

    // return res.status(200).json({
    //   message: "Success",
    //   data: {
    //     hotel: hotelSign,
    //     hotelAmenity: hotelAmenitySign,
    //     roomType: roomTypeSign,
    //   },
    // });
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.signNewHotelType = async (req, res) => {
  try {
    const hotelTypeSign = new HotelType(req.body);

    const newType = await hotelTypeSign.save();

    if (newType) {
      return res.status(200).json({
        message: "Sign new hotel type successfully",
        data: {
          hotelType: newType,
        },
      });
    } else {
      return res.status(500).json({
        message: "Couldn't sign new hotel type",
      });
    }
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: error.message });
  }
};
