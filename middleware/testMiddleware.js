// Testing purpose only
module.exports = (req, res, next) => {
  console.log("Middleware accessed");
  next();
};
