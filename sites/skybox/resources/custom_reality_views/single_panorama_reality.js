var Cartesian3 = Argon.Cesium.Cartesian3;
var Quaternion = Argon.Cesium.Quaternion;
var CesiumMath = Argon.Cesium.CesiumMath;

// set up Argon (unlike regular apps, we call initReality instead of init)
// Defining a protocol allows apps to communicate with the reality in a 
// reliable way. 
var app = Argon.initReality({
    configuration: {
        protocols: ['single.panorama@v1']
    }
});

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

// We need to define a projection matrix for our reality view
var perspectiveProjection = new Argon.Cesium.PerspectiveFrustum();
perspectiveProjection.fov = Math.PI / 2;

// For this example, we want to control the panorama using the device orientation.
// Since we are using geolocated panoramas, we can disable location updates
app.device.locationUpdatesEnabled = false;

// Create an entity to represent the eye
var eyeEntity = new Argon.Cesium.Entity({
    orientation: new Argon.Cesium.ConstantProperty(Quaternion.IDENTITY)
});

// Creating a lot of garbage slows everything down. Not fun.
// Let's create some recyclable objects that we can use later.
var scratchCartesian = new Cartesian3;
var scratchQuaternion = new Quaternion;
var scratchArray = [];

// Reality views must raise frame events at regular intervals in order to 
// drive updates for the entire system. 
function onFrame(time, index) {

    // Get the current display-aligned device orientation relative to the device geolocation
    app.device.update();
    var deviceOrientation = Argon.getEntityOrientation(app.device.displayEntity, time, app.device.geolocationEntity, scratchQuaternion);

    // Rotate the eye according to the device orientation
    // (the eye should be positioned at the current panorama)
    eyeEntity.orientation.setValue(deviceOrientation);

    // By raising a frame state event, we are describing to the  manager when and where we
    // are in the world, what direction we are looking, and how we are able to render. 
    app.reality.publishFrame({
        time: time,
        index: index,

        // A reality should pass an "eye" configuration to the manager. The manager will 
        // then construct an appropriate "view" configuration using the eye properties we 
        // send it and other factors unknown to the reality. 
        eye: {
            // We must provide a pose representing where we are in world, 
            // and what we are looking at. The viewing direction is always the
            // -Z axis, assuming a right-handed cordinate system with Y pointing up
            // in the camera's local coordinate system. 
            pose: Argon.getSerializedEntityPose(eyeEntity, time),
            
            // The stereo multiplier tells the manager how we wish to render stereo
            // in relation to the user's interpupillary distance (typically around 0.063m).
            // In this case, since we are using a single panoramic image,
            stereoMultiplier: 0
        }
    });
    app.timer.requestFrame(onFrame);
}

// We can use requestAnimationFrame, or the builtin Argon.TimerService (app.timer),
// The TimerService is more convenient as it will provide the current time 
// as a Cesium.JulianDate object which can be used directly when raising a frame event. 
app.timer.requestFrame(onFrame);

// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent. 
app.updateEvent.addEventListener(function () {

    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    var userPose = app.context.getEntityPose(app.context.user);

    // assuming we know the user's pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }

    TWEEN.update();
});

// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {

    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);
    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (var _i = 0, _a = app.view.getSubviews(); _i < _a.length; _i++) {
        var subview = _a[_i];

        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);

        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        // set the viewport for this view
        var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
        renderer.setViewport(x, y, width, height);

        // set the webGL rendering parameters and render this view
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
});

// create a texture loader
var loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

// when the a controlling session connects, we can communite with it to
// receive commands (or even send information back, if appropriate)
app.reality.connectEvent.addEventListener(function (controlSession) {
    controlSession.on['single.panorama.showPanorama'] = showPanorama;
});

function showPanorama(pano) {
    // if you throw an error in a message handler, the remote session will see the error!
    if (!pano.url) {
        throw new Error('Expected an equirectangular image url!');
    }

    var offsetRadians = (pano.offsetDegrees || 0) * CesiumMath.DEGREES_PER_RADIAN;
    var entity = new Argon.Cesium.Entity;

    if (Argon.Cesium.defined(pano.longitude) && Argon.Cesium.defined(pano.longitude)) {
        var positionProperty = new Argon.Cesium.ConstantPositionProperty(undefined);
        var positionValue = Cartesian3.fromDegrees(pano.longitude, pano.latitude, pano.height || 0);
        positionProperty.setValue(positionValue, Argon.Cesium.ReferenceFrame.FIXED);
        entity.position = positionProperty;
        var orientationProperty = new Argon.Cesium.ConstantProperty();

        // calculate the orientation for the ENU coodrinate system at the given position
        var orientationValue = Argon.Cesium.Transforms.headingPitchRollQuaternion(positionValue, 0, 0, 0);

        // TODO: apply offsetDegrees to orientation
        orientationProperty.setValue(orientationValue);
        entity.orientation = orientationProperty;
    }

    loader.load(pano.url, function(texture) {
        texture.minFilter = THREE.LinearFilter;

        // Create a panorama sphere
        var sphereGeometry = new THREE.SphereGeometry( 100, 32, 32 );
        var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
        material.transparent = true;
        var panoSphere = new THREE.Mesh( sphereGeometry, material );
        userLocation.add( panoSphere );

        eyeEntity.position = new Argon.Cesium.ConstantPositionProperty(Cartesian3.ZERO, entity);

        panoSphere.scale.set(-1, 1, 1);

        panoSphere.material.opacity = 0;
        var tween = new TWEEN.Tween(panoSphere.material)
            .to({ opacity: 1 }, 2000)
            .start();
    });
}
