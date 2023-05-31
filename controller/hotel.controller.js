const Hotel = require("../models/Hotel");
const HotelType = require("../models/HotelType");
require("dotenv").config();
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  getAmenitiesInsertNotDuplicate,
  getListAmenityDuplicatedId,
  addNewAmenityNotExisted,
  addNewRoomType,
  retrieveNewHotelImage,
  getAveragePoint,
} = require("../service/hotelService");
const Review = require("../models/Review");

module.exports.signNewHotel = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Get image paths only for backgroundImage
    const { backgroundImage, hotelImages, viewImages } =
      retrieveNewHotelImage(req);

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

    hotelSign.roomType = [...listRoomId.flat()];

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

module.exports.getHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.hotelId)
    .populate("hotelType")
    .populate("userId", "-password -hotelBookmarked -updatedAt")
    .populate("hotelAmenities")
    .populate("roomType")
    .populate("reviews")
    .populate("rating");

  const data = await getAveragePoint(req.params.hotelId);

  hotel.rating = data;

  if (hotel) {
    return res.status(200).json(hotel);
  } else {
    return next(new AppError("Hotel not found", 404));
  }
});

module.exports.getAllHotels = catchAsync(async (req, res, next) => {
  // Get all hotels
  const hotels = await Hotel.find({ isVerified: "true" }).select(
    "hotelName country district address averagePrice rating images"
  );

  // Randomly select 3 images for each hotel
  const hotelsWithRandomImages = hotels.map((hotel) => {
    const randomImages = hotel.images
      .sort(() => 0.5 - Math.random()) // sort images array by an random way
      .slice(0, 3);
    return { ...hotel._doc, images: randomImages };
  });

  if (hotels) {
    return res.status(200).json({ hotels: hotelsWithRandomImages });
  } else {
    return next(new AppError("Hotels not found", 404));
  }
});

module.exports.reviewHotel = catchAsync(async (req, res, next) => {
  // Get all hotels
  const reviewObj = new Review(req.body);

  const hotel = await Hotel.findById(req.params.hotelId);
  if (hotel) {
    await reviewObj.save();

    hotel.reviews.push(reviewObj);

    await hotel.save();

    return res.status(200).json({ message: "Review successfully" });
  } else {
    return next(new AppError("Hotels not found", 404));
  }
});
