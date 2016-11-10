// set up Argon
var app = Argon.init();

// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);

// We use the standard WebGLRenderer when we only need WebGL-based content
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});

// account for the pixel density of the device
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);

app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

// add some ambient so things aren't so harshly illuminated
var ambientlight = new THREE.AmbientLight(0x404040); // soft white ambient light 
scene.add(ambientlight);

// set our desired reality 
app.reality.setDesired({
    title: 'My Panorama Tour',
    uri: Argon.resolveURL('resources/custom_reality_views/panorama.html')
});

var panorama = {
    name: 'Georgia Aquarium',
    url: Argon.resolveURL('panoramas/aqui.jpg'),
    longitude: -84.3951,
    latitude: 33.7634,
    height: 206
};

// start listening for connections to a reality
app.reality.connectEvent.addEventListener(function (session) {
    // check if the connected supports our panorama protocol
    console.log("connected");

    if (session.supportsProtocol('single.panorama')) {
        console.log("protocol was supported");

        // load and show the panorama
        session.request('single.panorama.showPanorama', panorama);
    }
});
