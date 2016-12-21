// @flow
import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
// import { CSS3DObject } from './CSS3DArgon'
import {
    toFixed
    // calculateDistance,
    // calculateAngle,
    // throttle
} from './utilities'

// Setup argon
export function setupArgon(state: Object) {
    // Initialize Argon
    state.app = Argon.init({
        configuration: {
            'app.disablePinchZoom': true
        }
    })
    // state.app.session.configuration.role = 'RealityView'
    state.scene = new THREE.Scene()
    state.camera = new THREE.PerspectiveCamera()
    state.userLocation = new THREE.Object3D()
    state.renderer = new THREE.WebGLRenderer({
        alpha: true,
        logarithmicDepthBuffer: true
    })
    // Initialize the texture loader
    state.loader = new THREE.TextureLoader()
    state.loader.setCrossOrigin('anonymous')
    // Eye entity that represents the eye for our custom reality
    state.eyeEntity = new Argon.Cesium.Entity({
        orientation: new Argon.Cesium.ConstantProperty(Argon.Cesium.Quaternion.IDENTITY)
    })
    // Recylable object
    state.scratchQuaternion = new Argon.Cesium.Quaternion
    // Set default reference frame and add the camera and user location to the scene
    state.app.context.setDefaultReferenceFrame(state.app.context.localOriginEastUpSouth)
    state.scene.add(state.camera)
    state.scene.add(state.userLocation)
    // set pixel ratio (ex "2" for retina screens etc)
    state.renderer.setPixelRatio(window.devicePixelRatio)
    // append renderers to our app view
    state.app.view.element.appendChild(state.renderer.domElement)
    // Disable location updates
    state.app.device.loactionUpdatesEnabled = false

    console.log(state.app)
    // setupFrameFunc(state)
    // state.app2 = Argon.init()
    // state.app2.reality.setDefault({
    //     title: 'test',
    //     uri: 'reality:empty',
    //     providedReferenceFrames: ['FIXED']
    // })
}

export function setupFrameFunc(state: Object): Function {
    const {
        app,
        eyeEntity,
        scratchQuaternion
    } = state

    const onFrame = (time, index) => {
        app.device.update()

        const deviceOrientation = Argon.getEntityOrientation(
            app.device.displayEntity,
            time,
            app.device.geolocationEntity,
            scratchQuaternion
        )

        eyeEntity.orientation.setValue(deviceOrientation)

        app.reality.publishFrame({
            time: time,
            index: index,
            eye: {
                pose: Argon.getSerializedEntityPose(eyeEntity, time),
                stereoMultiplier: 0
            }
        })

        app.timer.requestFrame(onFrame)
    }

    app.timer.requestFrame(onFrame)

    return onFrame
}

export function loadPanorama(state: Object, panorama: Object) {
    const {
        loader,
        eyeEntity,
        userLocation
    } = state

    let entity = new Argon.Cesium.Entity

    if (Argon.Cesium.defined(panorama.latitude) && Argon.Cesium.defined(panorama.longitude)) {
        const positionProperty = new Argon.Cesium.ConstantPositionProperty()
        const positionValue = Argon.Cesium.Cartesian3.fromDegrees(
            panorama.longitude,
            panorama.latitude,
            panorama.height || 0
        )

        positionProperty.setValue(positionValue, Argon.Cesium.ReferenceFrame.FIXED)

        const orientationProperty = new Argon.Cesium.ConstantProperty()
        const orientationValue = Argon.Cesium.Transforms.headingPitchRollQuaternion(
            positionValue,
            0,
            0,
            0
        )

        orientationProperty.setValue(orientationValue)

        entity.position = positionProperty
        entity.orientation = orientationProperty

        loader.load(panorama.src, texture => {
            texture.minFilter = THREE.LinearFilter

            const sphereGeometry = new THREE.SphereGeometry(100, 32, 32)
            const meshBasicMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 })
            const mesh = new THREE.Mesh(sphereGeometry, meshBasicMaterial)

            userLocation.add(mesh)
            // meshBasicMaterial.transparent = true

            eyeEntity.position = new Argon.Cesium.ConstantPositionProperty(
                Argon.Cesium.Cartesian3.ZERO,
                entity
            )

            mesh.scale.set(-1, 1, 1)
            // mesh.material.opacity = 0
            // Fade in with tween
        })
    }
}

export function updateUserPose(state: Object): Function {
    const {
        app,
        userLocation
    } = state

    return () => {
        const userPose = app.context.getEntityPose(app.context.user)

        if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
            userLocation.position.copy(userPose.position)
        }

        // Tween
    }
}


// Setup a new location
export function setupLocation(meta: Object, content: string, state: Object): Object {
    // THREE.js 3D objects and a Cesium entity - these represents the location/pose
    // let locationObject: Object = new THREE.Object3D()
    // let geoObject: Object = new THREE.Object3D()
    // let geoEntity: Object = new Argon.Cesium.Entity({
    //     name: meta.name,
    //     orientation: Argon.Cesium.Quaternion.IDENTITY,
    //     // position: Argon.Cesium.Quaternion.ZERO
    //     position: Argon.Cesium.Cartesian3.fromDegrees(
    //         meta.longitude,
    //         meta.latitude
    //     )
    // })

    // let mesh: Object = new THREE.Mesh(
    //     new THREE.PlaneGeometry(15, 15, 5),
    //     new THREE.MeshBasicMaterial({
    //         color: 0xffff00,
    //         side: THREE.DoubleSide
    //     })
    // )
    // mesh.scale.set(1, 1, 1)
    // locationObject.add(mesh)
    
    console.log(state.length)


    // We need to add a location object to the geo object
    // to be able to calculate the distance between two objects
    // geoObject.add(locationObject)

    return {
        initialized: false,
        meta,
        content
        // geoEntity,
        // geoObject,
        // mesh,
        // locationObject
        // labelObject
    }
}

// Calculate distance between two 3D objects (THREE)
export function getDistanceFromUser(user: Object, location: Object): number {
    const userPos: Object = user.getWorldPosition()
    const locationPos: Object = location.locationObject.getWorldPosition()
    const distance: number = userPos.distanceTo(locationPos)
    return toFixed(distance, 2)
}
// Handles the update of user and _one_ location position 
export function updateUserAndLocationPosition(state: Object, id: number, cb: Function): Function {
    const {
        app,
        scene,
        userLocation,
        locations
    } = state

    const location: Object = locations.filter(l => l.meta.id == id).reduce((_, l) => l, {})

    return (frame: Object) => {
        // Update user position
        const userPose: Object = app.context.getEntityPose(app.context.user)

        // Update user position for the 3D Object
        if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
            userLocation.position.copy(userPose.position)
        } else {
            return
        }

        // Initialize location for Argon as a reference frame
        if (!location.initialized) {


            if (Argon.convertEntityReferenceFrame(location.geoEntity, frame.time, Argon.Cesium.ReferenceFrame.FIXED)) {
                location.initialized = true
                scene.add(location.geoObject) 

                const locationPose: Object = app.context.getEntityPose(location.geoEntity)
                if (locationPose.poseStatus & Argon.PoseStatus.KNOWN) {
                    location.geoObject.position.copy(locationPose.position)
                    location.geoObject.quaternion.copy(locationPose.orientation)
                }
            }
        }


        cb(1)
    }
}

export function renderArgon(state: Object): Function {
    const {
        app,
        camera,
        scene,
        renderer
    } = state

    let pending: bool = false

    const render: Function = () => {
        pending = false

        const viewport = app.view.getViewport()
        const subviews = app.view.getSubviews()

        renderer.setSize(viewport.width, viewport.height)

        for (let subview of subviews) {
            camera.position.copy(subview.pose.position)
            camera.quaternion.copy(subview.pose.orientation)

            camera.projectionMatrix.fromArray(subview.projectionMatrix)

            const { x, y, width, height } = subview.viewport

            renderer.setViewport(x, y, width, height)
            renderer.render(scene, camera)

            renderer.setScissor(x, y, width, height)
            renderer.setScissorTest(true)
        }
    }

    return () => {
        if (!pending) {
            pending = true
            window.requestAnimationFrame(render)
        }
    }
}
