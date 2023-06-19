const Amenity = require("../models/Amenity");
const RoomType = require("../models/RoomType");
const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
require("dotenv").config();

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

const addNewRooms = async (newRoomTypeId, hotelId, roomNum, session) => {
  const roomObjData = {
    hotelId: hotelId,
    roomTypeId: newRoomTypeId,
  };

  // add new roomtype
  const roomsData = Array.from({ length: roomNum }, () => {
    return roomObjData;
  });

  const listRoomId = await Room.insertMany(roomsData, {
    rawResult: true,
    session,
  });

  return Object.values(listRoomId.insertedIds);
};

const retrieveNewHotelImage = (req) => {
  let backgroundImage = "";
  if (req.files["backgroundImage"] && req.files["backgroundImage"].length > 0) {
    backgroundImage = req.files["backgroundImage"][0].path
      .split("public")[1]
      .replaceAll("\\", "/");
  }

  const hotelImages =
    req.files["hotelImage"]?.map(({ path }) => ({
      imagePath: path.split("public")[1].replaceAll("\\", "/"),
      imageType: 1,
    })) || [];
  const viewImages =
    req.files["viewImage"]?.map(({ path }) => ({
      imagePath: path.split("public")[1].replaceAll("\\", "/"),
      imageType: 2,
    })) || [];

  return { backgroundImage, hotelImages, viewImages };
};

const retrieveNewHotelImagePath = (req) => {
  let backgroundImage = "";
  if (req.files["backgroundImage"] && req.files["backgroundImage"].length > 0) {
    backgroundImage = req.files["backgroundImage"][0].path.replaceAll(
      "\\",
      "/"
    );
  }

  const hotelImages =
    req.files["hotelImage"]?.map(({ path }) => path.replaceAll("\\", "/")) ||
    [];
  const viewImages =
    req.files["viewImage"]?.map(({ path }) => path.replaceAll("\\", "/")) || [];

  const imagePaths = [...hotelImages, ...viewImages]; // Combine the arrays

  if (backgroundImage != null || bbackImage.length != 0) {
    imagePaths.push(backgroundImage);
  }

  return imagePaths;
};

// Get average point for a specific hotel
const getAveragePoint = async (reviews) => {
  const extractedArray = reviews.map((obj) => {
    return {
      communicationPoint: obj.communicationPoint,
      accuracyPoint: obj.accuracyPoint,
      locationPoint: obj.locationPoint,
      valuePoint: obj.valuePoint,
    };
  });

  return calculateAveragePoints(extractedArray);
};

const calculateAveragePoints = (reviews) => {
  const averageObject = {
    communicationPoint: 0,
    accuracyPoint: 0,
    locationPoint: 0,
    valuePoint: 0,
  };

  if (!reviews || reviews.length <= 0) {
    return averageObject;
  }

  reviews.forEach((review) => {
    averageObject.communicationPoint += review.communicationPoint;
    averageObject.accuracyPoint += review.accuracyPoint;
    averageObject.locationPoint += review.locationPoint;
    averageObject.valuePoint += review.valuePoint;
  });

  const numberOfReviews = reviews.length;

  averageObject.communicationPoint = Math.floor(
    averageObject.communicationPoint / numberOfReviews
  );
  averageObject.accuracyPoint = Math.floor(
    averageObject.accuracyPoint / numberOfReviews
  );
  averageObject.locationPoint = Math.floor(
    averageObject.locationPoint / numberOfReviews
  );
  averageObject.valuePoint = Math.floor(
    averageObject.valuePoint / numberOfReviews
  );

  return averageObject;
};

module.exports = {
  getAmenitiesInsertNotDuplicate,
  getListAmenityDuplicatedId,
  addNewAmenityNotExisted,
  addNewRooms,
  retrieveNewHotelImage,
  retrieveNewHotelImagePath,
  getAveragePoint,
};
