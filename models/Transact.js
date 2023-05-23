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

const transactSchema = new Schema({
  transactId: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  ammount: {
    type: Number,
    required: true,
    default: 0,
  },
  type: {
    type: Number,
    required: [true, "Type required"],
  },
  spectDate: {
    type: String,
    required: [true, "Username required"],
  },
  walletAmount: {
    type: [Number],
    required: [true, "Username required"],
  },
  totalPaymentPerDay: {
    type: [Number],
    required: [true, "Username required"],
  },
  month: {
    type: Number,
    required: true,
  },
  hotelName: {
    type: String,
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Transact", transactSchema);
