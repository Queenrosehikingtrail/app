// Live Tracking System with Battery Saving Options
// Provides continuous GPS tracking that can be toggled on/off

let liveTrackingState = {
    isActive: false,
    watchId: null,
    updateInterval: 30000, // Fixed 30 seconds
    lastUpdate: null,
    currentMarker: null,
    accuracyCircle: null
};

// Live tracking settings
const TRACKING_INTERVALS = {
    'high': { seconds: 5, label: 'High (5s) - More Battery' },
    'medium': { seconds: 10, label: 'Medium (10s) - Balanced' },
    'low': { seconds: 30, label: 'Low (30s) - Battery Saver' }
};

// Initialize live tracking controls
function initializeLiveTracking() {
    console.log('[LiveTracking] Initializing live tracking system with simplified controls');
    
    // Check if toggle button exists in HTML
    const toggleButton = document.getElementById('live-tracking-toggle');
    
    if (!toggleButton) {
        console.error('[LiveTracking] Toggle button not found in HTML');
        return;
    }
    
    console.log('[LiveTracking] Found toggle button, setting up event listeners');
    
    // Set up event listeners
    setupLiveTrackingEvents();
}

// Set up event listeners for live tracking
function setupLiveTrackingEvents() {
    const toggleButton = document.getElementById('live-tracking-toggle');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleLiveTracking);
    }
}

// Toggle live tracking on/off
function toggleLiveTracking() {
    if (liveTrackingState.isActive) {
        stopLiveTracking();
    } else {
        startLiveTracking();
    }
}

// Start live tracking
function startLiveTracking() {
    console.log('[LiveTracking] Starting live tracking');
    
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }
    
    // Update UI
    const toggleButton = document.getElementById('live-tracking-toggle');
    
    if (toggleButton) {
        toggleButton.textContent = '🟢 Stop Live Tracking';
        toggleButton.classList.add('active');
    }
    
    // Start watching position
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
    };
    
    liveTrackingState.watchId = navigator.geolocation.watchPosition(
        updateLivePosition,
        handleTrackingError,
        options
    );
    
    liveTrackingState.isActive = true;
    console.log('[LiveTracking] Live tracking started with watch ID:', liveTrackingState.watchId);
}

// Stop live tracking
function stopLiveTracking() {
    console.log('[LiveTracking] Stopping live tracking');
    
    if (liveTrackingState.watchId !== null) {
        navigator.geolocation.clearWatch(liveTrackingState.watchId);
        liveTrackingState.watchId = null;
    }
    
    // Update UI
    const toggleButton = document.getElementById('live-tracking-toggle');
    
    if (toggleButton) {
        toggleButton.textContent = '🔴 Start Live Tracking';
        toggleButton.classList.remove('active');
    }
    
    liveTrackingState.isActive = false;
    console.log('[LiveTracking] Live tracking stopped');
}

// Update live position
function updateLivePosition(position) {
    const now = Date.now();
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    // Check if enough time has passed based on fixed 30-second interval
    const minInterval = 30000; // Fixed 30 seconds
    
    if (liveTrackingState.lastUpdate && (now - liveTrackingState.lastUpdate) < minInterval) {
        return; // Skip this update to save battery
    }
    
    liveTrackingState.lastUpdate = now;
    
    console.log(`[LiveTracking] Position update: ${lat}, ${lng} (accuracy: ${accuracy}m)`);
    
    // Get map reference
    const mapRef = window.leafletMap || map;
    if (!mapRef) {
        console.error('[LiveTracking] Map not available');
        return;
    }
    
    // Remove existing markers
    if (liveTrackingState.currentMarker) {
        mapRef.removeLayer(liveTrackingState.currentMarker);
    }
    if (liveTrackingState.accuracyCircle) {
        mapRef.removeLayer(liveTrackingState.accuracyCircle);
    }
    
    // Create new location marker (red circle like "Where Am I")
    liveTrackingState.currentMarker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#ff0000',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
        interactive: true,
        bubblingMouseEvents: false
    }).addTo(mapRef);
    
    // Add accuracy circle if accuracy is reasonable
    if (accuracy < 100) {
        liveTrackingState.accuracyCircle = L.circle([lat, lng], {
            radius: accuracy,
            fillColor: '#ff0000',
            color: '#ff0000',
            weight: 1,
            opacity: 0.3,
            fillOpacity: 0.1
        }).addTo(mapRef);
    }
    
    // Optionally center map on new position (can be made configurable)
    // mapRef.setView([lat, lng], mapRef.getZoom());
}

// Handle tracking errors
function handleTrackingError(error) {
    console.error('[LiveTracking] Error:', error);
    
    let errorMessage = 'GPS error: ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location unavailable';
            break;
        case error.TIMEOUT:
            errorMessage += 'Location timeout';
            break;
        default:
            errorMessage += 'Unknown error';
            break;
    }
    
    // Show error in console and optionally alert user
    console.error('[LiveTracking]', errorMessage);
    // Optionally show alert: alert(errorMessage);
}

// Auto-stop tracking when page is hidden (battery saving)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && liveTrackingState.isActive) {
        console.log('[LiveTracking] Page hidden, continuing tracking in background');
        // Could optionally reduce update frequency here
    } else if (!document.hidden && liveTrackingState.isActive) {
        console.log('[LiveTracking] Page visible, resuming normal tracking');
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[LiveTracking] DOM ready, initializing live tracking');
    setTimeout(initializeLiveTracking, 1000); // Delay to ensure other elements are loaded
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (liveTrackingState.isActive) {
        stopLiveTracking();
    }
});

