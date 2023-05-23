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

const demoSchema = new Schema({
  param1: {
    type: String,
    required: [true, "param1 required"],
  },
  param2: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Demo", demoSchema);
