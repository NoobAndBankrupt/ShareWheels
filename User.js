const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- NEW FIELDS ADDED FOR FIREBASE ---
  phone: { type: String, unique: true, sparse: true }, 
  firebaseUid: { type: String, unique: true, sparse: true },
  // -------------------------------------

  college: { type: String, default: 'IGNOU' }, 
  role: { type: String, enum: ['rider', 'driver'], default: 'rider' },
  
  // Only required if the user is a driver
  vehicleDetails: {
    model: { type: String },
    mileage: { type: Number }, // km per liter (useful for the fuel-split math)
  },
  
  // Gamification for the green dashboard
  totalCarbonSaved: { type: Number, default: 0 } // in kg
});

module.exports = mongoose.model('User', userSchema);