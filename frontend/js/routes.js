const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  loadStopsForSelect();
  loadAllRoutes();
  
  const searchForm = document.getElementById('route-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchRoutes();
    });
  }
});

async function loadStopsForSelect() {
  try {
    const res = await fetch(`${API_URL}/stops`);
    const result = await res.json();
    if (result.success) {
      const fromSelect = document.getElementById('from-stop');
      const toSelect = document.getElementById('to-stop');
      
      if (fromSelect && toSelect) {
        const options = result.data.map(stop => 
          `<option value="${stop._id}">${stop.name}</option>`
        ).join('');
        
        fromSelect.innerHTML = '<option value="">Select origin...</option>' + options;
        toSelect.innerHTML = '<option value="">Select destination...</option>' + options;
      }
    }
  } catch (err) {
    console.error('Failed to load stops:', err);
  }
}

async function loadAllRoutes() {
  try {
    const res = await fetch(`${API_URL}/routes`);
    const result = await res.json();
    if (result.success) {
      displayRoutes(result.data);
    }
  } catch (err) {
    console.error('Failed to load routes:', err);
  }
}

async function searchRoutes() {
  const from = document.getElementById('from-stop').value;
  const to = document.getElementById('to-stop').value;
  
  if (!from || !to) {
    showAlert('Please select both origin and destination', 'error');
    return;
  }
  
  if (from === to) {
    showAlert('Origin and destination cannot be the same', 'error');
    return;
  }

  showLoading('Finding routes...');
  try {
    const res = await fetch(`${API_URL}/routes/from-to?from=${from}&to=${to}`);
    const result = await res.json();
    hideLoading();
    
    if (result.success) {
      displayRoutes(result.data);
      if (result.data.length > 0 && window.drawRoute) {
        const route = result.data[0];
        window.drawRoute(
          route.from.latitude, route.from.longitude,
          route.to.latitude, route.to.longitude
        );
      }
    }
  } catch (err) {
    hideLoading();
    showAlert('Failed to search routes', 'error');
  }
}

function displayRoutes(routes) {
  const container = document.getElementById('routes-list');
  if (!container) return;
  
  if (routes.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#6C757D;">
        <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
        <h3>No routes found</h3>
        <p>Try different stops or check all available routes.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = routes.map(route => `
    <div class="route-card animate-fadeInUp">
      <div class="route-card-header">
        <span class="route-number">Route ${route.routeNumber}</span>
        <span class="route-operator">${route.operator}</span>
      </div>
      <div class="route-path">
        <span class="route-from">${route.from.name}</span>
        <span class="route-arrow">→</span>
        <span class="route-to">${route.to.name}</span>
        ${route.via && route.via.length > 0 ? `<span class="route-via">via ${route.via.map(v => v.name).join(', ')}</span>` : ''}
      </div>
      <div class="route-details">
        <div class="route-detail">
          <span class="route-detail-icon">📏</span>
          <span>${route.distance} km</span>
        </div>
        <div class="route-detail">
          <span class="route-detail-icon">⏱️</span>
          <span>${route.estimatedTime} mins</span>
        </div>
        <div class="route-detail">
          <span class="route-detail-icon">💰</span>
          <span>₹${route.fare}</span>
        </div>
        <div class="route-detail">
          <span class="route-detail-icon">🚌</span>
          <span>${route.frequency === 'high' ? 'High Frequency' : route.frequency === 'medium' ? 'Regular' : 'Low Frequency'}</span>
        </div>
      </div>
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