const API_URL = 'https://my-backend-p.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) {
    locateBtn.addEventListener('click', findNearbyStops);
  }
});

function findNearbyStops() {
  if (!navigator.geolocation) {
    showAlert('Geolocation is not supported by your browser', 'error');
    return;
  }

  showLoading('Getting your location...');
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      try {
        const res = await fetch(`${API_URL}/stops/nearby?lat=${lat}&lng=${lng}&radius=5`);
        const result = await res.json();
        hideLoading();
        
        if (result.success) {
          displayNearbyStops(result.data, lat, lng);
          if (window.map) {
            window.map.setCenter({ lat, lng });
            window.map.setZoom(14);
            
            new google.maps.Marker({
              position: { lat, lng },
              map: window.map,
              title: 'Your Location',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }
            });
          }
        }
      } catch (err) {
        hideLoading();
        showAlert('Failed to find nearby stops', 'error');
      }
    },
    (error) => {
      hideLoading();
      showAlert('Unable to retrieve your location. Please enable location services.', 'error');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function displayNearbyStops(stops, userLat, userLng) {
  const container = document.getElementById('nearby-stops-list');
  if (!container) return;
  
  if (stops.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#6C757D;">
        <div style="font-size:3rem;margin-bottom:1rem;">📍</div>
        <h3>No stops nearby</h3>
        <p>Try increasing the search radius or check the map view.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = stops.map((stop, index) => `
    <div class="stop-card animate-fadeInUp delay-${Math.min(index + 1, 4)}">
      <div class="stop-info">
        <h4>${stop.name}</h4>
        <p>${stop.landmark || 'Bus Stop'} • ${stop.type === 'bus-stand' ? 'Bus Stand' : 'Bus Stop'}</p>
      </div>
      <div class="stop-distance">${stop.distance.toFixed(2)} km</div>
    </div>
  `).join('');
}

function showAlert(message, type = 'info') {
  const container = document.getElementById('alert-container') || document.body;
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span><span>${message}</span>`;
  container.insertBefore(alert, container.firstChild);
  setTimeout(() => alert.remove(), 5000);
}

function showLoading(text = 'Loading...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="spinner"></div><div class="loading-text">${text}</div>`;
    document.body.appendChild(overlay);
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
}