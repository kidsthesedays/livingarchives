"use strict";

const DEBUG = true;

var VIDEOS = [
    {
        key: 'delicatepassage2',
        src: 'del-pass-red-wall-no-music.3gp',
        object: null,
        entity: null
    },
    {
        key: 'Corpus2',
        src: 'gangnam.mp4',
        object: null,
        entity: null
    }
];

const DATASET_URL = '/dataset/Affexity.xml';

let animationIsPending = false;

let Video = {
    src: '', 
    elem: document.createElement('video')
};

Video.elem.setAttribute('playsinline', '');
enableInlineVideo(Video.elem);

// Initialize Argon, the Scene, the Camera and the WebGL Renderer
const App = Argon.init();
const Scene = new THREE.Scene();
const Camera = new THREE.PerspectiveCamera();
const Renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true,
    antialias: Argon.suggestedWebGLContextAntialiasAttribute
});

// Tracks the user location in 3D space
const userLoc = new THREE.Object3D();
// Wrapper object for our video
const videoObject = new THREE.Object3D();

Scene.add(Camera);
Scene.add(userLoc);
Renderer.setPixelRatio(window.devicePixelRatio);

App.view.setLayers([{ source: Renderer.domElement }]);

videoObject.position.z = -0.5;
videoObject.scale.set(0.001, 0.001, 0.001);

userLoc.add(videoObject);

const videoTexture = new THREE.VideoTexture(Video.elem);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        texture: {
            type: 't',
            value: videoTexture
        }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform sampler2D texture;
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
            vec2 texcoord = vec2(0.49, 0.0);
            vec2 halfTex = vec2(0.5, 1.0);
            vec3 tColor = texture2D( texture, ( vUv * halfTex ) ).rgb;
            vec3 aColor = texture2D( texture, ( (vUv * halfTex ) + texcoord ) ).rgb;
            float a = aColor.g;
            gl_FragColor = vec4(tColor, a);
        }
    `
});

const videoGeometry = new THREE.PlaneGeometry(500, 500);
const videoMesh = new THREE.Mesh(videoGeometry, shaderMaterial);

videoObject.add(videoMesh);

// FUNCTIONS
// =========

const loadVideo = (v, src) => {
    if (v.src === '' || v.src !== src) {
        if (DEBUG) console.log('Loading src:', src);
        
        v.src = src;
        v.elem.src = `/videos/${src}`;
        v.elem.loop = true;
        v.elem.load();
        // Autoplay
        window.setTimeout(() => v.elem.play(), 300);
    } else if (v.src === src) {
        // If its the same video, continue playing
        v.elem.play();
    }
};

// Click/touch event handler
const handleTouchStart = e => {
    e.preventDefault();

    if (e.touches !== undefined || e.touches.length === 1) {
        if (Video.elem.paused) {
            Video.elem.play();
        } else {
            Video.elem.pause();
        }
    }
};

// Handles the image tracking
const setupImageTracking = v => () => {
    // Video Pose (vp) of a Video (v)
    const vp = App.context.getEntityPose(v.entity);

    // KNOWN
    if (vp.poseStatus & Argon.PoseStatus.KNOWN) {
        v.object.position.copy(vp.position);
        v.object.quaternion.copy(vp.orientation);
    }

    // FOUND
    if (vp.poseStatus & Argon.PoseStatus.FOUND) {
        if (DEBUG) console.log('FOUND video', v.src);

        loadVideo(Video, v.src)
        v.object.add(videoObject);

        if (Video.src !== '' && Video.src !== v.src) {
            window.setTimeout(() => videoObject.position.z = 0, 300);
        } else {
            videoObject.position.z = 0;
        }

        document.addEventListener('touchstart', handleTouchStart, false);
        // document.addEventListener('click', handleTouchStart, false);
    // LOST
    } else if (vp.poseStatus & Argon.PoseStatus.LOST) {
        videoObject.position.z = -0.5;
        userLoc.add(videoObject);
        Video.elem.pause();

        document.removeEventListener('touchstart', handleTouchStart, false);
        // document.removeEventListener('click', handleTouchStart, false);
    }
};

// Makes all of our videos trackable by id
const setupTrackables = trackables => {
    if (DEBUG) console.log('Setting up trackables');

    VIDEOS.map(v => {
        App.context.subscribe(trackables[v.key].id).then(entity => {
            // Immutable copy of our video object
            const e = Object.assign({}, v, {
                entity: entity,
                object: new THREE.Object3D()
            });
            // Add our object to the Scene
            Scene.add(e.object);
            // Start image tracking
            App.context.updateEvent.addEventListener(setupImageTracking(e));
        })
    })
};

// Initialize vuforia and then load and activate the dataset
const setupVuforia = available => {
    if (!available) {
        console.log('Vuforia is not available on this platform');
        return;
    }

    // The license comes from the global namespace (another file imports it)
    App.vuforia.init({ encryptedLicenseData: LICENSE }).then(api => {
        if (DEBUG) console.log('LICENSE is valid');
        // Create the dataset from our URL
        api.objectTracker.createDataSetFromURL(DATASET_URL).then(ds => {
            if (DEBUG) console.log('Dataset created from URL');
            // Load and activate our dataset
            api.objectTracker.loadDataSet(ds).then(setupTrackables);
            api.objectTracker.activateDataSet(ds);
        });
    }).catch(function(e) { console.log('Vuforia was unable to initialize') });
};

// Updates the user position
const updateEventFn = () => {
    const p = App.context.getEntityPose(App.context.user);

    if (p.poseStatus & Argon.PoseStatus.KNOWN) {
        userLoc.position.copy(p.position)
    }
};

// Renders the 3D space
const renderFn = () => {
    animationIsPending = false;

    Renderer.setSize(App.view.renderWidth, App.view.renderHeight, false);
    Renderer.setPixelRatio(App.suggestedPixelRatio);

    for (let subview of App.view.subviews) {
        Camera.position.copy(subview.pose.position);
        Camera.quaternion.copy(subview.pose.orientation);
        Camera.projectionMatrix.fromArray(subview.projectionMatrix);

        const x = subview.viewport.x;
        const y = subview.viewport.y;
        const width = subview.viewport.width;
        const height = subview.viewport.height;

        if (Video.elem.readyState === Video.elem.HAVE_ENOUGH_DATA) {
            if (videoTexture) {
                videoTexture.needsUpdate = true;
            }
        }

        Renderer.setViewport(x, y, width, height);
        Renderer.setScissor(x, y, width, height);
        Renderer.setScissorTest(true);
        Renderer.render(Scene, Camera, subview.index);
    }
};

// Wrapper for using requestAnimationFrame
const renderEventFn = () => {
    if (!animationIsPending) {
        animationIsPending = true;
        window.requestAnimationFrame(renderFn);
    }
};

// Starts vuforia and then adds the render and update listeners 
App.vuforia.isAvailable().then(setupVuforia);
App.context.updateEvent.addEventListener(updateEventFn);
App.context.renderEvent.addEventListener(renderEventFn);

// TODO: add id-tracking of which video is playing so we can switch when a new one comes along
// TODO: rewrite to es6
// TODO: check which event handler is needed: click or touch
// TODO: add all videos to this file
// TODO: add DEBUG constant for easier debugging

// Enables click, written inside the "handleEvent" function of event forwarder
// SEBBE
// if (e.type === 'click') return;
// if (e.type === 'touchstart') return;

// var DATASET_URL = '/dataset/Affexity.xml';
// 
// // Control variables
// var animationPending = false;
// 
// // Initialize Argon, the scene and the camera (THREE.js)
// var app = Argon.init();
// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera();
// var userLocation = new THREE.Object3D();
// var renderer = new THREE.WebGLRenderer({
//     alpha: true,
//     logarithmicDepthBuffer: true,
//     antialias: Argon.suggestedWebGLContextAntialiasAttribute
// });
// 
// // Add the camera and user to the scene
// scene.add(camera);
// scene.add(userLocation);
// 
// renderer.setPixelRatio(window.devicePixelRatio);
// 
// app.view.setLayers([{ source: renderer.domElement }]);
// 
// // Object that will contain our video in 3d-space
// var argonVideoObject = new THREE.Object3D();
// // Hide it by default
// argonVideoObject.position.z = -0.5;
// argonVideoObject.scale.set(0.001, 0.001, 0.001);
// // Add it to the user so we can render it infront of the user
// userLocation.add(argonVideoObject);
// 
// // <video> element used to play videos
// var videoElement = document.createElement('video');
// videoElement.setAttribute('playsinline', '');
// // Disable fullscreen videos
// // TODO: needed?
// enableInlineVideo(videoElement);
// 
// // The canvas in which we render the video
// // var videoCanvas = document.createElement('canvas');
// // videoCanvas.width = 640;
// // videoCanvas.height = 360;
// 
// // 
// // var videoCanvasContext = videoCanvas.getContext('2d');
// // videoCanvasContext.fillStyle = '#000000';
// // videoCanvasContext.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
// 
// var videoTexture = new THREE.VideoTexture(videoElement);
// videoTexture.minFilter = THREE.LinearFilter;
// videoTexture.magFilter = THREE.LinearFilter;
// 
// 
// // var videoTexture = new THREE.Texture(videoCanvas);
// // videoTexture.minFilter = THREE.LinearFilter;
// // videoTexture.magFilter = THREE.LinearFilter;
// 
// var shaderMaterial = new THREE.ShaderMaterial({
//     uniforms: {
//         texture: {
//             type: 't',
//             value: videoTexture
//         }
//     },
//     vertexShader: [
//         'varying vec2 vUv;',
//         'varying float texU;',
//         'void main()',
//         '{',
//         'vUv = uv;',
//         'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
//         'gl_Position = projectionMatrix * mvPosition;',
//         '}'
//     ].join('\n'),
// 
//     fragmentShader: [
//         'uniform sampler2D texture;',
//         'uniform vec3 color;',
//         'varying vec2 vUv;',
//         'void main()',
//         '{',
//         'vec2 texcoord = vec2(0.49, 0.0);',
//         'vec2 halfTex = vec2(0.5, 1.0);',
//         'vec3 tColor = texture2D( texture, ( vUv * halfTex ) ).rgb;',
//         'vec3 aColor = texture2D( texture, ( (vUv * halfTex ) + texcoord ) ).rgb;',
//         'float a = aColor.g;',
//         'gl_FragColor = vec4(tColor, a);',
//         '}'
//     ].join('\n')
// });
// 
// var videoGeometry = new THREE.PlaneGeometry(500, 500); // TODO does this need to be dynamic?
// 
// // var videoMaterial = new THREE.MeshBasicMaterial({
// //     shader: shaderMaterial,
// //     map: videoTexture,
// //     // overdraw: true,
// //     // transparent: true,
// //     // opacity: 0.5
// // });
// 
// // var videoScreen = new THREE.Mesh(videoGeometry, videoMaterial);
// var videoScreen = new THREE.Mesh(videoGeometry, shaderMaterial);
// 
// argonVideoObject.add(videoScreen);
// 
// function handleTouchStart(e) {
//     if (e.touches === undefined || e.touches.length !== 1) {
//         return
//     }
// 
//     console.log('TOUCHED!');
// 
//     e.preventDefault();
// 
//     if (videoElement.paused) {
//         videoElement.play();
//     } else {
//         videoElement.pause();
//     }
// }
// 
// function imageTrackingFn(v) {
//     return function() {
// 
//         var videoPose = app.context.getEntityPose(v.entity);
// 
//         // KNOWN
//         if (videoPose.poseStatus & Argon.PoseStatus.KNOWN) {
//             v.object.position.copy(videoPose.position);
//             v.object.quaternion.copy(videoPose.orientation);
//         }
// 
//         // FOUND
//         if (videoPose.poseStatus & Argon.PoseStatus.FOUND) {
//             v.object.add(argonVideoObject);
//             argonVideoObject.position.z = 0;
//             videoElement.src = '/videos/' + v.src;
//             // TODO videoElement.loop = true;
//             videoElement.load();
//             // TODO settimeout -> videoElement.play()?
// 
//             // TODO might have to fix 'touchstart' within the Argon source?
//             document.addEventListener('touchstart', handleTouchStart, false);
//             document.addEventListener('click', handleTouchStart, false);
//         // LOST
//         } else if (videoPose.poseStatus & Argon.PoseStatus.LOST) {
//             argonVideoObject.position.z = -0.5;
//             userLocation.add(argonVideoObject);
//             videoElement.pause();
// 
//             // TODO might have to fix 'touchstart' within the Argon source?
//             document.removeEventListener('touchstart', handleTouchStart, false);
//             document.removeEventListener('click', handleTouchStart, false);
//         }
//     }
// }
// 
// function setupTrackables(trackables) {
//     console.log('WILL SETUP TRACKABLES: ', VIDEOS.length);
// 
//     // Videos from the global scope
//     VIDEOS.map(function(v) {
//         app.context
//             .subscribe(trackables[v.key].id)
//             .then(function(entity) {
// 
//                 var e = Object.assign({}, v, {
//                     entity: entity,
//                     object: new THREE.Object3D()
//                 });
// 
//                 scene.add(e.object);
// 
//                 var trackingFn = imageTrackingFn(e);
// 
//                 app.context.updateEvent.addEventListener(trackingFn);
//             });
//     });
// }
// 
// // Initialize and setup vuforia
// function setupVuforia(available) {
//     if (!available) {
//         console.log('Vuforia is not available on this platform');
//         return;
//     }
// 
//     app.vuforia
//         .init({ encryptedLicenseData: LICENSE }) // License from the global scope
//         .then(function(api) {
// 
//             console.log('LICENSE VALID!')
// 
//             // Create the dataset from our URL
//             api.objectTracker
//                 .createDataSetFromURL(DATASET_URL)
//                 .then(function(dataset) {
//                     // Load the dataset
//                     api.objectTracker
//                         .loadDataSet(dataset)
//                         .then(setupTrackables);
// 
//                     // Activate our dataset
//                     api.objectTracker
//                         .activateDataSet(dataset);
//                 });
//         })
//         .catch(function(e) { console.log('Vuforia was unable to initialize') });
// }
// 
// function updateEventFn() {
//     var userPose = app.context.getEntityPose(app.context.user);
// 
//     if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
//         userLocation.position.copy(userPose.position);
//     }
// }
// 
// function renderFunc() {
//     animationPending = false;
// 
//     renderer.setSize(app.view.renderWidth, app.view.renderHeight, false);
//     renderer.setPixelRatio(app.suggestedPixelRatio);
// 
//     for (var i = 0, sv = app.view.subviews; i < sv.length; i++) {
//         var subview = sv[i];
// 
//         camera.position.copy(subview.pose.position);
//         camera.quaternion.copy(subview.pose.orientation);
//         camera.projectionMatrix.fromArray(subview.projectionMatrix);
// 
//         var x = subview.viewport.x;
//         var y = subview.viewport.y;
//         var width = subview.viewport.width;
//         var height = subview.viewport.height;
// 
//         if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
//             // videoCanvasContext.drawImage(
//             //     videoElement,
//             //     0,
//             //     0,
//             //     videoCanvas.width,
//             //     videoCanvas.height
//             // );
// 
//             if (videoTexture) {
//                 videoTexture.needsUpdate = true;
//             }
//         }
// 
//         renderer.setViewport(x, y, width, height);
//         renderer.setScissor(x, y, width, height);
//         renderer.setScissorTest(true);
//         renderer.render(scene, camera, subview.index);
//     }
// }
// 
// function renderEventFn() {
//     if (!animationPending) {
//         animationPending = true;
//         window.requestAnimationFrame(renderFunc);
//     }
// }
// 
// // Lets go!
// app.vuforia.isAvailable().then(setupVuforia); // TODO add catch?
// app.context.updateEvent.addEventListener(updateEventFn);
// app.context.renderEvent.addEventListener(renderEventFn);
