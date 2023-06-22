const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomTypeSchema = new Schema({
  roomTypeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  roomPrice: {
    type: Number,
    required: [true, "Price required"],
  },
  bedType: {
    type: String,
    required: [true, "Bed type required"],
    default: "Normal",
  },
  bedNum: {
    type: Number,
    required: [true, "Bed number required"],
  },
  bathroomType: {
    type: String,
    required: [true, "Bathroom type required"],
    default: "Normal",
  },
  bathNum: {
    type: Number,
    required: [true, "Bathroom number required"],
  },
  maxGuest: {
    type: Number,
    required: [true, "Max guest per room required"],
  },
  bedroomNum: {
    type: Number,
    required: [true, "Number of bedroom required"],
  },
  isbathPrivate: {
    type: String,
    required: [true, "Is bathroom private"],
  },
});

const hotelSchema = new Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    hotelType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "HotelType",
    },
    hotelName: {
      type: String,
      required: [true, "hotelName required"],
      unique: true,
    },
    backgroundImg: {
      type: String,
      required: [true, "backgroundImg required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAnimalAccept: {
      type: Boolean,
      default: false,
    },
    isCamera: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description required"],
    },
    country: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    closing: {
      type: String,
      required: true,
    },
    opening: {
      type: String,
      required: true,
    },
    checkin: {
      type: String,
      required: true,
    },
    checkout: {
      type: String,
      required: true,
    },
    averagePrice: {
      type: Number,
      required: false,
    },
    rating: {
      type: {
        communicationPoint: { type: Number, default: 0 },
        accuracyPoint: { type: Number, default: 0 },
        locationPoint: { type: Number, default: 0 },
        valuePoint: { type: Number, default: 0 },
      },
      _id: false,
      default: function () {
        return {
          communicationPoint: 0,
          accuracyPoint: 0,
          locationPoint: 0,
          valuePoint: 0,
        };
      },
    },
    hotelAmenities: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Amenity",
    },
    images: [
      {
        type: {
          imagePath: { type: String, required: true },
          imageType: { type: Number, required: true },
        },
        required: true,
      },
    ],
    reviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
    },
    roomType: {
      type: roomTypeSchema,
      required: [true, "Room type required"],
    },
    Rooms: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Room",
    },
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

hotelSchema.statics.calculateAveragePoints = async function (hotelId) {
  const result = await this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(hotelId) },
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "hotelId",
        as: "reviews",
      },
    },
    {
      $unwind: "$reviews",
    },
    {
      $group: {
        _id: "$_id",
        avgCommunicationPoint: { $avg: "$reviews.communicationPoint" },
        avgAccuracyPoint: { $avg: "$reviews.accuracyPoint" },
        avgLocationPoint: { $avg: "$reviews.locationPoint" },
        avgValuePoint: { $avg: "$reviews.valuePoint" },
      },
    },
  ]);

  console.log(result);

  if (result.length > 0) {
    const {
      avgCommunicationPoint,
      avgAccuracyPoint,
      avgLocationPoint,
      avgValuePoint,
    } = result[0];

    return {
      communicationPoint: avgCommunicationPoint,
      accuracyPoint: avgAccuracyPoint,
      locationPoint: avgLocationPoint,
      valuePoint: avgValuePoint,
    };
  }

  return null;
};

module.exports = mongoose.model("Hotel", hotelSchema);
