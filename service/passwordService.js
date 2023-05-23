const bcrypt = require("bcrypt");
require("dotenv").config();

const hashPassword = (plainPassword) => {
  return bcrypt.hash(plainPassword, 15);
};

const comparePassword = (plainPassword, password) => {
  return bcrypt.compare(plainPassword, password);
};

module.exports = { hashPassword, comparePassword };
