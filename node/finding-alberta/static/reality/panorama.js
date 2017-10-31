// Constants and variables
var Cartesian3 = Argon.Cesium.Cartesian3;
var Quaternion = Argon.Cesium.Quaternion;
var CesiumMath = Argon.Cesium.CesiumMath;

var Z_90 = Quaternion.fromAxisAngle(Cartesian3.UNIT_Z, Argon.Cesium.CesiumMath.PI_OVER_TWO);
var NEG_X_90 = Quaternion.fromAxisAngle(Cartesian3.UNIT_X, -Argon.Cesium.CesiumMath.PI_OVER_TWO);
var NEG_Y_90 = Quaternion.fromAxisAngle(Cartesian3.UNIT_Y, Argon.Cesium.CesiumMath.PI_OVER_TWO);

var isDefined = Argon.Cesium.defined;

var paused = true;
var panoramaEntity = null;
var scratchQuaternion = new Quaternion();
var frustum = new Argon.Cesium.PerspectiveFrustum();
var headingPitchRoll = new Argon.Cesium.HeadingPitchRoll(0, -Math.PI / 2, 0);
var aggregator = new Argon.Cesium.CameraEventAggregator(document.documentElement);
var clonedSubviews = [];
var frameStateOptions = { overrideStage: true, overrideUser: false };

// Initialize Argon and the THREE.js objects
var app = Argon.initRealityViewer({ protocols: ['single.panorama@v1'] });
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var stage = new THREE.Object3D();
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true,
    antialias: Argon.suggestedWebGLContextAntialiasAttribute
});

// Initialize our texture loader
var loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
// Add the camera and user location to the scene
scene.add(camera);
scene.add(stage);
// Pixel ratio for our renderer based on the device
renderer.setPixelRatio(window.devicePixelRatio);
// Assign the source layer for rendering
app.view.setLayers([{ source: renderer.domElement }]);
// Since we are using a geolocated panorama, we can disable location updates
app.device.locationUpdatesEnabled = false;

// Track user position/view according to our panorama
function frameStateEventFn(frameState) {
    Argon.SerializedSubviewList.clone(frameState.subviews, clonedSubviews);
    Argon.decomposePerspectiveProjectionMatrix(clonedSubviews[0].projectionMatrix, frustum);

    // frustum.fov = app.view.subviews[0] && app.view.subviews[0].frustum.fov || CesiumMath.PI_OVER_THREE;
    // CUSTOM FOV
    frustum.fov = app.view.subviews[0] && app.view.subviews[0].frustum.fov || 1.55;

    if (!app.device.strict) {
        // Zoom in/out?
        // if (aggregator.isMoving(Argon.Cesium.CameraEventType.WHEEL)) {
        //     var wheelMovement = aggregator.getMovement(Argon.Cesium.CameraEventType.WHEEL);
        //     var diff = wheelMovement.endPosition.y;
        //     frustum.fov = Math.min(Math.max(frustum.fov - diff * 0.02, Math.PI / 8), Math.PI - Math.PI / 8);
        // }

        // // Zoom in/out?
        // if (aggregator.isMoving(Argon.Cesium.CameraEventType.PINCH)) {
        //     var pinchMovement = aggregator.getMovement(Argon.Cesium.CameraEventType.PINCH);
        //     var diff = pinchMovement.distance.endPosition.y - pinchMovement.distance.startPosition.y;
        //     frustum.fov = Math.min(Math.max(frustum.fov - diff * 0.02, Math.PI / 8), Math.PI - Math.PI / 8);
        // }

        clonedSubviews.forEach(function (s) {
            var aspect = s.viewport.width / s.viewport.height;
            frustum.aspectRatio = isFinite(aspect) && aspect !== 0 ? aspect : 1;
            Argon.Cesium.Matrix4.clone(frustum.projectionMatrix, s.projectionMatrix);
        });
    }

    // Sets the stage position and orientation according to our panorama entity?
    if (panoramaEntity !== null) {
        app.context.stage.position.setValue(Cartesian3.ZERO, panoramaEntity);
        app.context.stage.orientation.setValue(Quaternion.IDENTITY);
    }

    // Get the physical device orientation
    var deviceUserOrientation = Argon.getEntityOrientation(
        app.device.user,
        frameState.time,
        app.device.stage,
        scratchQuaternion
    );

    if (!deviceUserOrientation) {
        frameStateOptions.overrideUser = true;

        // Enable left-drag viewing
        if (aggregator.isMoving(Argon.Cesium.CameraEventType.LEFT_DRAG)) {
            var dragMovement = aggregator.getMovement(Argon.Cesium.CameraEventType.LEFT_DRAG);
            headingPitchRoll.heading -= frustum.fov * (dragMovement.endPosition.x - dragMovement.startPosition.x) / app.view.viewport.width;
            headingPitchRoll.pitch -= frustum.fovy * (dragMovement.endPosition.y - dragMovement.startPosition.y) / app.view.viewport.height;
        }

        var currentOrientation = Quaternion.fromHeadingPitchRoll(
            headingPitchRoll,
            scratchQuaternion
        );

        Quaternion.multiply(NEG_X_90, currentOrientation, currentOrientation);
        Quaternion.multiply(currentOrientation, Z_90, currentOrientation);

        app.context.user.position.setValue(Cartesian3.ZERO, app.context.stage);
        app.context.user.orientation.setValue(currentOrientation);
    } else {
        frameStateOptions.overrideUser = false;
    }

    aggregator.reset();

    // By publishing a view state, we are describing where we are in the world,
    // what direction we are looking, and how we are rendering 
    var contextFrameState = app.context.createFrameState(
        frameState.time,
        frameState.viewport,
        clonedSubviews,
        frameStateOptions
    );

    app.context.submitFrameState(contextFrameState);
}

// Updates the position of the current stage
function updateEventFn() {
    var stagePose = app.context.getEntityPose(app.context.stage);

    // Update stage pose when known
    if (stagePose.poseStatus & Argon.PoseStatus.KNOWN) {
        stage.position.copy(stagePose.position);
        stage.quaternion.copy(stagePose.orientation);
    }
}

// Renders the scene + camera
function renderEventFn() {
    renderer.setSize(app.view.renderWidth, app.view.renderHeight, false);
    renderer.setPixelRatio(app.suggestedPixelRatio);

    for (var i = 0, a = app.view.subviews; i < a.length; i++) {
        var subview = a[i];

        // Set the position and orientation of the camera for this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);

        // The underlying system provide a full projection matrix for the camera. 
        camera.projectionMatrix.fromArray(subview.frustum.projectionMatrix);

        var x = subview.viewport.x;
        var y = subview.viewport.y;
        var width = subview.viewport.width;
        var height = subview.viewport.height;

        renderer.setViewport(x, y, width, height);
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
}

// Show a panorama
function showPanorama(p) {
    if (!p.url) {
        throw new Error('Panorama error: a URL is not present.');
    }

    if (!isDefined(p.longitude) || !isDefined(p.latitude)) {
        throw new Error('Panorama error: longitude or latitude not present.');
    }

    // Unpause
    if (paused) {
        pause = false;
        app.device.frameStateEvent.addEventListener(frameStateEventFn);
        app.updateEvent.addEventListener(updateEventFn);
        app.renderEvent.addEventListener(renderEventFn);
    }

    var entity = new Argon.Cesium.Entity;

    var cartographic = Argon.Cesium.Cartographic.fromDegrees(
        p.longitude,
        p.latitude,
        p.height
    );

    if (!isDefined(p.height)) {
        cartographic = Argon.updateHeightFromTerrain(cartographic);
    }

    entity = app.entity.createFixed(cartographic, Argon.eastUpSouthToFixedFrame);

    function createAndAddMesh(texture) {
        texture.minFilter = THREE.LinearFilter;

        // Create a panorama sphere
        var sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
        var meshBasicMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
        var mesh = new THREE.Mesh(sphereGeometry, meshBasicMaterial);

        stage.add(mesh);
        mesh.scale.set(-1, 1, 1);
        panoramaEntity = entity;
    }

    loader.load(p.url, createAndAddMesh);
}

// Pause rendering
function pausePanorama() {
    if (paused) {
        return;
    }

    app.device.frameStateEvent.removeEventListener(frameStateEventFn);
    app.updateEvent.removeEventListener(updateEventFn);
    app.renderEvent.removeEventListener(renderEventFn);

    paused = true;
}

// Add `showPanorama` to the current control session
function connectEventFn(s) {
    s.on['single.panorama.showPanorama'] = showPanorama;
    s.on['single.panorama.pausePanorama'] = pausePanorama;
}

// Event Listeners
// ==============

// Publishes information about our current reality
// app.device.frameStateEvent.addEventListener(frameStateEventFn);
// When a controlling session connects we add the `showPanorama` function
app.reality.connectEvent.addEventListener(connectEventFn);
// updateEvent is called each time the 3D world should be rendered (before renderEvent)
// app.updateEvent.addEventListener(updateEventFn);
// renderEvent is fired whenever argon wants the app to update its display
// app.renderEvent.addEventListener(renderEventFn);
