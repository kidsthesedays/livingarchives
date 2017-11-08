"use strict";

var DATASET_URL = '/dataset/Affexity.xml';

// Control variables
var animationPending = false;

// Initialize Argon, the scene and the camera (THREE.js)
var app = Argon.init();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D();
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true,
    antialias: Argon.suggestedWebGLContextAntialiasAttribute
});

// Add the camera and user to the scene
scene.add(camera);
scene.add(userLocation);

renderer.setPixelRatio(window.devicePixelRatio);

app.view.setLayers([{ source: renderer.domElement }]);

// Object that will contain our video in 3d-space
var argonVideoObject = new THREE.Object3D();
// Hide it by default
argonVideoObject.position.z = -0.5;
argonVideoObject.scale.set(0.001, 0.001, 0.001);
// Add it to the user so we can render it infront of the user
userLocation.add(argonVideoObject);

// <video> element used to play videos
var videoElement = document.createElement('video');
// Disable fullscreen videos
enableInlineVideo(videoElement);

// The canvas in which we render the video
var videoCanvas = document.createElement('canvas');
// videoCanvas.width = 640;
// videoCanvas.height = 360;

var videoCanvasContext = videoCanvas.getContext('2d');
videoCanvasContext.fillStyle = '#000000';
videoCanvasContext.fillRect(0, 0, videoCanvas.width, videoCanvas.height);

var videoTexture = new THREE.Texture(videoCanvas);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

var videoGeometry = new THREE.PlaneGeometry(500, 500);
var videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    overdraw: true,
    transparent: true,
    opacity: 0.5
});

var videoScreen = new THREE.Mesh(videoGeometry, videoMaterial);
argonVideoObject.add(videoScreen);

function handleTouchStart(e) {
    if (e.touches.length !== 1) {
        return
    }

    e.preventDefault();

    if (videoElement.paused) {
        videoElement.play();
    } else {
        videoElement.pause();
    }
}

var x = false;

function imageTrackingFn(v) {
    return function() {

        if (x) { return false; }

        x = true;

        var videoPose = app.context.getEntityPose(v.entity, 'ar.origin');


        // KNOWN
        if (videoPose.poseStatus & Argon.PoseStatus.KNOWN) {
            v.object.position.copy(videoPose.position);
            v.object.quaternion.copy(videoPose.orientation);
        }

        // FOUND
        if (videoPose.poseStatus & Argon.PoseStatus.FOUND) {
            v.object.add(argonVideoObject);
            argonVideoObject.position.z = 0;
            videoElement.src = '/videos/' + v.src;
            videoElement.load();

            // TODO might have to fix 'touchstart' within the Argon source?
            document.addEventListener('touchstart', handleTouchStart, false);
        // LOST
        } else if (videoPose.poseStatus & Argon.PoseStatus.LOST) {
            argonVideoObject.position.z = -0.5;
            userLocation.add(argonVideoObject);
            videoElement.pause();

            // TODO might have to fix 'touchstart' within the Argon source?
            document.removeEventListener('touchstart', handleTouchStart, false);
        }
    }
}

function setupTrackables(trackables) {
    console.log('WILL SETUP TRACKABLES: ', VIDEOS.length);

    // Videos from the global scope
    VIDEOS.map(function(v) {
        app.context
            .subscribe(trackables[v.key].id)
            .then(function(entity) {

                console.log('????', trackables[v.key].id, entity);

                var e = Object.assign({}, v, {
                    entity: entity,
                    object: new THREE.Object3D()
                });

                scene.add(e.object);

                var trackingFn = imageTrackingFn(v);

                app.context.updateEvent.addEventListener(trackingFn);
            });
    });
}

// Initialize and setup vuforia
function setupVuforia(available) {
    if (!available) {
        console.log('Vuforia is not available on this platform');
        return;
    }

    app.vuforia
        .init({ encryptedLicenseData: LICENSE }) // License from the global scope
        .then(function(api) {

            console.log('LICENSE VALID!')

            // Create the dataset from our URL
            api.objectTracker
                .createDataSetFromURL(DATASET_URL)
                .then(function(dataset) {
                    // Load the dataset
                    api.objectTracker
                        .loadDataSet(dataset)
                        .then(setupTrackables);

                    // Activate our dataset
                    api.objectTracker
                        .activateDataSet(dataset);
                });
        })
        .catch(function(e) { console.log('Vuforia was unable to initialize') });
}

function updateEventFn() {
    var userPose = app.context.getEntityPose(app.context.user);

    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
}

function renderFunc() {
    animationPending = false;

    renderer.setSize(app.view.renderWidth, app.view.renderHeight, false);
    renderer.setPixelRatio(app.suggestedPixelRatio);

    for (var i = 0, sv = app.view.subviews; i < sv.length; i++) {
        var subview = sv[i];

        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        var x = subview.viewport.x;
        var y = subview.viewport.y;
        var width = subview.viewport.width;
        var height = subview.viewport.height;

        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            videoCanvasContext.drawImage(
                videoElement,
                0,
                0,
                videoCanvas.width,
                videoCanvas.height
            );

            if (videoTexture) {
                videoTexture.needsUpdate = true;
            }
        }

        renderer.setViewport(x, y, width, height);
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera, subview.index);
    }
}

function renderEventFn() {
    if (!animationPending) {
        animationPending = true;
        window.requestAnimationFrame(renderFunc);
    }
}

// Lets go!
app.vuforia.isAvailable().then(setupVuforia);
app.context.updateEvent.addEventListener(updateEventFn);
app.context.renderEvent.addEventListener(renderEventFn);
