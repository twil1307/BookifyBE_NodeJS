require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create the Multer storage engine using the CloudinaryStorage
const storageUser = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "User", // User folder to store the files in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Optional array of allowed file formats
  },
});

const storageHotel = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Hotel", // Hotel folder to store the files in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Optional array of allowed file formats
  },
});

const storageUserLocal = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/users");
  },
  filename: function (req, file, cb) {
    const fileExtension = getFileExtension(file.originalname);
    cb(
      null,
      `${req.user._id}-${file.fieldname}-${Date.now()}.${fileExtension}`
    );
  },
});

const storageHotelLocal = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/hotels");
  },
  filename: function (req, file, cb) {
    const fileExtension = getFileExtension(file.originalname);
    cb(
      null,
      `${req.user._id}-${file.fieldname}-${Date.now()}.${fileExtension}`
    );
  },
});

// Helper function to get file extension
function getFileExtension(filename) {
  return filename.split(".").pop();
}

// upload to online cloud
const userImageUploader = multer({ storage: storageUser });
const hotelImageUploader = multer({ storage: storageHotel });

// upload local
const userImageUploaderLocal = multer({ storage: storageUserLocal });
const hotelImageUploaderLocal = multer({ storage: storageHotelLocal });

module.exports = {
  cloudinary,
  userImageUploader,
  hotelImageUploader,
  userImageUploaderLocal,
  hotelImageUploaderLocal,
};
