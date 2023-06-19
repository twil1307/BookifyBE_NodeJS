const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bankingAccountSchema = new Schema(
  {
    bankingAccountId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    bankingAccountNumber: {
      type: String,
      required: [true, "Banking Account required"],
    },
    amount: {
      type: Number,
      default: 50000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BankingAccount", bankingAccountSchema);
