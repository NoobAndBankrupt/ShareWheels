# ShareWheels
ShareWheels: College Ride-Sharing &amp; Carpooling Platform  Welcome to ShareWheels, the ultimate sustainable and cost-effective travel companion built specifically for college students across Delhi and Delhi NCR.
Here is a professional and comprehensive README.txt file tailored for your ShareWheels project. You can place this right into your root project folder.

ShareWheels - College Ride-Sharing & Carpooling Platform
Overview
ShareWheels is a MERN-stack carpooling and ride-sharing web application built specifically for college students across Delhi and Delhi NCR. It connects students heading to the same university campuses (such as Hansraj College, IIT Delhi, Shivaji College, and Amity University), enabling them to split travel costs, reduce carbon emissions, and commute safely with verified peers.

Key Features
Dual Authentication System: Secure signup and login supporting both traditional Email/Password (with bcrypt hashing and Nodemailer OTP verification) and Phone OTP authentication via Firebase.

Smart Ride Publishing: Drivers can publish routes complete with custom departure times, seat limits, intermediate stopovers, and detailed vehicle information (car model, color, and license plate).

Flexible Route Search: Passengers can search for available rides dynamically by entering departure points and campus destinations, with built-in seat filtering.

Instant Booking & Notifications: Passengers can securely join rides, immediately update available seat counts, and receive confirmation updates.

User Dashboard: Dedicated tabs for drivers (Rides Planned) and passengers (Rides Joined) displaying real-time contact actions (direct phone call and email buttons) and vehicle specifications.

Tech Stack
Frontend: HTML5, CSS3 (Modern custom design system), JavaScript (Vanilla ES6+)

Backend: Node.js, Express.js

Database: MongoDB & Mongoose

Authentication & Services: Firebase Auth (Phone OTP), Nodemailer (Email OTP and ride confirmations), Bcrypt (Password security)

Project File Structure
Plaintext
ShareWheels/
├── models/
│   ├── Ride.js             # Mongoose schema for rides, vehicles, and passengers
│   └── User.js             # Mongoose schema for user profiles and authentication
├── assets/                 # Images, logos, and UI graphics
├── dashboard.html          # User dashboard for planned and joined rides
├── index.html              # Homepage with active search and route exploration
├── login.html              # User login page (Phone/Email switching)
├── login-email.html        # Dedicated email login view
├── profile.html            # User profile management view
├── publish.html            # Driver ride-publishing form
├── signup.html             # Multi-step verification registration flow
├── script.js               # Global frontend navigation and state logic
├── style.css               # Unified custom design system stylesheet
├── server.js               # Express backend API routing and database connection
├── package.json            # Project dependencies and npm scripts
└── README.txt              # Project documentation
Setup & Installation Instructions
Clone or Download the Repository to your local machine.

Install Dependencies: Open your terminal in the project root folder and run:

Bash
npm install
Start MongoDB: Ensure your local MongoDB service is running (mongodb://127.0.0.1:27017/sharewheels).

Run the Backend Server:

Bash
node server.js
(You should see confirmation logs for both the Express server startup and MongoDB connection).

Launch the Application: Open index.html in your browser using a live server or local file view to start exploring, publishing, and joining rides!
