const Amenity = require("../models/Amenity");
const AmenityType = require("../models/AmenityType");
require("dotenv").config();

module.exports.signNewAmenityType = async (req, res) => {
  try {
    const amenityType = new AmenityType(req.body);

    const findExistedAmentity = await AmenityType.findOne({
      amenityTypeName: amenityType.amenityTypeName,
    });

    if (findExistedAmentity) {
      return res.status(403).json({
        message: "Amenity name already existed",
      });
    } else {
      const newAmenityType = await amenityType.save();

      if (newAmenityType) {
        return res.status(200).json({
          message: "Sign new amenity type successfully",
          amenity: newAmenityType,
        });
      } else {
        return res.status(500).json({
          message: "Couldn't sign new hotel type",
        });
      }
    }
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: error.message });
  }
};

module.exports.getAllAmenityType = async (req, res) => {
  try {
    const allAmenities = await Amenity.find({});

    return allAmenities || [];
  } catch (error) {
    console.log(error);
    // Handle the error here
    return res.status(500).json({ error: error.message });
  }
};
