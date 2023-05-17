require("dotenv").config();

const MONGOURI = process.env.MONGODB_URI;
var mongoose = require("mongoose");
mongoose.set("strictQuery", false);

mongoose.connect(MONGOURI);
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.log("Failed to MongoDB ", err);
});

module.exports = mongoose;
