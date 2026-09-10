const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  // Driver Details
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  driverEmail: { type: String, required: true },
  driverPhone: { type: String, default: '' }, // Added Phone Number!

  // Route Details
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  stopovers: { type: [String], default: [] },
  departureTime: { type: String, required: true },
  seatsAvailable: { type: Number, required: true },

  // Vehicle Details (NEW)
  vehicleName: { type: String, default: '' },
  vehicleColor: { type: String, default: '' },
  vehiclePlate: { type: String, default: '' },

  // Passenger Array (For the Dashboard connections)
  passengers: [{
    passengerId: { type: String },
    passengerName: { type: String },
    passengerEmail: { type: String },
    passengerPhone: { type: String }
  }],
  
  // Timestamps (Automatically records when the ride was published)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', rideSchema);