// ANDROID LOCATION FIX - Completely new location marker system for Android
console.log('🤖 ANDROID LOCATION FIX: Loading Android-specific location system');

let androidLocationMarker = null;
let androidLocationAccuracy = null;

// Override the existing location tracking function completely
window.androidLocationOverride = function() {
    console.log('🤖 ANDROID LOCATION FIX: Starting Android location override');
    
    // Remove any existing markers first
    if (androidLocationMarker) {
        try {
            window.leafletMap.removeLayer(androidLocationMarker);
        } catch (e) {
            console.log('🤖 ANDROID LOCATION FIX: Removed old marker');
        }
    }
    
    if (androidLocationAccuracy) {
        try {
            window.leafletMap.removeLayer(androidLocationAccuracy);
        } catch (e) {
            console.log('🤖 ANDROID LOCATION FIX: Removed old accuracy circle');
        }
    }
    
    // Get current location with Android-optimized settings
    if (navigator.geolocation) {
        const button = document.getElementById('track-location-btn');
        let countdownInterval = null;
        
        // Clear countdown on completion
        const clearCountdown = () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        };
        
        if (button) {
            button.textContent = '🔍 Locating...';
            
            // Add countdown feedback
            let countdown = 15;
            countdownInterval = setInterval(() => {
                countdown--;
                if (button && countdown > 0) {
                    button.textContent = `🔍 Locating... ${countdown}s`;
                }
            }, 1000);
        }
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log('🤖 ANDROID LOCATION FIX: Got position:', position.coords);
                
                // Clear countdown immediately on success
                const button = document.getElementById('track-location-btn');
                if (button) clearCountdown();
                
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                console.log(`🤖 ANDROID LOCATION FIX: Creating marker at ${lat}, ${lng} (accuracy: ${accuracy}m)`);
                
                // Method 1: Create accuracy circle first
                if (accuracy && accuracy < 1000) {
                    androidLocationAccuracy = L.circle([lat, lng], {
                        radius: accuracy,
                        color: '#ff0000',
                        fillColor: '#ff0000',
                        fillOpacity: 0.1,
                        weight: 1
                    });
                    
                    androidLocationAccuracy.addTo(window.leafletMap);
                    console.log('🤖 ANDROID LOCATION FIX: Added accuracy circle');
                }
                
                // Method 2: Create location marker with Android-specific settings
                androidLocationMarker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: '#ff0000',
                    color: '#ffffff',
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 1,
                    // Android-specific options
                    interactive: true,
                    bubblingMouseEvents: false,
                    pane: 'markerPane'
                });
                
                // NO POPUP - User requested coordinates banner to be hidden
                
                // Add marker to map
                androidLocationMarker.addTo(window.leafletMap);
                console.log('🤖 ANDROID LOCATION FIX: Added location marker');
                
                // Method 3: Center map on location with Android-specific timing
                setTimeout(() => {
                    try {
                        window.leafletMap.setView([lat, lng], 16, {
                            animate: true,
                            duration: 1.0
                        });
                        console.log('🤖 ANDROID LOCATION FIX: Centered map on location');
                        
                        // NO POPUP - User requested coordinates banner to be hidden
                        
                    } catch (error) {
                        console.error('🤖 ANDROID LOCATION FIX: Error centering map:', error);
                    }
                }, 100);
                
                // Update button
                if (button) {
                    button.textContent = '📍 Located!';
                    setTimeout(() => {
                        button.textContent = '📍 Where Am I';
                    }, 3000);
                }
                
                // Position updated successfully
                console.log('🤖 ANDROID LOCATION FIX: Position updated successfully');
                
            },
            function(error) {
                console.error('🤖 ANDROID LOCATION FIX: Location error:', error);
                
                // Clear countdown immediately on error
                const button = document.getElementById('track-location-btn');
                if (button) {
                    clearCountdown();
                    button.textContent = '❌ GPS Error';
                    setTimeout(() => {
                        button.textContent = '📍 Where Am I';
                    }, 3000);
                }
                
                // Show user-friendly error message
                let errorMessage = 'Location access denied. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location services in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable. Try moving to an open area.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out. Please try again.';
                        break;
                    default:
                        errorMessage += 'Unknown error occurred.';
                        break;
                }
                
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,  // Reduced to 15 seconds for better UX
                maximumAge: 5000 // Accept positions up to 5 seconds old
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
};

// Override the Where Am I button when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 ANDROID LOCATION FIX: Setting up button override');
    
    setTimeout(() => {
        const button = document.getElementById('track-location-btn');
        if (button) {
            // Remove all existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add our Android-specific handler
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🤖 ANDROID LOCATION FIX: Button clicked - starting Android location override');
                window.androidLocationOverride();
            });
            
            console.log('🤖 ANDROID LOCATION FIX: Button override installed');
        }
    }, 1000);
});

console.log('✅ ANDROID LOCATION FIX: Android location system loaded');

