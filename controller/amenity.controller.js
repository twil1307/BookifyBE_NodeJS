const Amenity = require("../models/Amenity");
const AmenityType = require("../models/AmenityType");
const catchAsync = require("../utils/catchAsync");
require("dotenv").config();

module.exports.signNewAmenityType = catchAsync(async (req, res) => {
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
});

module.exports.getAllAmenityType = catchAsync(async (req, res, next) => {
  const allAmenityTypes = await AmenityType.find({});

  return res.status(200).json({
    amenityTypes: allAmenityTypes,
  });
});

module.exports.getAllAmenities = catchAsync(async (req, res, next) => {
  const allAmenities = await Amenity.find({});

  return res.status(200).json({
    amenities: allAmenities,
  });
});
