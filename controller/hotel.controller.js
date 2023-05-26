const Hotel = require("../models/Hotel");
const HotelType = require("../models/HotelType");
const Amenity = require("../models/Amenity");
const RoomType = require("../models/RoomType");
require("dotenv").config();
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports.signNewHotel = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // get image paths only
    const backgroundImage = req.files["backgroundImage"][0].path
      .split("public")[1]
      .replaceAll("\\", "/");
    const hotelImages = req.files["hotelImage"].map(({ path }) => ({
      imagePath: path.split("public")[1].replaceAll("\\", "/"),
      imageType: 1,
    }));
    const viewImages = req.files["viewImage"].map(({ path }) => ({
      imagePath: path.split("public")[1].replaceAll("\\", "/"),
      imageType: 2,
    }));

    // parse data
    const hotelSign = new Hotel(req.body);
    const roomTypeSign = new RoomType(req.body);
    const hotelAmenitySign = JSON.parse(req.body.amenities);
    const hotelAmenitiesName = hotelAmenitySign.map(
      (amenity) => amenity.amenityName
    );

    // pushing data to Hotel missing data
    hotelSign.userId = req.user._id;
    hotelSign.backgroundImg = backgroundImage;
    hotelImages.forEach((element) => {
      hotelSign.images.push(element);
    });
    viewImages.forEach((element) => {
      hotelSign.images.push(element);
    });

    // Insert amenities
    // const newAmenities = await Amenity.insertMany(hotelAmenitySign);
    const listFilterAmenities = await getAmenitiesInsertNotDuplicate(
      hotelAmenitySign
    );

    console.log(listFilterAmenities);

    const listExistedAmenitiesAdd = await getListAmenityDuplicatedId(
      hotelAmenitySign,
      listFilterAmenities
    );

    console.log(listExistedAmenitiesAdd);

    // Check existed amenities
    // if (listFilterAmenities.length == 0) {
    //   let listAmenityExisted = hotelAmenitiesName
    //     .map((element) => element.amenityName)
    //     .join(", ");

    //   return next(
    //     new AppError(`Amenity ${listAmenityExisted} is already defined`, 403)
    //   );
    // }

    // Insert new non-duplicate amenities
    // const insertedAmenities = await Amenity.insertMany(listFilterAmenities);

    // if (!insertedAmenities) {
    //   return next(new AppError(`Insert amenity failed`, 500));
    // }

    // console.log(insertedAmenities);

    // // get id from inserted amenity
    // const amenitiesIdAdded = insertedAmenities.map((amenity) => amenity._id);
    // hotelSign.hotelAmenities = [...amenitiesIdAdded];

    session.endSession();

    // Saving
    return res.status(200).json({
      message: "Success",
      data: {
        hotel: hotelSign,
        hotelAmenity: hotelAmenitySign,
        roomType: roomTypeSign,
      },
    });
  } catch (error) {
    console.log(error);
    // Handle the error here
    await session.abortTransaction();

    session.endSession();

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAmenitiesInsertNotDuplicate = async (hotelAmenitySign) => {
  // Find existing amenities with the same names
  const existingAmenityNames = await Amenity.distinct("amenityName", {
    amenityName: { $in: hotelAmenitySign.map((a) => a.amenityName) },
  });

  // Filter out new amenities that are duplicates
  const filteredAmenities = await hotelAmenitySign.filter(
    (a) => !existingAmenityNames.includes(a.amenityName)
  );

  return filteredAmenities;
};

const getListAmenityDuplicatedId = async (
  hotelAmenitySign,
  listAmenityDuplicated
) => {
  const duplatedListName = listAmenityDuplicated.map(
    (element) => element.amenityName
  );
  console.log(duplatedListName);

  const newArr = hotelAmenitySign.filter((item) => {
    return !duplatedListName.includes(item.amenityName);
  });

  console.log(newArr);

  return newArr;
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
