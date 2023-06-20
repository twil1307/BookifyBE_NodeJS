const Room = require("../models/Room");
const Booking = require("../models/Booking");

const getUnavailableDateRanges = async (hotelId) => {
  const rooms = await Room.find({ hotelId }).select("_id").lean();

  const roomIds = rooms.map((room) => room._id.toString());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const bookings = await Booking.find({
    checkin: { $gt: yesterday },
    hotelId: hotelId,
  });

  if (bookings.length == 0) {
    return [];
  }

  const roomBookings = roomIds.reduce((arr, key) => {
    arr[key] = [];
    return arr;
  }, {});

  bookings.forEach((booking) => {
    const { roomId, checkin, checkout } = booking;

    // Add the booking dates to the array
    const currentDate = new Date(checkin);
    while (currentDate <= checkout) {
      // format: 8/25/2023, 12:00:00 AM
      roomBookings[roomId].push(currentDate.toLocaleString().split(",")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  const bookingOrders = Object.values(roomBookings);

  // Find the common values using reduce and filter
  const bookedDate = bookingOrders.reduce((common, arr) => {
    return common.filter((value) => arr.includes(value));
  });

  return bookedDate;
};

module.exports = { getUnavailableDateRanges };
