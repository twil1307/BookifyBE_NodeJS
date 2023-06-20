const Hotel = require("../models/Hotel");
const HotelType = require("../models/HotelType");
const Review = require("../models/Review");
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
	addNewRoomType,
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
		const newAmenities = await getAmenitiesInsertNotDuplicate(
			hotelAmenitySign
		);

		// get list id of existed amenties in DB
		const listExistedAmenitiesAdd = await getListAmenityDuplicatedId(
			hotelAmenitySign,
			newAmenities
		);

		// Add new amenities (not existed) return ID
		const newAmenitiesId = await addNewAmenityNotExisted(
			newAmenities,
			session
		);

		// Pass existed amenities ids and new amenities ids
		hotelSign.hotelAmenities = [
			...listExistedAmenitiesAdd,
			...newAmenitiesId,
		];

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
		.populate("userId", "-password -hotelBookmarked -updatedAt -dob")
		.populate("hotelAmenities")
		.populate("roomType")
		.populate("reviews")
		.populate("rating");

	const data = await getAveragePoint(req.params.hotelId);

	hotel.rating = data;

	const bookedDate = await getUnavailableDateRanges(req.params.hotelId);

	if (hotel) {
		return res.status(200).json({ hotel, fullyBookedDates: bookedDate });
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
				} else {
					return {
						...acc,
						[key]: queryParamValue,
					};
				}
			}

			return acc;
		},
		{ isVerified: "true" }
	);

	console.log(findHotelQuery);

	const hotels = await Hotel.find(findHotelQuery)
		.select("hotelName country district address averagePrice rating images")
		.populate({ path: "hotelAmenities" });

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

module.exports.updateHotel = catchAsync(async (req, res, next) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	const imagesPath = retrieveNewHotelImagePath(req);
	try {
		const hotelIdUpdate = req.params.hotelId;

		// Get image paths only for backgroundImage

		// Khi gui 1 list array image moi ve server (bao gom nhung cai moi va cu) xu li the nao
		const { backgroundImage, hotelImages, viewImages } =
			retrieveNewHotelImage(req);

		// parse data
		// const hotelUpdate = new Hotel(req.body);
		const {
			amenities,
			roomType,
			hotelImage,
			viewImage,
			...basicHotelInfo
		} = req.body;

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
