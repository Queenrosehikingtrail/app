// Enhanced service worker for Queen Rose Hiking Trail App
const CACHE_NAME = 'queen-rose-hiking-trail-v5';

// Function to get the base path for the current deployment
function getBasePath() {
  return self.registration.scope;
}

// Core app files that must be cached for offline functionality
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './css/first-aid.css',
  './css/vendor/leaflet.css',
  './css/vendor/litepicker.min.css',
  './css/vendor/splide.min.css',
  './js/app.js',
  './js/map.js',
  './js/trails.js',
  './js/gps_tracking.js',
  './js/waypoint_logic.js',
  './js/kml_management.js',
  './js/booking.js',
  './js/weather.js',
  './js/weather_offline.js',
  './js/reviews.js',
  './js/custom-kml-functions.js',
  './js/first-aid.js',
  './js/vendor/leaflet.js',
  './js/vendor/leaflet-gpx.min.js',
  './js/vendor/togeojson.umd.js',
  './js/vendor/dexie.js',
  './js/vendor/leaflet.dexie.min.js',
  './js/vendor/litepicker.min.js',
  './js/vendor/splide.min.js',
  './assets/queens_river_logo.png',
  './assets/hiker_waypoint_icon_yellow.png',
  './manifest.json'
];

// Add KML files to cache - CORRECTED PATHS
const kmlFiles = [
  './kml_normalized/2-DayTrail-19.2km.kml',
  './kml_normalized/2DayTrail,day1-13km.kml',
  './kml_normalized/2DayTrail,day2-6.2km.kml',
  './kml_normalized/2day1.kml',
  './kml_normalized/2day2.kml',
  './kml_normalized/2dayfull.kml',
  './kml_normalized/3-DayTrail-39.5km.kml',
  './kml_normalized/3DayTrail,day1-10.9km.kml',
  './kml_normalized/3DayTrail,day2-13km.kml',
  './kml_normalized/3DayTrail,day3-15.6km.kml',
  './kml_normalized/3day1.kml',
  './kml_normalized/3day2.kml',
  './kml_normalized/3day3.kml',
  './kml_normalized/3dayfull.kml',
  './kml_normalized/4-DayTrail-49km.kml',
  './kml_normalized/4DayTrail,day1-15.6km.kml',
  './kml_normalized/4DayTrail,day2-6.2km.kml',
  './kml_normalized/4DayTrail,day3-13km.kml',
  './kml_normalized/4DayTrail,day4-14.2km.kml',
  './kml_normalized/4day1.kml',
  './kml_normalized/4day2.kml',
  './kml_normalized/4day3.kml',
  './kml_normalized/4day4.kml',
  './kml_normalized/4dayfull.kml',
  './kml_normalized/5-DayTrail-53.5km.kml',
  './kml_normalized/5DayTrail,day1-10.9km.kml',
  './kml_normalized/5DayTrail,day2-12.5km.kml',
  './kml_normalized/5DayTrail,day3-13km.kml',
  './kml_normalized/5DayTrail,day4-6.2km.kml',
  './kml_normalized/5DayTrail,day5-10.9km.kml',
  './kml_normalized/5day1.kml',
  './kml_normalized/5day2.kml',
  './kml_normalized/5day3.kml',
  './kml_normalized/5day4.kml',
  './kml_normalized/5day5.kml',
  './kml_normalized/5dayfull.kml',
  './kml_normalized/6-DayTrail-64.7km.kml',
  './kml_normalized/6DayTrail,day1-10.9km.kml',
  './kml_normalized/6DayTrail,day2-12.5km.kml',
  './kml_normalized/6DayTrail,day3-13km.kml',
  './kml_normalized/6DayTrail,day4-6.2km.kml',
  './kml_normalized/6DayTrail,day5-6.5km.kml',
  './kml_normalized/6DayTrail,day6-15.6km.kml',
  './kml_normalized/6day1.kml',
  './kml_normalized/6day2.kml',
  './kml_normalized/6day3.kml',
  './kml_normalized/6day4.kml',
  './kml_normalized/6day5.kml',
  './kml_normalized/6day6.kml',
  './kml_normalized/6dayfull.kml',
  './kml_normalized/CupidsFallsTrail-2.8km.kml',
  './kml_normalized/DevilsKnucklesTrail-10.9km.kml',
  './kml_normalized/MTBTrail1-29.9km.kml',
  './kml_normalized/MatumiTrail-6.2km.kml',
  './kml_normalized/OukraalTrail-12.5km.kml',
  './kml_normalized/RamPumpTrail-1.6km.kml',
  './kml_normalized/cupidsfalls.kml',
  './kml_normalized/devilsknuckles.kml',
  './kml_normalized/matumi.kml',
  './kml_normalized/mtbtrail1.kml',
  './kml_normalized/oukraal.kml',
  './kml_normalized/rampump.kml'
];

// Add elevation images to cache
const elevationImages = [
  './img/elevation/3 day trail - day 1 elevation.jpg',
  './img/elevation/3 day trail - day 2 elevation.jpg',
  './img/elevation/3 day trail - day 3 elevation.jpg',
  './img/elevation/4 day trail - day 1 elevation.jpg',
  './img/elevation/4 day trail - day 2 elevation.jpg',
  './img/elevation/4 day trail - day 3 elevation.jpg',
  './img/elevation/4 day trail - day 4 elevation.jpg',
  './img/elevation/5 day trail - day 1 elevation.jpg',
  './img/elevation/5 day trail - day 2 elevation.jpg',
  './img/elevation/5 day trail - day 3 elevation.jpg',
  './img/elevation/5 day trail - day 4 elevation.jpg',
  './img/elevation/5 day trail - day 5 elevation.jpg',
  './img/elevation/6 day trail - day 1 elevation.jpg',
  './img/elevation/6 day trail - day 2 elevation.jpg',
  './img/elevation/6 day trail - day 3 elevation.jpg',
  './img/elevation/6 day trail - day 4 elevation.jpg',
  './img/elevation/6 day trail - day 5 elevation.jpg',
  './img/elevation/6 day trail - day 6 elevation.jpg',
  './img/elevation/Cupids Trail Elevation.jpg',
  './img/elevation/Devils Knuckles Trail Elevation.jpg',
  './img/elevation/Matumi Lane Trail Elevation.jpg',
  './img/elevation/Mountain Bike Trail Elevations.jpg',
  './img/elevation/Ou Kraal Trail Elevation.jpg',
  './img/elevation/Ram Pump Trail Elevation.jpg'
];

// Combine core resources to cache (including KML files for offline access)
const allResourcesToCache = [...urlsToCache, ...kmlFiles];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core resources');
        // Cache files individually to avoid failures
        return Promise.allSettled(
          allResourcesToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn('[Service Worker] Failed to cache:', url, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] Installation failed:', err);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Consolidated fetch handler for all requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const requestURL = event.request.url;
  
  // Special handling for navigation requests (HTML pages)
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    
    console.log('[Service Worker] Navigation request for:', requestURL);
    
    event.respondWith(
      // Try cache first for navigation requests when offline
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Returning cached navigation response');
            return cachedResponse;
          }
          
          // If not in cache, try cached index.html
          return caches.match('./index.html')
            .then(indexResponse => {
              if (indexResponse) {
                console.log('[Service Worker] Returning cached index.html');
                return indexResponse;
              }
              
              // If no cached index.html, try network
              console.log('[Service Worker] No cached navigation response, trying network');
              return fetch(event.request)
                .catch(error => {
                  console.log('[Service Worker] Navigation fetch failed:', error);
                  // Create a simple offline page as last resort
                  return new Response(
                    '<html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please reconnect to use the Queen Rose Hiking Trail App.</p></body></html>',
                    { headers: { 'Content-Type': 'text/html' } }
                  );
                });
            });
        })
    );
    return; // Exit early after handling navigation request
  }
  
  // Special handling for map tiles
  if (requestURL.includes('tile.openstreetmap.org') || 
      requestURL.includes('api.mapbox.com')) {
    
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] Fetch failed for map tile, trying cache');
          return caches.match(event.request);
        })
    );
    return; // Exit early after handling map tiles
  }
  
  // Default handling for all other requests (cache first, then network)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          console.log('[Service Worker] Returning cached response for:', requestURL);
          return cachedResponse;
        }
        
        // Otherwise try to fetch from network
        console.log('[Service Worker] Cache miss, fetching from network:', requestURL);
        return fetch(event.request.clone())
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache map tiles from external sources to avoid excessive storage
                if (!requestURL.includes('tile.openstreetmap.org') && 
                    !requestURL.includes('api.mapbox.com')) {
                  console.log('[Service Worker] Caching new resource:', requestURL);
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed:', error);
            // You could return a custom offline page or fallback here
          });
      })
  );
});

console.log('[Service Worker] Script loaded - Version 3');
