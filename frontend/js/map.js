let map = null;
let markers = [];
let directionsService = null;
let directionsRenderer = null;
let busStops = [];
let routes = [];
const API_URL = 'https://my-backend-p.onrender.com/api';

function initMap() {
  const coimbatore = { lat: 11.0168, lng: 76.9558 };
  
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: coimbatore,
    mapTypeId: 'roadmap',
    styles: [
      { featureType: 'transit.station.bus', stylers: [{ visibility: 'on' }] },
      { featureType: 'poi', stylers: [{ visibility: 'simplified' }] }
    ]
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#FF6B35',
      strokeWeight: 4,
      strokeOpacity: 0.8
    }
  });

  loadBusStops();
}

async function loadBusStops() {
  try {
    const res = await fetch(`${API_URL}/stops`);
    const result = await res.json();
    if (result.success) {
      busStops = result.data;
      displayStopsOnMap();
    }
  } catch (err) {
    console.error('Failed to load bus stops:', err);
  }
}

function displayStopsOnMap() {
  clearMarkers();
  
  busStops.forEach(stop => {
    const marker = new google.maps.Marker({
      position: { lat: stop.latitude, lng: stop.longitude },
      map: map,
      title: stop.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/bus.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding:8px;min-width:180px;">
          <h4 style="margin:0 0 8px;color:#FF6B35;font-weight:700;">${stop.name}</h4>
          <p style="margin:0;color:#6C757D;font-size:13px;">${stop.landmark || 'Bus Stop'}</p>
          <p style="margin:4px 0 0;color:#004E89;font-size:12px;font-weight:600;">${stop.type === 'bus-stand' ? '🚌 Bus Stand' : '🚏 Bus Stop'}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function showAllStops() {
  if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
  displayStopsOnMap();
  fitBounds();
}

function fitBounds() {
  if (markers.length === 0) return;
  const bounds = new google.maps.LatLngBounds();
  markers.forEach(m => bounds.extend(m.getPosition()));
  map.fitBounds(bounds);
}

function showMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        map.setCenter(pos);
        map.setZoom(15);

        new google.maps.Marker({
          position: pos,
          map: map,
          title: 'Your Location',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40)
          }
        });
      },
      () => {
        alert('Geolocation failed. Please enable location services.');
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

function drawRoute(fromLat, fromLng, toLat, toLng) {
  if (!directionsService || !directionsRenderer) return;
  
  const request = {
    origin: { lat: fromLat, lng: fromLng },
    destination: { lat: toLat, lng: toLng },
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
    } else {
      console.error('Directions request failed:', status);
    }
  });
}

function clearRoute() {
  if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
}