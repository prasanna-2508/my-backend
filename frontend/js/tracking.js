let map;
let marker;
const socket = io('http://localhost:5000'); // Change this to your server URL in production

const busIdEl = document.getElementById('bus-id');
const coordsEl = document.getElementById('coords');
const lastUpdatedEl = document.getElementById('last-updated');
const statusEl = document.getElementById('connection-status');

// Initialize Leaflet Map
function initMap() {
  // Center at [0, 0] with zoom level 2 as requested
  map = L.map('map').setView([0, 0], 2);

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Initialize marker at [0, 0]
  marker = L.marker([0, 0]).addTo(map);

  // Try to fetch the latest location from API on load
  fetchLatestLocation();
}

async function fetchLatestLocation() {
  try {
    const response = await fetch('http://localhost:5000/api/gps/latest');
    const result = await response.json();
    
    if (result.success && result.data) {
      updateUI(result.data);
    }
  } catch (error) {
    console.error('Error fetching latest location:', error);
  }
}

function updateUI(data) {
  if (!data) return;

  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);
  
  // Gracefully handle data errors
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.warn('Invalid or missing coordinate data received:', data);
    return;
  }

  // Update marker position and smoothly center map
  if (marker && map) {
    marker.setLatLng([lat, lng]);
    map.panTo([lat, lng]);
  }

  // Update text info
  if (coordsEl) coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  if (busIdEl) busIdEl.textContent = data.busId || 'Unknown Bus';
  if (lastUpdatedEl) lastUpdatedEl.textContent = new Date(data.timestamp || Date.now()).toLocaleTimeString();
}

// Socket.io event listeners
socket.on('connect', () => {
  if (statusEl) {
    statusEl.textContent = 'Connected';
    statusEl.style.color = '#4caf50';
  }
});

socket.on('disconnect', () => {
  if (statusEl) {
    statusEl.textContent = 'Disconnected';
    statusEl.style.color = '#f44336';
  }
});

socket.on('locationUpdate', (data) => {
  console.log('Location update received:', data);
  updateUI({
    busId: data.busId,
    latitude: data.lat,
    longitude: data.lng,
    timestamp: data.timestamp
  });
});

// Call initMap when the page loads
window.onload = initMap;
