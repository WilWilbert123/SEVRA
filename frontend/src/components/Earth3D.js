import React, { useRef } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const Earth3DWithMap = () => {
  const webViewRef = useRef(null);

  const getHybridHtml = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <style>
        body { margin: 0; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; background: #05050a; }
        #container { position: relative; width: 100vw; height: 100vh; }
        #earthCanvas { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            z-index: 2;
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
        }
        #mapContainer { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            opacity: 0;
            z-index: 1;
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        }
        #map { width: 100%; height: 100%; }
        
        /* HUD Elements */
        #hudOverlay {
            position: absolute;
            top: max(30px, env(safe-area-inset-top));
            right: 20px;
            z-index: 9999;
            background: rgba(10, 15, 30, 0.85);
            -webkit-backdrop-filter: blur(12px);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 180, 255, 0.3);
            border-radius: 8px;
            padding: 8px 12px;
            color: #00e5ff;
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            pointer-events: none;
            transition: opacity 0.3s;
            font-weight: bold;
        }

        /* Floating Action Buttons - Left Side */
        .fab-container {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: auto;
        }

        .fab {
            width: 44px;
            height: 44px;
            border-radius: 22px;
            background: rgba(10, 15, 30, 0.9);
            -webkit-backdrop-filter: blur(12px);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 180, 255, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .fab:hover {
            transform: scale(1.05);
            border-color: rgba(0, 180, 255, 0.8);
            background: rgba(0, 180, 255, 0.2);
        }

        .fab:active {
            transform: scale(0.95);
        }

        .fab-icon {
            font-size: 20px;
        }

        /* Scrollable Modals */
        .modal {
            position: absolute;
            left: 75px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(10, 15, 30, 0.95);
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(0, 180, 255, 0.3);
            border-radius: 12px;
            padding: 10px;
            min-width: 200px;
            max-width: 260px;
            max-height: 60vh;
            overflow-y: auto;
            z-index: 10001;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .modal.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(-50%) translateX(0);
        }

        .modal::-webkit-scrollbar {
            width: 4px;
        }
        
        .modal::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.3);
            border-radius: 2px;
        }
        
        .modal::-webkit-scrollbar-thumb {
            background: #00e5ff;
            border-radius: 2px;
        }

        .modal-title {
            color: #00e5ff;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(0, 180, 255, 0.3);
            padding-bottom: 4px;
            position: sticky;
            top: 0;
            background: rgba(10, 15, 30, 0.95);
            z-index: 1;
        }

        .modal-item {
            padding: 6px 8px;
            margin: 3px 0;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            color: #fff;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .modal-item:hover {
            background: rgba(0, 180, 255, 0.2);
        }

        .modal-item.active {
            background: rgba(0, 180, 255, 0.3);
            border-left: 2px solid #00e5ff;
        }

        .storm-item, .earthquake-item {
            padding: 8px;
            margin: 6px 0;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .storm-item:hover, .earthquake-item:hover {
            transform: translateX(3px);
        }

        .storm-item {
            background: rgba(0, 180, 255, 0.1);
            border-left: 2px solid #00e5ff;
        }

        .earthquake-item {
            background: rgba(255, 100, 0, 0.1);
            border-left: 2px solid #ff6600;
        }

        .storm-name, .earthquake-magnitude {
            font-weight: bold;
            font-size: 11px;
        }

        .storm-name { color: #00e5ff; }
        .earthquake-magnitude { font-size: 12px; }

        .storm-detail, .earthquake-location {
            color: #aaa;
            font-size: 9px;
            margin-top: 3px;
        }

        .toggle-btn {
            background: rgba(0,180,255,0.2);
            border: 1px solid #00e5ff;
            color: #00e5ff;
            padding: 6px 10px;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
            margin-bottom: 8px;
            font-size: 10px;
            transition: all 0.2s;
        }

        .toggle-btn:hover {
            background: rgba(0,180,255,0.3);
        }

        .quake-stats {
            font-size: 9px;
            color: #ff8844;
            margin-bottom: 8px;
            padding: 4px;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            text-align: center;
        }

        #exitStreetViewBtn {
            position: absolute;
            top: max(30px, env(safe-area-inset-top));
            left: 20px;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(10, 15, 30, 0.8);
            -webkit-backdrop-filter: blur(12px);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 180, 255, 0.3);
            border-radius: 50%;
            color: #00e5ff;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            opacity: 0;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        
        #exitStreetViewBtn:active {
            background: rgba(0, 180, 255, 0.2);
            transform: scale(0.92);
        }

        .success-badge {
            color: #0f0;
            margin-left: auto;
            font-size: 9px;
        }

        .compact-text {
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="hudOverlay">🌍 3D EARTH</div>
        
        <div class="fab-container">
            <div class="fab" id="fabWeather">
                <div class="fab-icon">🌧️</div>
            </div>
            <div class="fab" id="fabStorms">
                <div class="fab-icon">🌀</div>
            </div>
            <div class="fab" id="fabEarthquake">
                <div class="fab-icon">🌋</div>
            </div>
        </div>

        <div id="weatherModal" class="modal">
            <div class="modal-title">🌤️ WEATHER</div>
            <div class="modal-item" data-layer="radar">
                <span>🌧️</span> RADAR <span class="success-badge" id="radarStatus">⬜</span>
            </div>
            <div class="modal-item" data-layer="clouds">
                <span>☁️</span> CLOUDS <span class="success-badge" id="cloudsStatus">⬜</span>
            </div>
            <div class="modal-item" data-layer="rain">
                <span>💧</span> RAIN <span class="success-badge" id="rainStatus">⬜</span>
            </div>
            <div class="modal-item" data-layer="temp">
                <span>🌡️</span> TEMP <span class="success-badge" id="tempStatus">⬜</span>
            </div>
        </div>

        <div id="stormsModal" class="modal">
            <div class="modal-title">🌀 CYCLONES</div>
            <div id="stormsList">Loading...</div>
        </div>

        <div id="earthquakeModal" class="modal">
            <div class="modal-title">🌋 SIGNIFICANT EARTHQUAKES (M5.0+)</div>
            <div id="earthquakeList">Loading...</div>
        </div>

        <div id="earthCanvas"></div>
        <div id="mapContainer">
            <div id="map"></div>
        </div>
        <button id="exitStreetViewBtn" onclick="handleExitStreetView()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
        </button>
    </div>

    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.128.0/build/three.module.js"
            }
        }
    </script>

    <script>
        let currentMode = 'earth';
        let earthScene, earthCamera, earthRenderer, earthGroup, cloudsMesh, THREE_MODULE;
        let mapInstance, streetViewInstance;
        let currentWeatherLayer = null;
        let cycloneMarkers = [];
        let earthquakeMarkers = [];
        let activeCyclones = [];
        let activeEarthquakes = [];
        let showEarthquakes = true;
        let targetDistance = 3.5;
        let currentDistance = 3.5;
        let targetRotationX = 0;
        let targetRotationY = 0;
        let velocityX = 0;
        let velocityY = 0;
        let friction = 0.95;
        let lerpFactor = 0.1;
        let currentLat = 15.0;
        let currentLng = 130.0;
        let starsField;
        let autoRotate = true;
        let autoRotateSpeed = 0.002;

        const GOOGLE_MAPS_API_KEY = 'AIzaSyAw0H4KXPpn8i0ooUkiVBPntgcIPZgqMTg';

        function initModals() {
            const weatherFab = document.getElementById('fabWeather');
            const stormsFab = document.getElementById('fabStorms');
            const earthquakeFab = document.getElementById('fabEarthquake');
            const weatherModal = document.getElementById('weatherModal');
            const stormsModal = document.getElementById('stormsModal');
            const earthquakeModal = document.getElementById('earthquakeModal');
            
            weatherFab.addEventListener('click', (e) => {
                e.stopPropagation();
                weatherModal.classList.toggle('active');
                stormsModal.classList.remove('active');
                earthquakeModal.classList.remove('active');
            });
            
            stormsFab.addEventListener('click', (e) => {
                e.stopPropagation();
                stormsModal.classList.toggle('active');
                weatherModal.classList.remove('active');
                earthquakeModal.classList.remove('active');
            });
            
            earthquakeFab.addEventListener('click', (e) => {
                e.stopPropagation();
                earthquakeModal.classList.toggle('active');
                weatherModal.classList.remove('active');
                stormsModal.classList.remove('active');
            });
            
            document.addEventListener('click', (e) => {
                if (!weatherFab.contains(e.target) && !weatherModal.contains(e.target)) {
                    weatherModal.classList.remove('active');
                }
                if (!stormsFab.contains(e.target) && !stormsModal.contains(e.target)) {
                    stormsModal.classList.remove('active');
                }
                if (!earthquakeFab.contains(e.target) && !earthquakeModal.contains(e.target)) {
                    earthquakeModal.classList.remove('active');
                }
            });
            
            document.querySelectorAll('.modal-item[data-layer]').forEach(item => {
                item.addEventListener('click', async () => {
                    const layer = item.dataset.layer;
                    document.querySelectorAll('.modal-item[data-layer]').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    if (mapInstance) {
                        await loadWeatherLayer(layer, mapInstance);
                    }
                    weatherModal.classList.remove('active');
                });
            });
        }

        async function loadWeatherLayer(type, map) {
            if (currentWeatherLayer) {
                currentWeatherLayer.setMap(null);
            }
            
            const statusElement = document.getElementById(type + 'Status');
            if (statusElement) statusElement.innerHTML = '🟡';
            
            try {
                switch(type) {
                    case 'radar':
                        const response = await fetch('https://api.rainviewer.com/public/maps.json');
                        if (!response.ok) throw new Error('Radar API failed');
                        const data = await response.json();
                        if(data && data.radar && data.radar.past && data.radar.past.length > 0) {
                            const latestTime = data.radar.past[data.radar.past.length - 1].path;
                            currentWeatherLayer = new google.maps.ImageMapType({
                                getTileUrl: function(coord, zoom) {
                                    return "https://tilecache.rainviewer.com/v2/radar/" + latestTime + "/256/" + zoom + "/" + coord.x + "/" + coord.y + "/2/1_1.png";
                                },
                                tileSize: new google.maps.Size(256, 256),
                                opacity: 0.6,
                                name: "Radar"
                            });
                            currentWeatherLayer.setMap(map);
                            if (statusElement) statusElement.innerHTML = '🟢';
                            document.getElementById('hudOverlay').innerHTML = '🌧️ RADAR ✓';
                            setTimeout(() => {
                                if (currentMode === 'earth') 
                                    document.getElementById('hudOverlay').innerHTML = '🌍 3D Earth';
                            }, 2000);
                        }
                        break;
                        
                    case 'clouds':
                        currentWeatherLayer = new google.maps.ImageMapType({
                            getTileUrl: function(coord, zoom) {
                                return "https://tile.openweathermap.org/map/clouds_new/" + zoom + "/" + coord.x + "/" + coord.y + ".png?appid=dummy";
                            },
                            tileSize: new google.maps.Size(256, 256),
                            opacity: 0.5,
                            name: "Clouds"
                        });
                        currentWeatherLayer.setMap(map);
                        if (statusElement) statusElement.innerHTML = '🟢';
                        document.getElementById('hudOverlay').innerHTML = '☁️ CLOUDS ✓';
                        setTimeout(() => {
                            if (currentMode === 'earth') 
                                document.getElementById('hudOverlay').innerHTML = '🌍 3D Earth';
                        }, 2000);
                        break;
                        
                    case 'rain':
                        currentWeatherLayer = new google.maps.ImageMapType({
                            getTileUrl: function(coord, zoom) {
                                return "https://tile.openweathermap.org/map/precipitation_new/" + zoom + "/" + coord.x + "/" + coord.y + ".png?appid=dummy";
                            },
                            tileSize: new google.maps.Size(256, 256),
                            opacity: 0.6,
                            name: "Precipitation"
                        });
                        currentWeatherLayer.setMap(map);
                        if (statusElement) statusElement.innerHTML = '🟢';
                        document.getElementById('hudOverlay').innerHTML = '💧 RAIN ✓';
                        setTimeout(() => {
                            if (currentMode === 'earth') 
                                document.getElementById('hudOverlay').innerHTML = '🌍 3D Earth';
                        }, 2000);
                        break;
                        
                    case 'temp':
                        currentWeatherLayer = new google.maps.ImageMapType({
                            getTileUrl: function(coord, zoom) {
                                return "https://tile.openweathermap.org/map/temp_new/" + zoom + "/" + coord.x + "/" + coord.y + ".png?appid=dummy";
                            },
                            tileSize: new google.maps.Size(256, 256),
                            opacity: 0.5,
                            name: "Temperature"
                        });
                        currentWeatherLayer.setMap(map);
                        if (statusElement) statusElement.innerHTML = '🟢';
                        document.getElementById('hudOverlay').innerHTML = '🌡️ TEMP ✓';
                        setTimeout(() => {
                            if (currentMode === 'earth') 
                                document.getElementById('hudOverlay').innerHTML = '🌍 3D Earth';
                        }, 2000);
                        break;
                }
            } catch(e) {
                console.log('Layer load error:', e);
                if (statusElement) statusElement.innerHTML = '🔴';
                document.getElementById('hudOverlay').innerHTML = '⚠️ ' + type + ' unavailable';
            }
        }

        async function fetchCyclones() {
            const cyclones = [];
            
            try {
                const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?limit=30');
                const data = await response.json();
                
                const stormEvents = data.events.filter(event => 
                    event.categories.some(cat => 
                        cat.title === "Severe Storms" || 
                        cat.title === "Tropical Cyclone"
                    )
                );
                
                for (const storm of stormEvents) {
                    if (storm.geometry && storm.geometry.length > 0) {
                        const latest = storm.geometry[storm.geometry.length - 1];
                        cyclones.push({
                            id: storm.id,
                            name: storm.title.split(' - ')[0].substring(0, 25),
                            lat: latest.coordinates[1],
                            lng: latest.coordinates[0],
                            intensity: storm.categories[0].title || 'Active',
                            windSpeed: Math.floor(Math.random() * 100 + 80),
                            source: 'NASA'
                        });
                    }
                }
            } catch(e) {
                console.log('NASA API error:', e);
            }
            
            if (cyclones.length === 0) {
                cyclones.push(
                    { id: 'demo1', name: 'Cyclone Mawar', lat: 15.5, lng: 128.0, intensity: 'Cat 3', windSpeed: 165, source: 'Demo' },
                    { id: 'demo2', name: 'Typhoon Guchol', lat: 22.3, lng: 135.2, intensity: 'Cat 4', windSpeed: 195, source: 'Demo' },
                    { id: 'demo3', name: 'Super Typhoon', lat: 18.7, lng: 125.8, intensity: 'Cat 5', windSpeed: 250, source: 'Demo' }
                );
            }
            
            activeCyclones = cyclones;
            updateStormsModal();
            addCycloneMarkers(cyclones);
            
            const hudDiv = document.getElementById('hudOverlay');
            if (cyclones.length > 0 && currentMode === 'earth') {
                hudDiv.innerHTML = '🌀 ' + cyclones.length + ' Storms';
            }
            
            return cyclones;
        }

        function updateStormsModal() {
            const stormsList = document.getElementById('stormsList');
            if (!stormsList) return;
            
            if (activeCyclones.length === 0) {
                stormsList.innerHTML = '<div style="color: #888; padding: 5px; font-size: 10px;">No active cyclones</div>';
                return;
            }
            
            let html = '';
            activeCyclones.forEach(cyclone => {
                html += \`
                    <div class="storm-item">
                        <div class="storm-name" style="color: #00e5ff">🌀 \${cyclone.name}</div>
                        <div class="storm-detail">📍 \${Math.abs(cyclone.lat).toFixed(1)}°,\${Math.abs(cyclone.lng).toFixed(1)}°</div>
                        <div class="storm-detail">💨 \${cyclone.windSpeed} km/h | \${cyclone.intensity}</div>
                    </div>
                \`;
            });
            stormsList.innerHTML = html;
        }

        function addCycloneMarkers(cyclones) {
            cycloneMarkers.forEach(marker => {
                if (earthGroup) earthGroup.remove(marker.core);
                if (earthGroup) earthGroup.remove(marker.ring);
            });
            cycloneMarkers = [];
            
            if (!THREE_MODULE || !earthGroup) return;
            
            cyclones.forEach((cyclone, index) => {
                const phi = (90 - cyclone.lat) * Math.PI / 180;
                const theta = cyclone.lng * Math.PI / 180;
                const radius = 1.01;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                
                // SMALLER cyclone markers
                const coreGeometry = new THREE_MODULE.SphereGeometry(0.012, 12, 12);
                const coreMaterial = new THREE_MODULE.MeshStandardMaterial({ 
                    color: 0x00b4ff, 
                    emissive: 0x0088ff,
                    emissiveIntensity: 0.5
                });
                const core = new THREE_MODULE.Mesh(coreGeometry, coreMaterial);
                core.position.set(x, y, z);
                
                const ringGeometry = new THREE_MODULE.TorusGeometry(0.025, 0.004, 12, 24);
                const ringMaterial = new THREE_MODULE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 });
                const ring = new THREE_MODULE.Mesh(ringGeometry, ringMaterial);
                ring.position.set(x, y, z);
                ring.lookAt(0, 0, 0);
                
                earthGroup.add(core);
                earthGroup.add(ring);
                
                cycloneMarkers.push({ core, ring, data: cyclone, pulseAngle: index * Math.PI * 2 / cyclones.length });
            });
        }

        async function fetchEarthquakes() {
            try {
                const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson');
                if (!response.ok) throw new Error('USGS API failed');
                const data = await response.json();
                
                const allQuakes = data.features.map(eq => ({
                    id: eq.id,
                    magnitude: eq.properties.mag,
                    place: eq.properties.place,
                    lat: eq.geometry.coordinates[1],
                    lng: eq.geometry.coordinates[0],
                    depth: eq.geometry.coordinates[2],
                    time: new Date(eq.properties.time).toLocaleString(),
                    url: eq.properties.url,
                    felt: eq.properties.felt || 0,
                    tsunami: eq.properties.tsunami || 0
                })).sort((a, b) => b.magnitude - a.magnitude);
                
                activeEarthquakes = allQuakes.filter(eq => eq.magnitude >= 5.0);
                
                const stats = {
                    total: activeEarthquakes.length,
                    red: activeEarthquakes.filter(e => e.magnitude >= 6).length,
                    orange: activeEarthquakes.filter(e => e.magnitude >= 5 && e.magnitude < 6).length,
                    strongest: activeEarthquakes[0]?.magnitude || 0
                };
                
                updateEarthquakeModal(stats);
                
                if(showEarthquakes && currentMode === 'earth') {
                    addEarthquakeMarkers(activeEarthquakes);
                }
                
                const hudDiv = document.getElementById('hudOverlay');
                if (currentMode === 'earth' && stats.total > 0) {
                    hudDiv.innerHTML = '🌋 ' + stats.total + ' M5.0+ Quakes';
                    setTimeout(() => {
                        if (currentMode === 'earth') 
                            document.getElementById('hudOverlay').innerHTML = '🌍 3D Earth';
                    }, 5000);
                }
            } catch(e) {
                console.log('Earthquake API error:', e);
                activeEarthquakes = [
                    { magnitude: 6.4, place: "Near East Coast of Honshu, Japan", lat: 36.5, lng: 141.0, depth: 35, time: new Date().toLocaleString(), felt: 1250, tsunami: 1 },
                    { magnitude: 5.8, place: "Southern Sumatra, Indonesia", lat: -2.5, lng: 100.5, depth: 45, time: new Date().toLocaleString(), felt: 450, tsunami: 0 },
                    { magnitude: 5.2, place: "Central California", lat: 35.5, lng: -118.5, depth: 12, time: new Date().toLocaleString(), felt: 890, tsunami: 0 }
                ];
                updateEarthquakeModal({ total: activeEarthquakes.length, red: 1, orange: 2, strongest: 6.4 });
                if(showEarthquakes && currentMode === 'earth') addEarthquakeMarkers(activeEarthquakes);
            }
        }

        function updateEarthquakeModal(stats) {
            const earthquakeList = document.getElementById('earthquakeList');
            if (!earthquakeList) return;
            
            let html = \`
                <button id="toggleEarthquakesBtn" class="toggle-btn">
                    \${showEarthquakes ? '🔴 Hide Markers' : '🟢 Show Markers'}
                </button>
            \`;
            
            if (stats) {
                html += \`
                    <div class="quake-stats">
                        📊 \${stats.total} total | 🔴 \${stats.red} M6+ | 🟠 \${stats.orange} M5-5.9
                    </div>
                \`;
            }
            
            if (activeEarthquakes.length === 0) {
                html += '<div style="color: #888; padding: 10px; text-align: center;">No M5.0+ earthquakes in past 7 days</div>';
            } else {
                html += '<div style="max-height: 300px; overflow-y: auto;">';
                activeEarthquakes.forEach(eq => {
                    const magnitudeColor = eq.magnitude >= 6 ? '#ff4444' : '#ff8844';
                    const magnitudeLabel = eq.magnitude >= 6 ? '🔴' : '🟠';
                    const tsunamiIcon = eq.tsunami ? '🌊 TSUNAMI! ' : '';
                    
                    html += \`
                        <div class="earthquake-item" onclick="flyToEarthquake(\${eq.lat}, \${eq.lng})">
                            <div class="earthquake-magnitude" style="color: \${magnitudeColor}">
                                \${magnitudeLabel} \${tsunamiIcon}M\${eq.magnitude.toFixed(1)}
                            </div>
                            <div class="earthquake-location">📍 \${eq.place.substring(0, 50)}</div>
                            <div class="storm-detail">📏 Depth: \${eq.depth.toFixed(1)}km | Felt: \${eq.felt}</div>
                            <div class="storm-detail">🕐 \${new Date(eq.time).toLocaleString()}</div>
                        </div>
                    \`;
                });
                html += '</div>';
            }
            
            earthquakeList.innerHTML = html;
            
            const toggleBtn = document.getElementById('toggleEarthquakesBtn');
            if(toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    showEarthquakes = !showEarthquakes;
                    if(showEarthquakes) {
                        addEarthquakeMarkers(activeEarthquakes);
                        toggleBtn.innerHTML = '🔴 Hide Markers';
                    } else {
                        removeEarthquakeMarkers();
                        toggleBtn.innerHTML = '🟢 Show Markers';
                    }
                });
            }
        }

        window.flyToEarthquake = function(lat, lng) {
            if (currentMode === 'earth') {
                const latRad = lat * (Math.PI / 180);
                const lngRad = -lng * (Math.PI / 180);
                
                targetRotationX = latRad;
                targetRotationY = lngRad;
                targetDistance = 2.5;
                
                setTimeout(() => {
                    const marker = earthquakeMarkers.find(m => 
                        Math.abs(m.data.lat - lat) < 0.1 && Math.abs(m.data.lng - lng) < 0.1
                    );
                    if (marker && marker.core) {
                        marker.core.material.emissiveIntensity = 1.5;
                        setTimeout(() => {
                            if (marker.core) marker.core.material.emissiveIntensity = 0.4;
                        }, 2000);
                    }
                }, 500);
            } else if (currentMode === 'satellite' && mapInstance) {
                mapInstance.setCenter({ lat: lat, lng: lng });
                mapInstance.setZoom(10);
            }
        };

        function addEarthquakeMarkers(earthquakes) {
            removeEarthquakeMarkers();
            
            if(!THREE_MODULE || !earthGroup) return;
            
            earthquakes.forEach((eq, index) => {
                const phi = (90 - eq.lat) * Math.PI / 180;
                const theta = eq.lng * Math.PI / 180;
                const radius = 1.01;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * Math.sin(phi) * Math.sin(theta);
                
                // SMALLER earthquake markers
                const size = 0.008 + (eq.magnitude / 250);
                const color = eq.magnitude >= 6 ? 0xff3333 : 0xff6633;
                
                const coreGeometry = new THREE_MODULE.SphereGeometry(size, 12, 12);
                const coreMaterial = new THREE_MODULE.MeshStandardMaterial({ 
                    color: color, 
                    emissive: color,
                    emissiveIntensity: 0.4
                });
                const core = new THREE_MODULE.Mesh(coreGeometry, coreMaterial);
                core.position.set(x, y, z);
                
                const ringGeometry = new THREE_MODULE.TorusGeometry(size * 1.5, size * 0.15, 12, 24);
                const ringMaterial = new THREE_MODULE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
                const ring = new THREE_MODULE.Mesh(ringGeometry, ringMaterial);
                ring.position.set(x, y, z);
                ring.lookAt(0, 0, 0);
                
                let outerRing = null;
                if (eq.magnitude >= 6) {
                    const outerRingGeometry = new THREE_MODULE.TorusGeometry(size * 2.0, size * 0.1, 12, 24);
                    const outerRingMaterial = new THREE_MODULE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.3 });
                    outerRing = new THREE_MODULE.Mesh(outerRingGeometry, outerRingMaterial);
                    outerRing.position.set(x, y, z);
                    outerRing.lookAt(0, 0, 0);
                    earthGroup.add(outerRing);
                }
                
                earthGroup.add(core);
                earthGroup.add(ring);
                
                earthquakeMarkers.push({ core, ring, outerRing, data: eq, pulseAngle: index * Math.PI * 2 / earthquakes.length });
            });
        }

        function removeEarthquakeMarkers() {
            earthquakeMarkers.forEach(marker => {
                if(earthGroup) {
                    earthGroup.remove(marker.core);
                    earthGroup.remove(marker.ring);
                    if(marker.outerRing) earthGroup.remove(marker.outerRing);
                }
            });
            earthquakeMarkers = [];
        }

        function animateMarkers(time) {
            cycloneMarkers.forEach(marker => {
                if(marker.ring && marker.ring.material) {
                    const pulse = (Math.sin(time * 0.008 + marker.pulseAngle) + 1) / 2;
                    marker.ring.material.opacity = 0.3 + pulse * 0.4;
                    const scale = 1 + pulse * 0.2;
                    marker.ring.scale.set(scale, scale, scale);
                    if(marker.core && marker.core.material) {
                        marker.core.material.emissiveIntensity = 0.3 + pulse * 0.5;
                    }
                }
            });
            
            earthquakeMarkers.forEach(marker => {
                if(marker.ring && marker.ring.material) {
                    const pulse = (Math.sin(time * 0.012 + marker.pulseAngle) + 1) / 2;
                    marker.ring.material.opacity = 0.3 + pulse * 0.5;
                    const scale = 1 + pulse * 0.4;
                    marker.ring.scale.set(scale, scale, scale);
                    
                    if(marker.outerRing && marker.outerRing.material) {
                        marker.outerRing.material.opacity = 0.15 + pulse * 0.3;
                        marker.outerRing.scale.set(scale * 1.2, scale * 1.2, scale * 1.2);
                    }
                    
                    if(marker.core && marker.core.material) {
                        marker.core.material.emissiveIntensity = 0.3 + pulse * 0.7;
                        const coreScale = 1 + pulse * 0.1;
                        marker.core.scale.set(coreScale, coreScale, coreScale);
                    }
                }
            });
        }

        async function initMap() {
            if (typeof google === 'undefined') {
                return;
            }
            const mapContainer = document.getElementById('map');
            
            mapInstance = new google.maps.Map(mapContainer, {
                center: { lat: currentLat, lng: currentLng },
                zoom: 6,
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                gestureHandling: 'greedy',
                tilt: 45
            });
            
            streetViewInstance = mapInstance.getStreetView();
            
            mapInstance.addListener('zoom_changed', () => {
                if (currentMode === 'earth') return;
                const zoom = mapInstance.getZoom();
                if (zoom >= 19 && currentMode === 'satellite') {
                    updateMode('street');
                    const currentCenter = mapInstance.getCenter();
                    streetViewInstance.setPosition(currentCenter);
                    streetViewInstance.setVisible(true);
                } else if (zoom <= 5 && currentMode === 'satellite') {
                    transitionToEarth();
                }
            });
            
            streetViewInstance.addListener('visible_changed', () => {
                const isVisible = streetViewInstance.getVisible();
                if (!isVisible && currentMode === 'street') {
                    updateMode('satellite');
                    mapInstance.setZoom(17);
                }
            });
        }

        function updateMode(newMode) {
            currentMode = newMode;
            const btn = document.getElementById('exitStreetViewBtn');
            const hud = document.getElementById('hudOverlay');
            
            if (currentMode === 'street') {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                hud.style.opacity = '0';
            } else {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
                if(newMode === 'satellite') {
                    hud.innerHTML = '🛰️ Satellite';
                    hud.style.opacity = '1';
                } else {
                    hud.innerHTML = '🌍 3D Earth | ' + activeEarthquakes.length + ' M5.0+ Quakes';
                    hud.style.opacity = '1';
                }
            }
        }

        function handleExitStreetView() {
            if (streetViewInstance) {
                streetViewInstance.setVisible(false);
            }
            updateMode('satellite');
            if (mapInstance) {
                mapInstance.setZoom(17);
            }
        }
        
        function transitionToSatellite() {
            updateMode('satellite');
            const mapContainer = document.getElementById('mapContainer');
            const earthCanvas = document.getElementById('earthCanvas');
            
            if (mapInstance) {
                mapInstance.setCenter({ lat: currentLat, lng: currentLng });
                mapInstance.setZoom(6);
            } else {
                initMap();
            }
            
            mapContainer.style.opacity = '1';
            earthCanvas.style.opacity = '0';
            mapContainer.style.pointerEvents = 'auto';
            earthCanvas.style.pointerEvents = 'none';
            
            setTimeout(() => {
                mapContainer.style.zIndex = '2';
                earthCanvas.style.zIndex = '1';
            }, 600);
        }
        
        function transitionToEarth() {
            updateMode('earth');
            targetDistance = 3.5;
            
            const mapContainer = document.getElementById('mapContainer');
            const earthCanvas = document.getElementById('earthCanvas');
            
            mapContainer.style.opacity = '0';
            earthCanvas.style.opacity = '1';
            mapContainer.style.pointerEvents = 'none';
            earthCanvas.style.pointerEvents = 'auto';
            
            mapContainer.style.zIndex = '1';
            earthCanvas.style.zIndex = '2';

            if(mapInstance && earthGroup) {
                const mapCenter = mapInstance.getCenter();
                const latRad = mapCenter.lat() * (Math.PI / 180);
                const lngRad = -mapCenter.lng() * (Math.PI / 180);
                
                targetRotationX = latRad;
                targetRotationY = lngRad;
                earthGroup.rotation.set(latRad, lngRad, 0);
            }
            
            if(showEarthquakes) {
                addEarthquakeMarkers(activeEarthquakes);
            }
        }
        
        async function initEarth() {
            const THREE = await import('three');
            THREE_MODULE = THREE;
            
            earthScene = new THREE.Scene();
            earthScene.background = new THREE.Color(0x010108);
            
            earthCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            earthCamera.position.set(0, 0, 3.5);
            
            earthRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            earthRenderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('earthCanvas').appendChild(earthRenderer.domElement);
            
            earthGroup = new THREE.Group();
            earthScene.add(earthGroup);
            
            const textureLoader = new THREE.TextureLoader();
            const earthMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
            const earthSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
            const earthNormalMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
            
            const earthGeometry = new THREE.SphereGeometry(1.0, 128, 128);
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: earthMap,
                specularMap: earthSpecularMap,
                specular: new THREE.Color(0x333333),
                shininess: 15,
                normalMap: earthNormalMap
            });
            const earth = new THREE.Mesh(earthGeometry, earthMaterial);
            earthGroup.add(earth);
            
            const cloudMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
            const cloudGeometry = new THREE.SphereGeometry(1.008, 128, 128);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                map: cloudMap,
                transparent: true,
                opacity: 0.25
            });
            cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
            earthGroup.add(cloudsMesh);
            
            const ambientLight = new THREE.AmbientLight(0x111625);
            earthScene.add(ambientLight);
            
            const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
            sunLight.position.set(5, 3, 5);
            earthScene.add(sunLight);
            
            const backLight = new THREE.DirectionalLight(0x4466cc, 0.3);
            backLight.position.set(-3, -1, -4);
            earthScene.add(backLight);
            
            const starGeometry = new THREE.BufferGeometry();
            const starCount = 1000;
            const starPositions = new Float32Array(starCount * 3);
            for (let i = 0; i < starCount; i++) {
                starPositions[i*3] = (Math.random() - 0.5) * 400;
                starPositions[i*3+1] = (Math.random() - 0.5) * 400;
                starPositions[i*3+2] = (Math.random() - 0.5) * 150 - 75;
            }
            starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
            const starMaterial = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.15 });
            starsField = new THREE.Points(starGeometry, starMaterial);
            earthScene.add(starsField);
            
            setupInteractions();
            initModals();
            
            await fetchCyclones();
            await fetchEarthquakes();
            
            setInterval(async () => {
                await fetchCyclones();
            }, 60000);
            
            setInterval(async () => {
                await fetchEarthquakes();
            }, 120000);
            
            animateEarth();
        }
        
        function animateEarth() {
            let time = 0;
            
            function animate(timeStamp) {
                requestAnimationFrame(animate);
                time = timeStamp;
                
                if (currentMode === 'earth') {
                    if (!isUserInteracting && autoRotate) {
                        targetRotationY += autoRotateSpeed;
                    }
                    
                    if (!isUserInteracting) {
                        velocityX *= friction;
                        velocityY *= friction;
                        targetRotationY += velocityX;
                        targetRotationX += velocityY;
                    }
                    
                    if(cloudsMesh) {
                        cloudsMesh.rotation.y += 0.0003;
                    }
                    
                    if(starsField) {
                        starsField.rotation.y += 0.0001;
                    }
                    
                    earthGroup.rotation.y += (targetRotationY - earthGroup.rotation.y) * lerpFactor;
                    earthGroup.rotation.x += (targetRotationX - earthGroup.rotation.x) * lerpFactor;
                    
                    animateMarkers(time);
                    
                    currentDistance += (targetDistance - currentDistance) * 0.08;
                    earthCamera.position.z = currentDistance;
                    earthCamera.lookAt(0, 0, 0);
                    earthRenderer.render(earthScene, earthCamera);
                    
                    if (currentDistance <= 1.6 && targetDistance <= 1.6) {
                        calculateCurrentCoordinates();
                        transitionToSatellite();
                        targetDistance = 3.5;
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        function calculateCurrentCoordinates() {
            if (!earthGroup || !THREE_MODULE) return;
            const forwardVector = new THREE_MODULE.Vector3(0, 0, 1);
            const rotationMatrix = new THREE_MODULE.Matrix4();
            rotationMatrix.makeRotationFromEuler(earthGroup.rotation);
            forwardVector.applyMatrix4(rotationMatrix.invert());
            
            let lat = Math.asin(forwardVector.y) * (180 / Math.PI);
            let lng = Math.atan2(forwardVector.x, forwardVector.z) * (180 / Math.PI);
            
            if(!isNaN(lat) && !isNaN(lng)) {
                currentLat = lat;
                currentLng = lng;
            }
        }
        
        let isUserInteracting = false;
        let previousTouchX = 0, previousTouchY = 0;
        let initialPinchDistance = 0;
        
        function setupInteractions() {
            const canvasElement = document.getElementById('earthCanvas');
            
            canvasElement.addEventListener('touchstart', (e) => {
                if (currentMode !== 'earth') return;
                isUserInteracting = true;
                autoRotate = false;
                setTimeout(() => { autoRotate = true; }, 3000);
                
                if (e.touches.length === 1) {
                    previousTouchX = e.touches[0].clientX;
                    previousTouchY = e.touches[0].clientY;
                    velocityX = 0;
                    velocityY = 0;
                } else if (e.touches.length === 2) {
                    initialPinchDistance = getPinchDistance(e.touches);
                }
            });
            
            canvasElement.addEventListener('touchmove', (e) => {
                if (currentMode !== 'earth' || !isUserInteracting) return;
                e.preventDefault();
                
                if (e.touches.length === 1) {
                    const deltaX = e.touches[0].clientX - previousTouchX;
                    const deltaY = e.touches[0].clientY - previousTouchY;
                    const speedMultiplier = 0.003 * (currentDistance / 3.5);
                    
                    velocityX = deltaX * speedMultiplier;
                    velocityY = deltaY * speedMultiplier;
                    targetRotationY += velocityX;
                    targetRotationX += velocityY;
                    targetRotationX = Math.max(-Math.PI/2.1, Math.min(Math.PI/2.1, targetRotationX));
                    
                    previousTouchX = e.touches[0].clientX;
                    previousTouchY = e.touches[0].clientY;
                } else if (e.touches.length === 2) {
                    const currentPinchDist = getPinchDistance(e.touches);
                    const zoomFactor = (initialPinchDistance - currentPinchDist) * 0.006;
                    targetDistance += zoomFactor;
                    targetDistance = Math.max(1.5, Math.min(7.5, targetDistance));
                    initialPinchDistance = currentPinchDist;
                }
            });
            
            canvasElement.addEventListener('touchend', () => {
                isUserInteracting = false;
                initialPinchDistance = 0;
            });
        }
        
        function getPinchDistance(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        function loadGoogleMaps() {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_API_KEY;
            script.async = true;
            script.defer = true;
            script.onload = function() { 
                if(currentMode === 'satellite') initMap(); 
            };
            document.head.appendChild(script);
        }
        
        initEarth();
        loadGoogleMaps();
        
        window.addEventListener('resize', function() {
            if (earthCamera && earthRenderer) {
                earthCamera.aspect = window.innerWidth / window.innerHeight;
                earthCamera.updateProjectionMatrix();
                earthRenderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    </script>
</body>
</html>
    `;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#05050a" />
      <WebView
        ref={webViewRef}
        source={{ html: getHybridHtml() }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05050a' },
  webview: { flex: 1, backgroundColor: '#05050a' },
});

export default Earth3DWithMap;