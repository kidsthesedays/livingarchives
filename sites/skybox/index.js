// Initialize argon, the scene, camera, a 3D object representing
// the user location and the webGL renderer
var app = Argon.init();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});

// Add the camera and user location to the scene
scene.add(camera);
scene.add(userLocation);

// Pixel ratio for our renderer based on the device
renderer.setPixelRatio(window.devicePixelRatio);
// Add the renderer to the DOM
app.view.element.appendChild(renderer.domElement);
// Default reference frame
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

// add some ambient so things aren't so harshly illuminated
// var ambientlight = new THREE.AmbientLight(0x404040); // soft white ambient light 
// scene.add(ambientlight);

// Set our desired reality to the panorama (skybox)
app.reality.setDesired({
    title: 'Skybox Panorama',
    uri: Argon.resolveURL('panorama.html')
});

// The panorama
var panorama = {
    name: 'Georgia Aquarium',
    url: Argon.resolveURL('images/aqui.jpg'),
    longitude: -84.3951,
    latitude: 33.7634,
    height: 206
};

// Start listening for connections to a reality
app.reality.connectEvent.addEventListener(function (session) {
    // If the protocol is supported invoke the showPanorama method and pass it our panorama
    if (session.supportsProtocol('single.panorama')) {
        session.request('single.panorama.showPanorama', panorama);
    }
});
