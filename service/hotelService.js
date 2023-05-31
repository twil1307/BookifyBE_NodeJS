const Amenity = require("../models/Amenity");
const RoomType = require("../models/RoomType");
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

const addNewRoomType = async (listRoomType, session) => {
  const listId = await RoomType.insertMany(listRoomType, {
    rawResult: true,
    session,
  });

  return Object.values(listId.insertedIds);
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

// Get average point for a specific hotel
const getAveragePoint = async (hotelId) => {
  const listReviews = await Hotel.findById(hotelId)
    .select("reviews")
    .populate(
      "reviews",
      "communicationPoint accuracyPoint locationPoint valuePoint -_id"
    );

  return calculateAveragePoints(listReviews.reviews);
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
  addNewRoomType,
  retrieveNewHotelImage,
  getAveragePoint,
};
