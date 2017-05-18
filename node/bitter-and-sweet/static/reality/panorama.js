// Often used variables
var Cartesian3 = Argon.Cesium.Cartesian3;
var Quaternion = Argon.Cesium.Quaternion;
var CesiumMath = Argon.Cesium.CesiumMath;

// Initialize argon, the scene, camera, a 3D object representing
// the user location and the webGL renderer
var app = Argon.initReality({
    configuration: {
        protocols: ['single.panorama@v1']
    }
});
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});

// Initialize our texture loader
var loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

// Add the camera and user location to the scene
scene.add(camera);
scene.add(userLocation);

// Pixel ratio for our renderer based on the device
renderer.setPixelRatio(window.devicePixelRatio);
// Add the renderer to the DOM
app.view.element.appendChild(renderer.domElement);
// Default reference frame
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

// For this example, we want to control the panorama using the device orientation.
// Since we are using a geolocated panorama, we can disable location updates
app.device.locationUpdatesEnabled = false;

// Create an entity to represent the eye for our custom reality
var eyeEntity = new Argon.Cesium.Entity({
    orientation: new Argon.Cesium.ConstantProperty(Quaternion.IDENTITY)
});

// Recyclable object
var scratchQuaternion = new Quaternion;

// Our custom reality view must raise frame evetns at regular intervals
function onFrame(time, index) {
    // Get the current display-aligned device orientation relative to the device geolocation
    app.device.update();
    var deviceOrientation = Argon.getEntityOrientation(app.device.displayEntity, time, app.device.geolocationEntity, scratchQuaternion);

    // Rotate the eye according to the device orientation
    eyeEntity.orientation.setValue(deviceOrientation);

    // By raising a frame state event, we are describing to the  manager when and where we
    // are in the world, what direction we are looking, and how we are able to render. 
    app.reality.publishFrame({
        time: time,
        index: index,
        // Configuration for our custom reality "Eye"
        eye: {
            // Pose for the eye
            pose: Argon.getSerializedEntityPose(eyeEntity, time),
            // We will use mono-mode 
            stereoMultiplier: 0
        }
    });
    app.timer.requestFrame(onFrame);
}

// Pass our frame-event-handler
app.timer.requestFrame(onFrame);

// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent. 
app.updateEvent.addEventListener(function () {
    // User pose (location)
    var userPose = app.context.getEntityPose(app.context.user);

    // If the user pose is known
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }

    // TWEEN.update();
});

// RenderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);
    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (var i = 0, a = app.view.getSubviews(); i < a.length; i++) {
        var subview = a[i];

        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);

        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        // set the viewport for this view
        var vp = subview.viewport,
            x = vp.x,
            y = vp.y,
            width = vp.width,
            height = vp.height;

        renderer.setViewport(x, y, width, height);

        // set the webGL rendering parameters and render this view
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
});

// when the a controlling session connects, we can communite with it to
// receive commands (or even send information back, if appropriate)
app.reality.connectEvent.addEventListener(function (controlSession) {
    controlSession.on['single.panorama.showPanorama'] = showPanorama;
});

function showPanorama(pano) {
    // if you throw an error in a message handler, the remote session will see the error!
    if (!pano.url) {
        throw new Error('A panorama source URL has to be defined!');
    }

    // var offsetRadians = (pano.offsetDegrees || 0) * CesiumMath.DEGREES_PER_RADIAN;
    var entity = new Argon.Cesium.Entity;

    if (Argon.Cesium.defined(pano.longitude) && Argon.Cesium.defined(pano.latitude)) {
        var positionProperty = new Argon.Cesium.ConstantPositionProperty(undefined);
        var positionValue = Cartesian3.fromDegrees(pano.longitude, pano.latitude, pano.height || 0);
        positionProperty.setValue(positionValue, Argon.Cesium.ReferenceFrame.FIXED);

        // calculate the orientation for the ENU coodrinate system at the given position
        // NOTE: apply offsetDegrees to orientation
        var orientationProperty = new Argon.Cesium.ConstantProperty();
        var orientationValue = Argon.Cesium.Transforms.headingPitchRollQuaternion(positionValue, 0, 0, 0);
        orientationProperty.setValue(orientationValue);

        entity.orientation = orientationProperty;
        entity.position = positionProperty;
    }

    loader.load(pano.url, function(texture) {
        texture.minFilter = THREE.LinearFilter;

        // Create a panorama sphere
        var sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
        var meshBasicMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
        var mesh = new THREE.Mesh(sphereGeometry, meshBasicMaterial);

        userLocation.add(mesh);
        // meshBasicMaterial.transparent = true;

        eyeEntity.position = new Argon.Cesium.ConstantPositionProperty(Cartesian3.ZERO, entity);

        mesh.scale.set(-1, 1, 1);
        // mesh.material.opacity = 0;

        // Fade in
        // var t = new TWEEN.Tween(mesh.material).to({ opacity: 1 }, 2000).start();
    });
}
