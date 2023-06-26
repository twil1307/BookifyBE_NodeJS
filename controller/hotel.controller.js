const Hotel = require("../models/Hotel");
const HotelType = require("../models/HotelType");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Room = require("../models/Room");
const Reports = require("../models/Report");

require("dotenv").config();
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fileDelete = require("../utils/fileDelete");
const { getUnavailableDateRanges } = require("../service/bookingService");
const {
  getAmenitiesInsertNotDuplicate,
  getListAmenityDuplicatedId,
  addNewAmenityNotExisted,
  addNewRooms,
  retrieveNewHotelImage,
  retrieveNewHotelImagePath,
  getAveragePoint,
} = require("../service/hotelService");
const RoomType = require("../models/RoomType");

module.exports.signNewHotel = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const imagesPath = retrieveNewHotelImagePath(req);
  try {
    // Get image paths only for backgroundImage
    const { backgroundImage, hotelImages, viewImages } =
      retrieveNewHotelImage(req);

    // parse data
    const hotelSign = new Hotel(req.body);
    // let roomTypeSign = new RoomType(req.body);
    const { roomNum, ...rest } = req.body;

    let roomTypeSign = {
      hotelId: hotelSign._id,
      ...rest,
    };

    const hotelAmenitySign = JSON.parse(
      JSON.stringify(eval(req.body.amenities))
    );

    // pushing data to Hotel missing data
    hotelSign.user = req.user._id;
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

    // add new room type
    const newRoomTypeData = new RoomType(roomTypeSign);
    const { _id, ...roomType } = newRoomTypeData;

    console.log(roomType);

    hotelSign.roomType = roomType;

    // add new room
    const listRoomId = await addNewRooms(hotelSign._id, roomNum, session);

    hotelSign.Rooms = [...listRoomId.flat()];

    console.log(hotelSign);

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

    fileDelete(imagesPath);
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
    console.log(req.body);

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

module.exports.getHotelTypes = catchAsync(async (req, res) => {
  const hotelTypes = await HotelType.find({});
  return res.status(200).json({
    types: hotelTypes,
  });
});

module.exports.getOwnerHotel = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const hotel = await Hotel.findOne({ user: userId });

  return res.status(200).json({
    hotel: hotel,
  });
});

module.exports.getHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.hotelId)
    .populate("hotelType")
    .populate({
      path: "user",
      select: "username subName name avatar createdAt",
    })
    .populate("hotelAmenities", "-createdAt -updatedAt")
    .populate("roomType")
    .populate("reviews")
    .populate("rating");

  const data = await getAveragePoint(hotel.reviews);

  hotel.rating = data;

  const bookedDate = await getUnavailableDateRanges(req.params.hotelId);

  if (hotel) {
    return res.status(200).json({ hotel: hotel, fullyBookedDates: bookedDate });
  } else {
    return next(new AppError("Hotel not found", 404));
  }
});

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

module.exports.getAllHotels = catchAsync(async (req, res, next) => {
  const DEFAULT_PAGE_LIMIT = 10;
  // Get all hotels
  const findHotelQuery = Object.keys(req.query).reduce(
    (acc, key) => {
      const queryParamValue = req.query[key];
      if (queryParamValue != null) {
        if (queryParamValue.startsWith("[")) {
          return {
            ...acc,
            $or: JSON.parse(queryParamValue).map((condition) => {
              return { [key]: condition };
            }),
          };
        } else if (key === "checkIn" || key === "checkOut" || key === "index") {
          return acc;
        } else if (key === "roomType.maxGuest") {
          return {
            ...acc,
            [key]: { $gte: parseInt(queryParamValue) },
          };
        } else {
          return {
            ...acc,
            [key]: isNaN(queryParamValue)
              ? queryParamValue
              : parseInt(queryParamValue),
          };
        }
      }

      return acc;
    },
    {
      isVerified: "true",
      // skip: req.query.index * DEFAULT_PAGE_LIMIT,
      // limit: DEFAULT_PAGE_LIMIT,
    }
  );

  let hotels = await Hotel.find(findHotelQuery)
    .sort({ createdAt: "desc" })
    .select("_id hotelName country district address roomType rating images")
    .populate({ path: "hotelAmenities" })
    .skip(req.query.index * DEFAULT_PAGE_LIMIT)
    .limit(DEFAULT_PAGE_LIMIT);

  const { checkIn, checkOut } = req.query;

  if (checkIn && checkOut) {
    console.log(checkIn, checkOut);
    const filtered = await Promise.all(
      hotels.map((hotel) =>
        getHotelsStatusWithCheckInAndCheckOut(
          hotel,
          new Date(checkIn),
          new Date(checkOut)
        )
      )
    );
    hotels = hotels.filter((_, index) => !filtered[index]);
  }

  // Randomly select 3 images for each hotel
  const hotelsWithRandomImages = hotels.map((hotel) => {
    const randomImages = hotel.images
      .sort(() => 0.5 - Math.random()) // sort images array by an random way
      .slice(0, 3);
    const { roomType, ...hotelData } = hotel._doc;

    if (req.user && req.user.hotelBookmarked.includes(hotel._id)) {
      hotelData.isBookmarked = true;
    } else {
      hotelData.isBookmarked = false;
    }

    return {
      ...hotelData,
      averagePrice: roomType.roomPrice,
      images: randomImages,
    };
  });

  if (!req.user) {
    hotelsWithRandomImages.message = "Login for better experience";
  }

  if (hotels) {
    return res.status(200).json({ hotels: hotelsWithRandomImages });
  } else {
    return next(new AppError("Hotels not found", 404));
  }
});

const getHotelsStatusWithCheckInAndCheckOut = async (
  hotel,
  checkIn,
  checkOut
) => {
  const rooms = await Room.find({
    hotelId: hotel._id,
  })
    .select("_id")
    .sort({ _id: 1 });

  const roomId = rooms.map(({ _id }) => _id);

  // Filter out _id only
  // Get all (distinct) the rooms Ids which is overlapped in the check in and check out date range
  const bookingCheck = await Booking.distinct("roomId", {
    $and: [
      {
        $or: [
          {
            $and: [
              { checkin: { $lte: checkIn } },
              { checkout: { $gte: checkOut } },
            ],
          },
          {
            $and: [
              { checkin: { $lte: checkIn } },
              { checkout: { $lt: checkOut, $gt: checkIn } },
            ],
          },
          {
            $and: [
              { checkin: { $lt: checkOut, $gt: checkIn } },
              { checkout: { $gte: checkOut } },
            ],
          },
          {
            $and: [
              { checkin: { $gt: checkIn } },
              { checkout: { $lt: checkOut } },
            ],
          },
        ],
      },
      {
        hotelId: hotel._id,
      },
    ],
  });

  console.log(bookingCheck, roomId);

  return JSON.stringify(bookingCheck) === JSON.stringify(roomId);
};

module.exports.reviewHotel = catchAsync(async (req, res, next) => {
  // Get all hotels

  // Can use another way call "Using bulk write operations"
  const reviewObj = new Review(req.body);

  reviewObj.hotelId = req.params.hotelId;
  reviewObj.user = req.user._id;

  const hotel = await Hotel.findById(req.params.hotelId);

  if (hotel) {
    await reviewObj.save();

    await hotel.reviews.push(reviewObj._id);

    await hotel.save();

    return res.status(200).json({ message: "Review successfully" });
  } else {
    return next(new AppError("Hotels not found", 404));
  }
});

module.exports.reportHotel = catchAsync(async (req, res, next) => {
  // Can use another way call "Using bulk write operations"
  const reportObj = new Reports(req.body);
  reportObj.hotelId = req.params.hotelId;
  reportObj.user = req.user._id;

  const hotel = await Hotel.findById(req.params.hotelId);
  if (hotel) {
    await reportObj.save();

    return res
      .status(200)
      .json({ message: "Your report has been sent successfully" });
  } else {
    return next(new AppError("Hotels not found", 404));
  }
});

module.exports.reportHotel = catchAsync(async (req, res, next) => {
  // Can use another way call "Using bulk write operations"
  const reportObj = new Reports(req.body);
  reportObj.hotelId = req.params.hotelId;
  reportObj.user = req.user._id;

  const hotel = await Hotel.findById(req.params.hotelId);
  if (hotel) {
    await reportObj.save();

    return res
      .status(200)
      .json({ message: "Your report has been sent successfully" });
  } else {
    return next(new AppError("Hotels not found", 404));
  }
});

module.exports.getReviewsByAveragePoint = catchAsync(async (req, res, next) => {
  // Get all reviews
  const averagePoint = req.params.averagePoint;
  const reviews = await Review.find({ averagePoint: averagePoint });

  return res.status(200).json({
    data: reviews,
  });
});

module.exports.deleteHotel = catchAsync(async (req, res, next) => {
  const hotelId = req.params.hotelId;

  const hotelDelete = await Hotel.findByIdAndDelete(hotelId);

  const listImage = hotelDelete.images.map(
    (image) => "public/" + image.imagePath
  );

  console.log(listImage);

  fileDelete(listImage);

  // Get all reviews
  const roomsDelete = await RoomType.deleteMany({
    _id: { $in: hotelDelete.roomType },
  });

  const reviewsDelete = await Review.deleteMany({
    _id: { $in: hotelDelete.reviews },
  });

  return res.status(200).json({
    message: "Delete successfully completed",
    data: { roomsDelete, hotelDelete, reviewsDelete },
  });
});

module.exports.test = catchAsync(async (req, res, next) => {
  console.log(req.files);

  return res.json("Hello");
});

module.exports.checkIsUserEverStayHere = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const hotelId = req.params.hotelId;

  const userBooking = await Booking.find({
    user: userId,
    hotelId: hotelId,
  });

  if (userBooking && userBooking.length > 0) {
    return res.status(200).json({
      message: "User stayed here",
    });
  } else {
    return res.status(405).json({
      message: "You have'nt stayed here before",
    });
  }
});

module.exports.updateHotel = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const imagesPath = retrieveNewHotelImagePath(req);
  try {
    const hotelIdUpdate = req.params.hotelId;

    // Get image paths only for backgroundImage`

    // Khi gui 1 list array image moi ve server (bao gom nhung cai moi va cu) xu li the nao
    const { backgroundImage, hotelImages, viewImages } =
      retrieveNewHotelImage(req);

    // parse data
    // const hotelUpdate = new Hotel(req.body);
    const { amenities, roomType, hotelImage, viewImage, ...basicHotelInfo } =
      req.body;

    req.body.amenities = JSON.parse(req.body.amenities);

    // update basic info
    const newHotelInfo = await Hotel.findByIdAndUpdate(
      hotelIdUpdate,
      basicHotelInfo,
      { new: true }
    );

    // update hotel amenities

    return res.status(200).json({
      message: "Successfully",
      data: {
        newHotelInfo,
      },
    });
  } catch (error) {
    console.log(error);

    fileDelete(imagesPath);
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
});
