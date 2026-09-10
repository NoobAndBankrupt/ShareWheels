const header = document.querySelector('.site-header');
const sticky = document.querySelector('.sticky-search');

const showSticky = () => {
  // If there is no sticky search on this page, stop here and don't crash!
  if (!sticky) return; 
  
  if (window.scrollY > 250 && window.innerWidth <= 900) sticky.style.display = 'grid';
  else sticky.style.display = 'none';
};

window.addEventListener('scroll', showSticky);
window.addEventListener('resize', showSticky);
showSticky();
document.querySelectorAll('button, a').forEach(el => {
  el.addEventListener('click', e => {
    if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
  });
});

const cookieBtn = document.querySelector('.cookie button');
const cookieBanner = document.querySelector('.cookie');

// Only try to remove the cookie banner if it actually exists on the page
if (cookieBtn && cookieBanner) {
  cookieBtn.addEventListener('click', () => {
    cookieBanner.remove();
  });
}

// --- Passenger Counter Logic ---
let currentPassengers = 1;

function updatePassengerText() {
  const passengerInputs = document.querySelectorAll('.passenger-count-input');
  let textToDisplay = currentPassengers === 1 ? currentPassengers + " passenger" : currentPassengers + " passengers";
  
  passengerInputs.forEach(function(input) {
    input.value = textToDisplay;
  });
}

function increasePassengers() {
  if (currentPassengers < 10) { 
    currentPassengers++;
    updatePassengerText();
  }
}

function decreasePassengers() {
  if (currentPassengers > 1) { 
    currentPassengers--;
    updatePassengerText();
  }
}
// --- 1. Profile Dropdown ---
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
            profileDropdown.classList.remove('show');
        }
    });
}

// --- 2. Publish Card: Seats ---
let emptySeats = 3;
const seatCountInput = document.getElementById('seat-count');

function updateSeatText() {
    if (seatCountInput) {
        seatCountInput.value = emptySeats === 1 ? emptySeats + " passenger" : emptySeats + " passengers";
    }
}

function increaseSeats() {
    if (emptySeats < 6) { 
        emptySeats++;
        updateSeatText();
    }
}

function decreaseSeats() {
    if (emptySeats > 1) { 
        emptySeats--;
        updateSeatText();
    }
}

// --- 3. Publish Card: Add Stopover/Landmark ---
function addLandmark() {
    const list = document.getElementById('landmarkList');
    if (list) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'stopover-input w-100';
        input.placeholder = 'e.g. Connaught Place';
        list.appendChild(input);
        input.focus();
    }
  }
    // --- OTP Signup Flow ---
const sendOtpBtn = document.getElementById('sendOtpBtn');
const signupForm = document.getElementById('signupForm');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

// 1. When the user clicks "Send OTP"
if (sendOtpBtn) {
  sendOtpBtn.addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value;
    
    if (!email) {
      alert("Please enter your email first!");
      return;
    }

    sendOtpBtn.innerText = "Sending..."; 
    
    try {
      const response = await fetch('http://localhost:3000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        // Hide Step 1, Show Step 2 (using flex to keep your nice spacing)
        step1.style.display = 'none';
        step2.style.display = 'flex';
      } else {
        const data = await response.json();
        alert('Error: ' + data.message);
        sendOtpBtn.innerText = "Send OTP to Email";
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server.');
      sendOtpBtn.innerText = "Send OTP to Email";
    }
  });
}

// When the user enters the OTP and clicks "Verify & Create"
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // This stops the page refresh!
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const otp = document.getElementById('signupOtp').value;

    const verifyBtn = document.getElementById('verifyOtpBtn');
    if (verifyBtn) verifyBtn.innerText = "Verifying...";

    try {
      const response = await fetch('http://localhost:3000/api/verify-otp-and-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Account verified and created successfully!');
        window.location.href = 'login.html'; 
      } else {
        alert('Error: ' + data.message);
        if (verifyBtn) verifyBtn.innerText = "Verify & Create Account";
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server.');
      if (verifyBtn) verifyBtn.innerText = "Verify & Create Account";
    }
  });
}
// --- Login Form Logic ---
const loginEmailForm = document.getElementById('loginEmailForm');

if (loginEmailForm) {
  loginEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // This is the magic line that stops the refresh!
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginEmailForm.querySelector('button[type="submit"]');
    
    if (submitBtn) submitBtn.innerText = "Logging in...";

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        // This line saves your info so the website remembers you!
        localStorage.setItem('sharewheels_user', JSON.stringify(data.user));
        
        alert('Login successful! Welcome back.');
        window.location.href = 'index.html'; // Redirects to home
      } else {
        alert('Error: ' + data.message);
        if (submitBtn) submitBtn.innerText = "Log In";
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server.');
      if (submitBtn) submitBtn.innerText = "Log In";
    }
  });
}
// --- Dynamic Profile Menu ---
const updateHeader = () => {
  const userJSON = localStorage.getItem('sharewheels_user');
  const dropdown = document.getElementById('profileDropdown');
  
  if (userJSON && dropdown) {
    const user = JSON.parse(userJSON);
    
    // Replace the dropdown HTML with Profile details and Logout
    dropdown.innerHTML = `
      <div style="padding: 14px 20px; border-bottom: 1px solid #f0f0f0;">
        <span style="display: block; font-size: 14px; font-weight: 700; color: #304A2F;">${user.name}</span>
        <span style="display: block; font-size: 11px; color: #7A8375;">${user.email}</span>
      </div>
      <a href="profile.html" style="padding: 14px 20px; text-decoration: none; color: #304A2F; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between;" onmouseover="this.style.backgroundColor='#F5F7EE'" onmouseout="this.style.backgroundColor='transparent'">
        My Profile <span style="color: #888;">›</span>
      </a>
      <a href="#" id="logoutBtn" style="padding: 14px 20px; text-decoration: none; color: #D32F2F; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between;" onmouseover="this.style.backgroundColor='#F5F7EE'" onmouseout="this.style.backgroundColor='transparent'">
        Log out
      </a>
    `;

    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('sharewheels_user'); // Delete saved user
      window.location.href = 'index.html'; // Refresh page
    });
  }
};

// Run this check every time any page loads
updateHeader();
// --- Search Rides Logic with UI Cards ---
const searchBtn = document.getElementById('mainSearchBtn');

if (searchBtn) {
  searchBtn.addEventListener('click', async () => {
    
    const leavingFrom = document.getElementById('mainSearchLeavingFrom').value;
    const goingTo = document.getElementById('mainSearchGoingTo').value;
    const timeInput = document.getElementById('mainSearchTime').value;
    const passengersText = document.getElementById('mainSearchPassengers').value;

    // 1. Extract the number of seats
    const requestedSeats = parseInt(passengersText) || 1;

    // 2. Convert 24-hour time ("09:00") to 12-hour time ("09:00 AM")
    let formattedTime = "";
    if (timeInput) {
      let [hours, minutes] = timeInput.split(':');
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Converts 0 or 13+ to 1-12
      hours = hours < 10 ? '0' + hours : hours; // Adds leading zero
      formattedTime = `${hours}:${minutes} ${ampm}`;
    }

    if (!leavingFrom || !goingTo || goingTo === "") {
      alert('Please enter both departure and destination locations.');
      return;
    }

    const originalText = searchBtn.innerText;
    searchBtn.innerText = "Searching...";

    try {
      // 3. Send all 4 data points to the backend
      const response = await fetch(`http://localhost:3000/api/search-rides?leavingFrom=${leavingFrom}&goingTo=${goingTo}&seats=${requestedSeats}&time=${formattedTime}`);
      const rides = await response.json();

      const searchResults = document.getElementById('searchResults');
      const ridesContainer = document.getElementById('ridesContainer');
      
      ridesContainer.innerHTML = '';
      searchResults.style.display = 'block'; 

      if (rides.length > 0) {
        rides.forEach(ride => {
          const card = document.createElement('div');
          card.style = "border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 10px;";
          card.innerHTML = `
            <div>
              <h3 style="margin: 0 0 5px 0; color: #304A2F; font-size: 20px;">${ride.departureTime}</h3>
              <p style="margin: 0 0 5px 0; color: #333; font-size: 16px;">
                <strong>${ride.startLocation}</strong> ➔ <strong>${ride.endLocation}</strong>
              </p>
              <p style="margin: 0; color: #7A8375; font-size: 13px;">
                Driver: <strong>${ride.driverName}</strong> • Seats Available: <strong>${ride.seatsAvailable}</strong>
              </p>
              ${ride.stopovers.length > 0 ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">Stops via: ${ride.stopovers.join(', ')}</p>` : ''}
            </div>
           <button class="primary" onclick="joinRide('${ride.driverName}', '${ride.driverEmail}', '${ride.startLocation}', '${ride.endLocation}', '${ride.departureTime}')" style="padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Join Ride</button>
          `;
          ridesContainer.appendChild(card);
        });
      } else {
        ridesContainer.innerHTML = `<p style="color: #687263; font-size: 16px;">No rides found heading to <strong>${goingTo}</strong> from <strong>${leavingFrom}</strong> at exactly <strong>${formattedTime}</strong> with enough seats.</p>`;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to search rides. Is your backend running?');
    } finally {
      searchBtn.innerText = originalText;
    }
  });
}
// --- Join Ride Logic ---
window.joinRide = async function(driverName, driverEmail, startLocation, endLocation, time) {
  const userJSON = localStorage.getItem('sharewheels_user');
  if (!userJSON) {
    alert("You must be logged in to join a ride!");
    window.location.href = 'login.html';
    return;
  }
  
  const user = JSON.parse(userJSON);
  alert("Booking your seat and sending driver details to your email...");

  try {
    const response = await fetch('http://localhost:3000/api/join-ride', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passengerName: user.name,
        passengerEmail: user.email,
        driverName: driverName,
        driverEmail: driverEmail,
        startLocation: startLocation,
        endLocation: endLocation,
        time: time
      })
    });

    if (response.ok) {
      alert(`Success! 🚗\nCheck your email (${user.email}) for the driver's contact info.`);
    } else {
      // This will now catch the exact error message from the backend!
      const data = await response.json();
      alert("Backend Error: " + data.message + "\nCheck your VS Code terminal for the red text!");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to connect to the server.");
  }
  
};