require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imagePath = "D:/NodeJS/BookifyBENodeJS/public/images/AIVanGogh3x2_2.png";

cloudinary.uploader
  .upload(imagePath)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
