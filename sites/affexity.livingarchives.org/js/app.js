"use strict";

const DEBUG = true;
const DATASET_URL = '/dataset/Affexity.xml';
const VIDEOS = [
    {
        key: 'delicatepassage2',
        src: 'del-pass-red-wall-no-music.3gp',
        object: null,
        entity: null
    },
    {
        key: 'Corpus2',
        src: 'riverbed.3gp',
        object: null,
        entity: null
    }
];

let Video = {
    src: '', 
    elem: document.createElement('video')
};

Video.elem.setAttribute('playsinline', '');
enableInlineVideo(Video.elem);

let animationIsPending = false;

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
    transparent: true,
    side: THREE.DoubleSide,
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


// TODO do the dimensions need to be dynamic?
const videoGeometry = new THREE.PlaneGeometry(500, 500);
const videoMesh = new THREE.Mesh(videoGeometry, shaderMaterial);

videoObject.add(videoMesh);
// videoObject.renderOrder = 10;

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
        videoObject.position.z = 0
        videoObject.visible = true;

        document.addEventListener('touchstart', handleTouchStart, false);
    // LOST
    } else if (vp.poseStatus & Argon.PoseStatus.LOST) {
        if (DEBUG) console.log('LOST video', v.src);

        videoObject.position.z = -0.5;
        videoObject.visible = false;
        userLoc.add(videoObject);

        Video.elem.pause();

        document.removeEventListener('touchstart', handleTouchStart, false);
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
