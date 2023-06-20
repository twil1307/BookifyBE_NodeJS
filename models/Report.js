const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// private String reportId;
// private String hotelId;
// private String hotelName;
// private String userId;
// private String username;
// private String avatar;
// private String title;
// private String content;
// private Date reportDate;

const ReportSchema = new Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    content: {
      type: String,
      required: [true, "Content required"],
    },
    title: {
      type: String,
      required: [true, "Title required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", ReportSchema);
