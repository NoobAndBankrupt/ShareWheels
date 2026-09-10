const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Import your Models here at the top
const User = require('./models/User');
const Ride = require('./models/Ride'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/sharewheels')
  .then(() => console.log('✅ MongoDB successfully connected!'))
  .catch((err) => console.log('❌ Database connection error:', err));

// Temporary storage for Nodemailer OTPs
const otpStorage = {}; 

// Upgraded Nodemailer Setup (Using Port 587 / TLS)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, 
  secure: false,
  auth: {
    user: 'atifshaikh8595@gmail.com', 
    pass: 'layhtudeanzrwkti' 
  }
});

// --- API Route: Send the Email OTP ---
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[email] = otp;

  const mailOptions = {
    from: 'atifshaikh8595@gmail.com',
    to: email,
    subject: 'Your ShareWheels Verification Code',
    text: `Welcome to ShareWheels! Your verification code is: ${otp}. This code will expire soon.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Success: OTP sent to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('NODEMAILER ERROR:', error); 
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// --- API Route: Two-Step Strict Signup with Password Encryption ---
app.post('/api/register-two-step', async (req, res) => {
  const { name, email, password, phone, firebaseUid, otp } = req.body;

  try {
    if (!otpStorage[email] || otpStorage[email] !== otp) {
      return res.status(400).json({ message: 'Invalid or expired Email OTP.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name, email, password: hashedPassword, phone, firebaseUid
    });

    await newUser.save();
    delete otpStorage[email]; 

    res.status(201).json({ message: 'Account created successfully', user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// --- API Route: Email Log In ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found! Please sign up.' });
    }

    let isMatch = false;
    if (user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password); 
    } else {
        isMatch = (password === user.password); 
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password!' });
    }

    res.status(200).json({ 
      message: 'Login successful!', 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- API Route: Firebase Login Bridge ---
app.post('/api/firebase-login', async (req, res) => {
  const { phone, uid } = req.body;

  if (!phone || !uid) {
    return res.status(400).json({ message: 'Missing phone number or UID from Firebase.' });
  }

  try {
    let user = await User.findOne({ phone: phone });

    if (!user) {
      user = new User({
        phone: phone, firebaseUid: uid, name: 'New Carpooler', 
        email: `${uid}@sharewheels.user`, password: 'firebase-auth-no-password' 
      });
      await user.save();
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// --- STRICT API Route: Publish a Ride ---
app.post('/api/publish-ride', async (req, res) => {
  console.log("-----------------------------------------");
  console.log("📥 1. RECEIVED PUBLISH REQUEST");
  console.log("Data arriving from frontend:", req.body); // This will show us EXACTLY what your browser sent!

  const { driverId, driverName, driverEmail, driverPhone, startLocation, endLocation, stopovers, departureTime, seatsAvailable, vehicleName, vehicleColor, vehiclePlate } = req.body;

  try {
    // Failsafe: Make sure we actually have an ID before saving to Mongoose
    if (!driverId) {
      console.log("❌ ERROR: Missing driverId");
      return res.status(400).json({ message: 'Missing driver ID. Please log out and log back in.' });
    }

    console.log("⏳ 2. Attempting to save to MongoDB...");
    const newRide = new Ride({
      driverId, driverName, driverEmail, driverPhone,
      startLocation, endLocation, departureTime, seatsAvailable,
      vehicleName, vehicleColor, vehiclePlate,
      stopovers: stopovers ? stopovers.split(',').map(s => s.trim()) : [],
    });

    await newRide.save();
    console.log("✅ 3. SUCCESS! Ride saved to MongoDB.");
    console.log("-----------------------------------------");
    
    // Force return success to the browser
    return res.status(201).json({ message: 'Ride published successfully!' });
    
  } catch (error) {
    console.log("❌ 3. FATAL MONGODB ERROR:");
    console.error(error.message); // This reveals the exact database rule that failed
    console.log("-----------------------------------------");
    
    // Force return error to the browser so it doesn't get stuck!
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// --- UPGRADED API Route: Join a Ride (WITH ERROR TRACKING) ---
app.post('/api/join-ride', async (req, res) => {
  console.log("-----------------------------------------");
  console.log("📥 1. RECEIVED JOIN RIDE REQUEST");
  console.log("Request Data:", req.body);

  const { rideId, passengerId, passengerName, passengerEmail, passengerPhone } = req.body;

  try {
    // Check if we actually got the IDs from the frontend
    if (!rideId || !passengerId) {
      console.log("❌ ERROR: Missing rideId or passengerId");
      return res.status(400).json({ message: "Missing required IDs." });
    }

    console.log(`🔍 2. Searching for Ride ID: ${rideId}`);
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      console.log("❌ ERROR: Ride not found in DB.");
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.seatsAvailable <= 0) {
      console.log("❌ ERROR: No seats left.");
      return res.status(400).json({ message: 'No seats left!' });
    }

    // Check if passenger is already in the array safely
    const alreadyJoined = ride.passengers.some(p => p.passengerId && p.passengerId.toString() === passengerId.toString());
    if (alreadyJoined) {
      console.log("❌ ERROR: Passenger already joined.");
      return res.status(400).json({ message: 'You already joined this ride.' });
    }

    console.log("⏳ 3. Adding passenger and saving to DB...");
    ride.passengers.push({ passengerId, passengerName, passengerEmail, passengerPhone });
    ride.seatsAvailable -= 1;
    await ride.save();
    console.log("✅ 4. SUCCESS! Passenger saved to ride.");

    //  Wrap the email in its own try/catch block!
    // Now, if Gmail blocks the email, the user still successfully joins the ride!
    try {
      console.log("⏳ 5. Attempting to send confirmation email...");
      const mailOptions = {
        from: 'atifshaikh8595@gmail.com',
        to: passengerEmail,
        subject: `ShareWheels: Your Ride is Confirmed! 🚗`,
        text: `Hello ${passengerName}, you joined a ride from ${ride.startLocation} to ${ride.endLocation}.`
      };
      await transporter.sendMail(mailOptions);
      console.log("✅ 6. Email sent successfully!");
    } catch (emailErr) {
      console.log("⚠️ WARNING: Email failed to send, but ride was joined successfully.");
      console.error(emailErr.message);
    }

    console.log("-----------------------------------------");
    return res.status(200).json({ message: 'Successfully joined the ride!' });
    
  } catch (error) {
    console.log("❌ FATAL ERROR IN JOIN LOGIC:");
    console.error(error);
    console.log("-----------------------------------------");
    return res.status(500).json({ message: 'Failed to join ride', error: error.message });
  }
});

// --- NEW API Route: Fetch Dashboard Data ---
app.get('/api/user-dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("-----------------------------------------");
    console.log("🔍 DASHBOARD SEARCH TRIGGERED");
    console.log("Looking for rides matching User ID:", userId);
    
    // Find rides this user is driving
    const plannedRides = await Ride.find({ driverId: userId });
    console.log(`🚗 Found Planned Rides: ${plannedRides.length}`);
    
    // Find rides this user joined as a passenger
    const joinedRides = await Ride.find({ "passengers.passengerId": userId });
    console.log(`🤝 Found Joined Rides: ${joinedRides.length}`);
    console.log("-----------------------------------------");

    res.status(200).json({ plannedRides, joinedRides });
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

app.get('/api/all-rides', async (req, res) => {
  try {
    const rides = await Ride.find({});
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rides', error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ message: 'ShareWheels server is running!' });
});
// --- API Route: Search Rides ---
app.get('/api/search-rides', async (req, res) => {
  try {
    const { leavingFrom, goingTo } = req.query;

    console.log("🔍 Search request received for:", { leavingFrom, goingTo });

    // Build flexible query matching
    const query = {};

    if (leavingFrom) {
      // Matches start location OR any stopover point (case-insensitive)
      query.$or = [
        { startLocation: { $regex: leavingFrom.trim(), $options: 'i' } },
        { stopovers: { $regex: leavingFrom.trim(), $options: 'i' } }
      ];
    }

    if (goingTo) {
      // Matches destination (case-insensitive)
      query.endLocation = { $regex: goingTo.trim(), $options: 'i' };
    }

    // Only fetch rides that still have at least 1 seat left
    query.seatsAvailable = { $gt: 0 };

    const matchingRides = await Ride.find(query);
    console.log(`✅ Found ${matchingRides.length} matching ride(s)`);

    res.status(200).json(matchingRides);
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Failed to search rides", error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});