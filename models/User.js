// Testing purpose only

// private String user_id;
//     private String username;
//     private String user_password;
//     private String email;
//     private String phone;
//     private String name;
//     private String avatar;
//     private int role;
//     private String ggid;
//     private String wishlist_id;
//     private String self_description;
//     private String salt;
//     private String bankingAccountNumber;
//     private String subname;
//     private Date dob;
//     private Date signAt;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  username: {
    type: String,
    required: [true, "Username required"],
  },
  password: {
    type: String,
    required: [true, "Password required"],
  },
  email: {
    type: String,
    required: [true, "Email required"],
  },
  phone: {
    type: String,
    required: false,
  },
  subName: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  role: {
    type: Number,
    required: true,
    default: 1,
  },
  ggid: {
    type: String,
    required: false,
  },
  wishlistId: {
    type: String,
    required: false,
  },
  selfDescription: {
    type: String,
    required: false,
  },
  salt: {
    type: String,
    required: false,
  },
  bankingAccountNumber: {
    type: String,
    required: false,
  },
  dob: {
    type: Date,
    required: false,
  },
  signAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", userSchema);
