"use strict";

var DATASET = '/dataset/Affexity.xml';

// Array of all entities used
var videoEntities = [
    { key: 'delicatepassage2', src: 'del-pass-red-wall-no-music.3gp', entity: null, object: null },
    { key: 'Corpus2', src: 'corpus-riverbed.3gp', entity: null, object: null }
];

// Initialize Argon, the scene and the camera (THREE.js)
var app = Argon.init();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();

// Represents the user in 3d-space
var userLocation = new THREE.Object3D();

// Add the camera and user to the scene
scene.add(camera);
scene.add(userLocation);

// Use WebGL for rendering
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});

renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);

// 'deprecated'
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

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

var videoGeometry = new THREE.PlaneGeometry(400, 400);
var videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    overdraw: true,
    transparent: true,
    opacity: 0.4
});


var videoScreen = new THREE.Mesh(videoGeometry, videoMaterial);

// Add our video canvas to the argon video object
argonVideoObject.add(videoScreen);

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        e.preventDefault();

        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }
}

// func unableToLoadDataset
// func unableToInitialize
// func setupDataset

app.vuforia.isAvailable().then(function(available) {
    if (!available) {
        console.log('Vuforia is not available on this platform');
        return;
    }

    app.vuforia
        .init({ encryptedLicenseData: license })
        .then(function(api) {

            api.objectTracker
                .createDataSet(DATASET)
                .then(function(dataset) {
                    dataset.load().then(function() {
                        var trackables = dataset.getTrackables();

                        // DEBUG
                        console.log('Vuforia dataset successfully loaded');

                        videoEntities = videoEntities.map(function(t) {
                            var entity = app.context.subscribeToEntityById(trackables[t.key].id);
                            var object = new THREE.Object3D();
                            scene.add(object);

                            return {
                                key: t.key,
                                src: t.src,
                                entity: entity,
                                object: object
                            };
                        });

                        app.context.updateEvent.addEventListener(function() {
                            videoEntities.forEach(function(v) {
                                var videoPose = app.context.getEntityPose(v.entity);

                                if (videoPose.poseStatus & Argon.PoseStatus.KNOWN) {
                                    v.object.position.copy(videoPose.position);
                                    v.object.quaternion.copy(videoPose.orientation);
                                }

                                if (videoPose.poseStatus & Argon.PoseStatus.FOUND) {
                                    v.object.add(argonVideoObject);
                                    argonVideoObject.position.z = 0;

                                    videoElement.src = '/videos/' + v.src;
                                    videoElement.load();

                                    document.addEventListener('touchstart', handleTouchStart, false);
                                } else if (videoPose.poseStatus & Argon.PoseStatus.LOST) {
                                    argonVideoObject.position.z = -0.5;
                                    userLocation.add(argonVideoObject);

                                    videoElement.pause();

                                    document.removeEventListener('touchstart', handleTouchStart, false);
                                }
                            }); // .forEach

                        }); // updateEvent.addEventListener

                    })
                    .catch(function(e) {
                        console.log('Vuforia is unable to load the dataset:', e.message);
                    }); // .dataset.load

                    api.objectTracker.activateDataSet(dataset);

                }); // .createDataSet
        })
        .catch(function(e) {
            console.log('Vuforia failed to initialize:', e.message);
        }); // vuforia.init.
});

app.context.updateEvent.addEventListener(function() {
    var userPose = app.context.getEntityPose(app.context.user);

    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
});

// Control variables
var viewport = null;
var subviews = null;
var animationPending = false;

// Manage display updates for the application
app.renderEvent.addEventListener(function() {
    if (!animationPending) {
        animationPending = true;
        // 'deprecated'
        viewport = app.view.getViewport();
        // viewport = app.viewport.current;
        subviews = app.view.getSubviews();
        window.requestAnimationFrame(renderFunc);
    }
});

// Render updates
function renderFunc() {
    animationPending = false;

    renderer.setSize(viewport.width, viewport.height);

    for (var i = 0; i < subviews.length; i++) {
        var subview = subviews[i];

        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);

        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        var x = subview.viewport.x,
            y = subview.viewport.y,
            width = subview.viewport.width,
            height = subview.viewport.height;

        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            videoCanvasContext.drawImage(
                videoElement, 0, 0, videoCanvas.width, videoCanvas.height
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
