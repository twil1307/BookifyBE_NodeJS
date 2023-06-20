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

const transactSchema = new Schema(
  {
    transactId: {
      type: String,
      required: true,
    },
    ammount: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      default: "Banking",
    },
    spectDate: {
      type: Date,
    },
    walletAmount: {
      type: Number,
    },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transact", transactSchema);
