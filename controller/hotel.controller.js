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
    // let roomTypeSign = new RoomType(req.body);
    const {
      roomPrice,
      bedType,
      bedNum,
      bathroomType,
      bathNum,
      roomNum,
      maxGuest,
      bedroomNum,
      isbathPrivate,
      ...rest
    } = req.body;

    let roomTypeSign = {
      roomPrice,
      bedType,
      bedNum,
      bathroomType,
      bathNum,
      maxGuest,
      bedroomNum,
      isbathPrivate,
    };

    console.log(roomTypeSign);

    const hotelAmenitySign = JSON.parse(req.body.amenities);

    // pushing data to Hotel missing data
    hotelSign.userId = req.user._id;
    hotelSign.backgroundImg = backgroundImage;
    hotelImages.forEach((element) => {
      hotelSign.images.push(element);
    });
    viewImages.forEach((element) => {
      hotelSign.images.push(element);
    });

    // get new amenities which is not existed in the DB
    const newAmenities = await getAmenitiesInsertNotDuplicate(hotelAmenitySign);

    // get list id of existed amenties in DB
    const listExistedAmenitiesAdd = await getListAmenityDuplicatedId(
      hotelAmenitySign,
      newAmenities
    );

    // Add new amenities (not existed) return ID
    const newAmenitiesId = await addNewAmenityNotExisted(newAmenities, session);

    // Pass existed amenities ids and new amenities ids
    hotelSign.hotelAmenities = [...listExistedAmenitiesAdd, ...newAmenitiesId];

    // add new roomtype
    const roomsData = Array.from({ length: roomNum }, () => {
      return roomTypeSign;
    });

    const listRoomId = await addNewRoomType(roomsData, session);

    hotelSign.roomType = [...listRoomId];

    // Saving new hotel
    const hotelSignComplete = await hotelSign.save();

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Sign up new Hotel successfully",
      data: {
        hotel: hotelSignComplete,
      },
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();

    session.endSession();

    if (error.code === 11000) {
      return res.status(401).json({
        message: "Hotel name is existed",
      });
    } else {
      return res.status(401).json({
        message: error.message,
      });
    }
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
  const newListName = listAmenityDuplicated.map(
    (element) => element.amenityName
  );

  const duplicatedObjArr = hotelAmenitySign.filter((item) => {
    return !newListName.includes(item.amenityName);
  });

  const duplicatedName = duplicatedObjArr.map((item) => item.amenityName);

  const listId = await Amenity.find({
    amenityName: { $in: duplicatedName },
  }).select("_id");

  return listId;
};

const addNewAmenityNotExisted = async (newAmenities, session) => {
  const listId = await Amenity.insertMany(newAmenities, {
    rawResult: true,
    session,
  });

  return Object.values(listId.insertedIds);
};

const addNewRoomType = async (listRoomType, session) => {
  const listId = await RoomType.insertMany(listRoomType, {
    rawResult: true,
    session,
  });

  return Object.values(listId.insertedIds);
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
