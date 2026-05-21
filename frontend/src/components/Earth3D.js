import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const Earth3D = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cinematic fade-in sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.2, 0.9, 0.4, 1.0),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.6,
        duration: 2000,
        delay: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Three.js for pure Earth visualization - No rings, no lines, no dots
  const earthHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
            body { margin: 0; overflow: hidden; background-color: #000000; touch-action: none; }
        </style>
    </head>
    <body>
        <script type="importmap">
            {
                "imports": {
                    "three": "https://unpkg.com/three@0.128.0/build/three.module.js"
                }
            }
        </script>

        <script type="module">
            import * as THREE from 'three';

            // --- Setup Scene ---
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);
            scene.fog = new THREE.FogExp2(0x000000, 0.0008);

            // --- Camera with zoom capabilities ---
            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 3.5);
            
            // --- Renderer with high quality ---
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            document.body.appendChild(renderer.domElement);

            // --- Touch interaction variables for zoom and rotation ---
            let targetDistance = 3.5;
            let currentDistance = 3.5;
            let targetRotationX = 0;
            let targetRotationY = 0;
            let currentRotationX = 0;
            let currentRotationY = 0;
            let isDragging = false;
            let lastTouchX = 0;
            let lastTouchY = 0;
            let initialPinchDistance = 0;
            
            // --- Earth group for rotation control ---
            const earthGroup = new THREE.Group();
            scene.add(earthGroup);
            
            // --- Starfield Background ---
            const starGeometry = new THREE.BufferGeometry();
            const starCount = 2500;
            const starPositions = new Float32Array(starCount * 3);
            for (let i = 0; i < starCount; i++) {
                starPositions[i*3] = (Math.random() - 0.5) * 2000;
                starPositions[i*3+1] = (Math.random() - 0.5) * 2000;
                starPositions[i*3+2] = (Math.random() - 0.5) * 100 - 50;
            }
            starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
            const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.7 });
            const stars = new THREE.Points(starGeometry, starMaterial);
            scene.add(stars);
            
            // Secondary starfield
            const starGeometry2 = new THREE.BufferGeometry();
            const starCount2 = 1200;
            const starPositions2 = new Float32Array(starCount2 * 3);
            for (let i = 0; i < starCount2; i++) {
                starPositions2[i*3] = (Math.random() - 0.5) * 800;
                starPositions2[i*3+1] = (Math.random() - 0.5) * 800;
                starPositions2[i*3+2] = (Math.random() - 0.5) * 150 - 80;
            }
            starGeometry2.setAttribute('position', new THREE.BufferAttribute(starPositions2, 3));
            const starMaterial2 = new THREE.PointsMaterial({ color: 0xaaffff, size: 0.2, transparent: true, opacity: 0.5 });
            const stars2 = new THREE.Points(starGeometry2, starMaterial2);
            scene.add(stars2);

            // ALL RINGS REMOVED - No orbital rings, no pulse rings

            // --- Earth Textures ---
            const textureLoader = new THREE.TextureLoader();
            const earthMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
            const earthSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
            const earthNormalMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
            const cloudMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
            
            // Earth Mesh (pure Earth)
            const earthGeometry = new THREE.SphereGeometry(1.0, 128, 128);
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: earthMap,
                specularMap: earthSpecularMap,
                specular: new THREE.Color('grey'),
                shininess: 8,
                normalMap: earthNormalMap,
                normalScale: new THREE.Vector2(0.8, 0.8)
            });
            const earth = new THREE.Mesh(earthGeometry, earthMaterial);
            earthGroup.add(earth);
            
            // Cloud Layer (translucent clouds)
            const cloudGeometry = new THREE.SphereGeometry(1.008, 128, 128);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                map: cloudMap,
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
            earthGroup.add(clouds);
            
            // --- Lighting ---
            const ambientLight = new THREE.AmbientLight(0x111122);
            scene.add(ambientLight);
            const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
            sunLight.position.set(5, 5, 7);
            scene.add(sunLight);
            const fillLight = new THREE.PointLight(0x2266ff, 0.5);
            fillLight.position.set(0, -2, 0);
            scene.add(fillLight);
            const rimLight = new THREE.PointLight(0x44aaff, 0.7);
            rimLight.position.set(-2, 1, -3);
            scene.add(rimLight);
            const colorLight = new THREE.PointLight(0xff44aa, 0.4);
            colorLight.position.set(2, 1, 2);
            scene.add(colorLight);
            
            // Floating particles (ambient space dust) - very subtle
            const dustGeo = new THREE.BufferGeometry();
            const dustCount = 1000;
            const dustPositions = new Float32Array(dustCount * 3);
            for (let i = 0; i < dustCount; i++) {
                dustPositions[i*3] = (Math.random() - 0.5) * 15;
                dustPositions[i*3+1] = (Math.random() - 0.5) * 10;
                dustPositions[i*3+2] = (Math.random() - 0.5) * 12 - 5;
            }
            dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
            const dustMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.008, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
            const dustParticles = new THREE.Points(dustGeo, dustMat);
            scene.add(dustParticles);
            
            // --- Touch Event Handlers for Zoom and Rotate ---
            function getPinchDistance(touches) {
                if (touches.length < 2) return 0;
                const dx = touches[0].clientX - touches[1].clientX;
                const dy = touches[0].clientY - touches[1].clientY;
                return Math.sqrt(dx * dx + dy * dy);
            }
            
            function handleTouchStart(e) {
                e.preventDefault();
                const touches = e.touches;
                
                if (touches.length === 1) {
                    isDragging = true;
                    lastTouchX = touches[0].clientX;
                    lastTouchY = touches[0].clientY;
                } else if (touches.length === 2) {
                    isDragging = false;
                    initialPinchDistance = getPinchDistance(touches);
                }
            }
            
            function handleTouchMove(e) {
                e.preventDefault();
                const touches = e.touches;
                
                if (touches.length === 1 && isDragging) {
                    const deltaX = touches[0].clientX - lastTouchX;
                    const deltaY = touches[0].clientY - lastTouchY;
                    
                    targetRotationY += deltaX * 0.005;
                    targetRotationX += deltaY * 0.005;
                    
                    targetRotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationX));
                    
                    lastTouchX = touches[0].clientX;
                    lastTouchY = touches[0].clientY;
                } 
                else if (touches.length === 2) {
                    const newDistance = getPinchDistance(touches);
                    if (initialPinchDistance > 0) {
                        const zoomDelta = (initialPinchDistance - newDistance) * 0.008;
                        targetDistance += zoomDelta;
                        targetDistance = Math.max(1.5, Math.min(8, targetDistance));
                        initialPinchDistance = newDistance;
                    }
                }
            }
            
            function handleTouchEnd(e) {
                isDragging = false;
                initialPinchDistance = 0;
            }
            
            document.addEventListener('touchstart', handleTouchStart, false);
            document.addEventListener('touchmove', handleTouchMove, false);
            document.addEventListener('touchend', handleTouchEnd, false);
            
            // --- Animation variables ---
            let time = 0;
            let autoRotateAngle = 0;
            let autoRotateEnabled = true;
            let lastInteractionTime = Date.now();
            
            // Reset auto-rotate after 3 seconds of no interaction
            function resetAutoRotateTimer() {
                autoRotateEnabled = false;
                lastInteractionTime = Date.now();
                setTimeout(() => {
                    if (Date.now() - lastInteractionTime > 3000) {
                        autoRotateEnabled = true;
                    }
                }, 3000);
            }
            
            // Override touch handlers to reset auto-rotate
            const originalTouchStart = handleTouchStart;
            const originalTouchMove = handleTouchMove;
            window.handleTouchStart = function(e) {
                resetAutoRotateTimer();
                originalTouchStart(e);
            };
            window.handleTouchMove = function(e) {
                resetAutoRotateTimer();
                originalTouchMove(e);
            };
            
            // --- Main Render Loop ---
            function animate() {
                requestAnimationFrame(animate);
                time += 0.008;
                
                // Smooth zoom interpolation
                currentDistance += (targetDistance - currentDistance) * 0.1;
                camera.position.z = currentDistance;
                
                // Smooth rotation interpolation
                currentRotationX += (targetRotationX - currentRotationX) * 0.1;
                currentRotationY += (targetRotationY - currentRotationY) * 0.1;
                
                // Apply rotation to earth group
                earthGroup.rotation.x = currentRotationX;
                earthGroup.rotation.y = currentRotationY;
                
                // Auto-rotate when no interaction
                if (autoRotateEnabled) {
                    autoRotateAngle += 0.002;
                    earthGroup.rotation.y = currentRotationY + autoRotateAngle * 0.5;
                }
                
                // Update camera lookAt
                camera.lookAt(0, 0, 0);
                
                // Individual earth body rotation for natural look
                earth.rotation.y += 0.0025;
                clouds.rotation.y += 0.0029;
                
                // Stars subtle rotation
                stars.rotation.y += 0.0002;
                stars2.rotation.x += 0.0001;
                
                // Dynamic light movement
                colorLight.intensity = 0.3 + Math.sin(time * 1.2) * 0.2;
                colorLight.position.x = 2 + Math.sin(time) * 1;
                colorLight.position.z = 2 + Math.cos(time * 0.9) * 1;
                
                // Dust particles drift
                dustParticles.rotation.y += 0.0003;
                dustParticles.rotation.x += 0.0002;
                
                renderer.render(scene, camera);
            }
            
            animate();
            
            // Handle resize
            window.addEventListener('resize', onWindowResize, false);
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
            
            console.log('Pure Earth Active - No rings, no lines, no dots');
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Main 3D WebView - Pure Earth */}
      <WebView
        source={{ html: earthHtml }}
        style={styles.webview}
        allowsFullscreenVideo={false}
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>LOADING EARTH...</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Earth3D;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ffff',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'monospace',
    textShadowColor: '#00ffff80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});