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

// Initialize stuff for argon
export function setupArgon(state: Object) {
    state.app.context.setDefaultReferenceFrame(state.app.context.localOriginEastUpSouth)
    state.scene.add(state.camera)
    state.scene.add(state.userLocation)
        
    // set pixel ratio (ex "2" for retina screens etc)
    state.renderer.setPixelRatio(window.devicePixelRatio)

    // append renderers to our app view
    state.app.view.element.appendChild(state.renderer.domElement)
    // state.app.view.element.appendChild(state.cssRenderer.domElement)
    // state.app.view.element.appendChild(state.hud.domElement)
}

// Setup a new location
export function setupLocation(meta: Object, content: string, state: Object): Object {
    // THREE.js 3D objects and a Cesium entity - these represents the location/pose
    let locationObject: Object = new THREE.Object3D()
    let geoObject: Object = new THREE.Object3D()
    let geoEntity: Object = new Argon.Cesium.Entity({
        name: meta.name,
        orientation: Argon.Cesium.Quaternion.IDENTITY,
        // position: Argon.Cesium.Quaternion.ZERO
        position: Argon.Cesium.Cartesian3.fromDegrees(
            meta.longitude,
            meta.latitude
        )
    })

    let mesh: Object = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 15, 5),
        new THREE.MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide
        })
    )
    mesh.scale.set(1, 1, 1)
    // mesh.position.y = -100
    // mesh.rotation.x = -Math.PI / 2
    // locationObject.position.z = 100
    // locationObject.position.y = Math.PI
    locationObject.add(mesh)
    
    console.log(state.length)

    // let label: Object = document.createElement('div')
    // label.className = 'indicator-container'

    // let p: Object = document.createElement('p')
    // p.className = 'indicator'
    // p.textContent = meta.position
    // label.appendChild(p)

    // // state.locationIndicatorNode.appendChild(label)

    // let labelObject: Object = new CSS3DObject(label)
    // labelObject.scale.set(0.04, 0.04, 0.04)
    // labelObject.position.set(0, 1.25, 0)
    //
    // labelObject.position.x = 0.0
    // labelObject.position.y = 0.0
    // labelObject.position.z = 200.0
    // labelObject.rotation.y = Math.PI

    // let v = new THREE.Vector3(0, 0, 0)
    // labelObject.lookAt(v)

    // geoObject.add(labelObject)

    // We need to add a location object to the geo object
    // to be able to calculate the distance between two objects
    geoObject.add(locationObject)

    return {
        initialized: false,
        meta,
        content,
        geoEntity,
        geoObject,
        mesh,
        locationObject
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

// function lonLatToVector3(lng, lat, out) {
//     out = out || new THREE.Vector3();
// 
//     // flips the Y axis
//     lat = Math.PI / 2 - lat;
// 
//     // distribute to sphere
//     out.set(
//         Math.sin(lat) * Math.sin(lng),
//         Math.cos(lat),
//         Math.sin(lat) * Math.cos(lng)
//     );
// 
//     return out;
// }

// Handles the update of user and _one_ location position
export function updateUserAndLocationPosition(state: Object, id: number, cb: Function): Function {
    const {
        app,
        scene,
        userLocation,
        locations
    } = state

    const location: Object = locations.filter(l => l.meta.id == id).reduce((_, l) => l, {})

    // let prev: number = 0
    // let tmp: Object = {
    //     locationObject: new THREE.Object3D()
    // }

    // scene.add(tmp.locationObject)

    // const calc = throttle((user, meta, mesh) => {
    //     const p = { lat: meta.latitude, lng: meta.longitude }
    //     const d = calculateDistance(user, p)
    //     const a = calculateAngle(user, p)

    //     mesh.position.x = d
    //     mesh.rotation.y = (a / 100)

    //     console.log('distance', d)
    //     console.log('angle', a)
    // }, 1000)

    return (frame: Object) => {
        // Update user position
        const userPose: Object = app.context.getEntityPose(app.context.user)

        // Update user position for the 3D Object
        if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
            userLocation.position.copy(userPose.position)
        } else {
            return
        }


        // Update position for all locations
        // locations.filter(l => l.meta.id == id).forEach(location => {

        // Initialize location for Argon as a reference frame
        if (!location.initialized) {

            // const defaultFrame = app.context.getDefaultReferenceFrame()

            // const lPos = userPose.position.clone()
            // console.log('x:', lPos.x, 'y:', lPos.y, 'z:', lPos.z)
            // scene.add(location.geoObject)

            // location.geoEntity.position.setValue(lPos, defaultFrame)
            // location.geoEntity.orientation.setValue(Argon.Cesium.Quaternion.IDENTITY)
            // location.initialized = true

            // scene.add(location.geoObject) 
            // userLocation.add(location.mesh)

            if (Argon.convertEntityReferenceFrame(location.geoEntity, frame.time, Argon.Cesium.ReferenceFrame.FIXED)) {
                location.initialized = true
                scene.add(location.geoObject) 
            //     userLocation.add(location.mesh)
            //     // userLocation.add(location.labelObject)
            //     // cb(1)
                // const locationPose: Object = app.context.getEntityPose(location.geoEntity)
                // const L = locationPose.position.clone()
                // console.log(L.x, L.y, L.z)
                // // console.log(locationPose.position.x, locationPose.position.y, locationPose.position.z)
                // location.mesh.position.x = L.x
                // location.mesh.position.y = L.y
                const locationPose: Object = app.context.getEntityPose(location.geoEntity)
                if (locationPose.poseStatus & Argon.PoseStatus.KNOWN) {
                    location.geoObject.position.copy(locationPose.position)
                    location.geoObject.quaternion.copy(locationPose.orientation)
                }
            }
        }

        // calc(state.userPosition, location.meta, location.mesh)
        
        // Update geo position
        // const locationPose: Object = app.context.getEntityPose(location.geoEntity)
        // const L = locationPose.position.clone()
        // location.mesh.position.x = L.x
        // location.mesh.position.y = L.y
        // location.geoObject.position.copy(locationPose.position)
        // location.geoObject.quaternion.copy(locationPose.orientation)

        // NOTE does this improve?
        // if (locationPose.poseStatus & Argon.PoseStatus.KNOWN) {
        //     // Always update orientation?
        //     location.geoObject.quaternion.copy(locationPose.orientation)

        //     if (prev === 0) {
        //         tmp.locationObject.position.copy(locationPose.position)
        //         location.geoObject.position.copy(locationPose.position)
        //         prev = getDistanceFromUser(userLocation, tmp)
        //     } else {
        //         // tmp.locationObject.position.copy(locationPose.position)
        //         // tmp.locationObject.quaternion.copy(locationPose.orientation)
        //         let n: number = getDistanceFromUser(userLocation, tmp)

        //         if (n > (prev + 4) || n < (prev - 4)) {
        //             console.log('is less then 4+-')
        //             location.geoObject.position.copy(locationPose.position)
        //         } else {
        //             console.log('not less then, continue')
        //             tmp.locationObject.position.copy(locationPose.position)
        //         }
        //         prev = n
        //         console.log(prev)
        //     }
        // }

        cb(1)
        // const locationPose: Object = app.context.getEntityPose(location.geoEntity)
        // if (locationPose.poseStatus & Argon.PoseStatus.KNOWN) {
        //     location.geoObject.position.copy(locationPose.position)
        //     location.geoObject.quaternion.copy(locationPose.orientation)
        // }

        // if (locationPose.poseStatus & Argon.PoseStatus.FOUND) {
        //     cb(true, getDistanceFromUser(userLocation, location))
        // } else if (locationPose.poseStatus & Argon.PoseStatus.LOST) {
        //     cb(false, 0)
        // } else {
        //     cb(false, getDistanceFromUser(userLocation, location))
        // }
    }
}

export function renderArgon(state: Object): Function {
    const {
        app,
        camera,
        scene,
        renderer
        // cssRenderer
    } = state

    let pending: bool = false

    const render: Function = () => {
        pending = false

        const viewport = app.view.getViewport()
        const subviews = app.view.getSubviews()

        renderer.setSize(viewport.width, viewport.height)
        // cssRenderer.setSize(viewport.width, viewport.height)

        for (let subview of subviews) {
            camera.position.copy(subview.pose.position)
            camera.quaternion.copy(subview.pose.orientation)

            camera.projectionMatrix.fromArray(subview.projectionMatrix)
            // camera.fov = THREE.Math.radToDeg(subview.frustum.fovy)
            // camera.fov = subview.frustum.fovy * 180 / Math.PI

            const { x, y, width, height } = subview.viewport

            // cssRenderer.setViewport(x, y, width, height, subview.index)
            // cssRenderer.render(scene, camera, subview.index)

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
