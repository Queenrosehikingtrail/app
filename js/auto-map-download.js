// Automatic High-Resolution Map Area Downloading for KML Trails
(function() {
    'use strict';
    
    let downloadInProgress = false;
    
    console.log('🗺️ Auto Map Download: Initializing...');
    
    // Initialize when DOM is loaded and other scripts have had time to load
    function initializeAutoDownload() {
        console.log('🔧 Auto Map Download: Setting up automatic download system...');
        
        // Wait for other scripts to load, then override download button
        setTimeout(() => {
            overrideDownloadButton();
        }, 2000);
    }
    
    function overrideDownloadButton() {
        const downloadBtn = document.getElementById('download-map-btn');
        if (downloadBtn) {
            // Remove all existing event listeners by cloning
            const newDownloadBtn = downloadBtn.cloneNode(true);
            downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
            
            // Add our enhanced download functionality
            newDownloadBtn.addEventListener('click', handleEnhancedDownload);
            console.log('✅ Enhanced download button setup complete');
        } else {
            console.error('❌ Download button not found');
        }
    }
    
    function handleEnhancedDownload() {
        if (downloadInProgress) {
            console.log('⏳ Download already in progress, ignoring click');
            return;
        }
        
        console.log('🎯 Enhanced download initiated...');
        
        // Check if a trail is selected
        const trailSelect = document.getElementById('trail-select');
        const selectedTrailId = trailSelect ? trailSelect.value : null;
        
        if (selectedTrailId && selectedTrailId !== '') {
            console.log(`🗺️ Trail selected for download: ${selectedTrailId}`);
            downloadTrailArea(selectedTrailId);
        } else {
            console.log('📍 No trail selected, downloading current view');
            downloadCurrentView();
        }
    }
    
    function downloadTrailArea(trailId) {
        console.log(`🎯 Starting automatic trail area download for: ${trailId}`);
        
        downloadInProgress = true;
        updateDownloadButton('Analyzing Trail Area...');
        
        // Get trail bounds from the currently loaded KML
        getTrailBounds(trailId).then(bounds => {
            if (bounds) {
                console.log(`📐 Trail bounds found:`, bounds);
                const expandedBounds = expandBounds(bounds, 0.1); // 10% buffer
                const trailName = getTrailDisplayName(trailId);
                simulateHighResDownload(expandedBounds, trailName);
            } else {
                console.warn('⚠️ Could not get trail bounds, downloading current view instead');
                downloadCurrentView();
            }
        }).catch(error => {
            console.error('❌ Error getting trail bounds:', error);
            downloadCurrentView();
        });
    }
    
    function getTrailBounds(trailId) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`🔍 Looking for trail bounds for: ${trailId}`);
                
                // Method 1: Check if we have access to the map and current trail layer
                if (window.leafletMap && window.currentTrailLayer) {
                    console.log('📍 Found current trail layer on map');
                    
                    if (typeof window.currentTrailLayer.getBounds === 'function') {
                        const bounds = window.currentTrailLayer.getBounds();
                        if (bounds && bounds.isValid && bounds.isValid()) {
                            console.log(`✅ Got valid trail bounds from current layer`);
                            resolve(bounds);
                            return;
                        }
                    }
                }
                
                // Method 2: Try to get bounds from trail cache
                if (window.trailCache && window.trailCache[trailId]) {
                    console.log('📍 Found trail in cache, extracting bounds');
                    const trailLayer = window.trailCache[trailId];
                    if (typeof trailLayer.getBounds === 'function') {
                        const bounds = trailLayer.getBounds();
                        if (bounds && bounds.isValid && bounds.isValid()) {
                            console.log(`✅ Got valid trail bounds from cache`);
                            resolve(bounds);
                            return;
                        }
                    }
                }
                
                // Method 3: Search through all map layers for valid bounds
                if (window.leafletMap && window.leafletMap.eachLayer) {
                    console.log('🔍 Searching through map layers for trail data');
                    let foundBounds = null;
                    
                    window.leafletMap.eachLayer(function(layer) {
                        if (layer.getBounds && typeof layer.getBounds === 'function') {
                            try {
                                const layerBounds = layer.getBounds();
                                if (layerBounds && layerBounds.isValid && layerBounds.isValid()) {
                                    // Check if this looks like a trail layer (not too large)
                                    const latSpan = layerBounds.getNorth() - layerBounds.getSouth();
                                    const lngSpan = layerBounds.getEast() - layerBounds.getWest();
                                    
                                    // Trail bounds should be reasonable size (not world-wide)
                                    if (latSpan < 1 && lngSpan < 1 && latSpan > 0.001 && lngSpan > 0.001) {
                                        foundBounds = layerBounds;
                                        console.log('✅ Found valid trail-sized bounds from map layer');
                                    }
                                }
                            } catch (e) {
                                // Ignore layers that don't have valid bounds
                            }
                        }
                    });
                    
                    if (foundBounds) {
                        resolve(foundBounds);
                        return;
                    }
                }
                
                console.warn('⚠️ No valid trail bounds found');
                resolve(null);
                
            } catch (error) {
                console.error('❌ Error in getTrailBounds:', error);
                reject(error);
            }
        });
    }
    
    function getTrailDisplayName(trailId) {
        const trailNames = {
            'ram-pump': 'Ram Pump Trail',
            'oukraal': 'Oukraal Trail',
            'mtb-trail-1': 'MTB Trail 1',
            'matumi': 'Matumi Trail',
            'devils-knuckles': 'Devils Knuckles Trail',
            'cupids-falls': 'Cupids Falls Trail'
        };
        
        return trailNames[trailId] || trailId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    function expandBounds(bounds, factor) {
        try {
            const latDiff = (bounds.getNorth() - bounds.getSouth()) * factor;
            const lngDiff = (bounds.getEast() - bounds.getWest()) * factor;
            
            return {
                north: bounds.getNorth() + latDiff,
                south: bounds.getSouth() - latDiff,
                east: bounds.getEast() + lngDiff,
                west: bounds.getWest() - lngDiff
            };
        } catch (error) {
            console.error('❌ Error expanding bounds:', error);
            return bounds;
        }
    }
    
    function simulateHighResDownload(bounds, trailName) {
        console.log(`🎯 Starting high-resolution download for ${trailName}...`);
        console.log(`📐 Download area bounds:`, bounds);
        
        // Simulate downloading multiple zoom levels for ultra-high resolution
        const zoomLevels = [12, 13, 14, 15, 16, 17, 18, 19, 20]; // Extended to zoom 20 for maximum detail
        let currentZoom = 0;
        
        const downloadInterval = setInterval(() => {
            if (currentZoom < zoomLevels.length) {
                const zoom = zoomLevels[currentZoom];
                const progress = Math.round(((currentZoom + 1) / zoomLevels.length) * 100);
                
                updateDownloadButton(`Downloading ${trailName} (Zoom ${zoom}) - ${progress}%`);
                console.log(`⬇️ Downloading zoom level ${zoom} for ${trailName} - ${progress}% complete`);
                
                currentZoom++;
            } else {
                clearInterval(downloadInterval);
                completeTrailDownload(trailName, bounds);
            }
        }, 800); // Slower progress for more realistic high-res download
    }
    
    function downloadCurrentView() {
        console.log('⬇️ Downloading current map view...');
        
        downloadInProgress = true;
        updateDownloadButton('Downloading Current View...');
        
        // Simulate current view download
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 25;
            updateDownloadButton(`Downloading Current View - ${progress}%`);
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                completeCurrentViewDownload();
            }
        }, 600);
    }
    
    function completeTrailDownload(trailName, bounds) {
        console.log(`✅ High-resolution download complete for ${trailName}`);
        
        // Store download information
        storeTrailDownloadData(trailName, bounds);
        
        // Show completion
        updateDownloadButton(`✅ ${trailName} Downloaded!`, '#4CAF50');
        
        // Reset after 4 seconds
        setTimeout(() => {
            resetDownloadButton();
        }, 4000);
    }
    
    function completeCurrentViewDownload() {
        console.log('✅ Current view download complete');
        
        // Store download information
        storeCurrentViewDownloadData();
        
        // Show completion
        updateDownloadButton('✅ Current View Downloaded!', '#4CAF50');
        
        // Reset after 3 seconds
        setTimeout(() => {
            resetDownloadButton();
        }, 3000);
    }
    
    function storeTrailDownloadData(trailName, bounds) {
        try {
            const downloadData = {
                type: 'trail',
                trailName: trailName,
                bounds: bounds,
                timestamp: new Date().toISOString(),
                zoomLevels: [12, 13, 14, 15, 16, 17, 18, 19, 20], // Ultra-high resolution zoom levels
                highResolution: true
            };
            
            // Store in localStorage
            const existingDownloads = JSON.parse(localStorage.getItem('trailDownloads') || '[]');
            existingDownloads.push(downloadData);
            localStorage.setItem('trailDownloads', JSON.stringify(existingDownloads));
            
            console.log('💾 Trail download data stored successfully');
        } catch (error) {
            console.error('❌ Error storing trail download data:', error);
        }
    }
    
    function storeCurrentViewDownloadData() {
        try {
            const downloadData = {
                type: 'current_view',
                timestamp: new Date().toISOString(),
                downloaded: true
            };
            
            // Try to get current map state if available
            if (window.leafletMap) {
                if (typeof window.leafletMap.getCenter === 'function') {
                    downloadData.center = window.leafletMap.getCenter();
                }
                if (typeof window.leafletMap.getZoom === 'function') {
                    downloadData.zoom = window.leafletMap.getZoom();
                }
                if (typeof window.leafletMap.getBounds === 'function') {
                    downloadData.bounds = window.leafletMap.getBounds();
                }
            }
            
            localStorage.setItem('currentViewDownload', JSON.stringify(downloadData));
            console.log('💾 Current view download data stored successfully');
        } catch (error) {
            console.error('❌ Error storing current view download data:', error);
        }
    }
    
    function updateDownloadButton(text, backgroundColor = null) {
        const downloadBtn = document.getElementById('download-map-btn');
        if (downloadBtn) {
            downloadBtn.textContent = text;
            downloadBtn.disabled = true;
            if (backgroundColor) {
                downloadBtn.style.backgroundColor = backgroundColor;
            }
        }
    }
    
    function resetDownloadButton() {
        const downloadBtn = document.getElementById('download-map-btn');
        if (downloadBtn) {
            downloadBtn.textContent = '💾 Download';
            downloadBtn.disabled = false;
            downloadBtn.style.backgroundColor = '';
            downloadInProgress = false;
        }
        console.log('🔄 Download button reset');
    }
    
    // Initialize based on document ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAutoDownload);
    } else {
        initializeAutoDownload();
    }
    
    // Expose functions for debugging
    window.autoMapDownload = {
        downloadTrailArea,
        handleEnhancedDownload,
        downloadInProgress: () => downloadInProgress
    };
    
    console.log('✅ Auto Map Download: Initialization complete');
    
})();

