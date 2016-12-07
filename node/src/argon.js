// @flow
import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
import { CSS3DSprite } from './CSS3DArgon'
import { toFixed } from './utilities'

// Initialize stuff for argon
export function setupArgon(state: Object) {
    state.app.context.setDefaultReferenceFrame(state.app.context.localOriginEastUpSouth)
    state.scene.add(state.camera)
    state.scene.add(state.userLocation)
        
    // set pixel ratio (ex "2" for retina screens etc)
    state.renderer.setPixelRatio(window.devicePixelRatio)

    // append renderers to our app view
    state.app.view.element.appendChild(state.renderer.domElement)
    state.app.view.element.appendChild(state.cssRenderer.domElement)
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
        position: Argon.Cesium.Cartesian3.fromDegrees(
            meta.longitude,
            meta.latitude
        )
    })

    let label: Object = document.createElement('div')
    label.className = 'indicator-container'

    let p: Object = document.createElement('p')
    p.className = 'indicator'
    p.textContent = meta.position
    label.appendChild(p)

    state.locationIndicatorNode.appendChild(label)

    let labelObject: Object = new CSS3DSprite(label)
    labelObject.scale.set(0.02, 0.02, 0.02)
    labelObject.position.set(0, 1.25, 0)
    geoObject.add(labelObject)

    // We need to add a location object to the geo object
    // to be able to calculate the distance between two objects
    geoObject.add(locationObject)

    return {
        initialized: false,
        meta,
        content,
        geoEntity,
        geoObject,
        locationObject,
        labelObject
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

    return (frame: Object) => {
        // Update user position
        const userPose: Object = app.context.getEntityPose(app.context.user)

        if (!(userPose.poseStatus & Argon.PoseStatus.KNOWN)) {
            return
        }

        // Update user position for the 3D Object
        userLocation.position.copy(userPose.position)

        // Update position for all locations
        locations.filter(l => l.meta.id == id).forEach(location => {
            // Initialize location for Argon as a reference frame
            if (!location.initialized) {
                if (Argon.convertEntityReferenceFrame(location.geoEntity, frame.time, Argon.Cesium.ReferenceFrame.FIXED)) {
                    location.initialized = true
                    scene.add(location.geoObject) 
                }
            }
            
            // Update geo position
            const locationPose: Object = app.context.getEntityPose(location.geoEntity)
            // location.geoObject.position.copy(locationPose.position)
            // location.geoObject.quaternion.copy(locationPose.orientation)

            // NOTE does this improve?
            // if (locationPose.poseStatus & Argon.PoseStatus.KNOWN) {
            //     location.geoObject.position.copy(locationPose.position)
            //     location.geoObject.quaternion.copy(locationPose.orientation)
            // }
            if (locationPose.poseStatus & Argon.PoseStatus.KNOWN) {
                location.geoObject.position.copy(locationPose.position)
                location.geoObject.quaternion.copy(locationPose.orientation)
                console.log('known')
            }

            if (locationPose.poseStatus & Argon.PoseStatus.FOUND) {
                // cb(true, getDistanceFromUser(userLocation, location))
                console.log('found')
            } else if (locationPose.poseStatus & Argon.PoseStatus.LOST) {
                // cb(false, 0)
                console.log('lost')
            }

            // Send distance to callback
            cb && cb(false, getDistanceFromUser(userLocation, location))
        })
    }
}

export function renderArgon(state: Object): Function {
    const {
        app,
        camera,
        scene,
        renderer,
        cssRenderer
    } = state

    return () => {
        const viewport = app.view.getViewport()
        const subviews = app.view.getSubviews()

        renderer.setSize(viewport.width, viewport.height)
        cssRenderer.setSize(viewport.width, viewport.height)

        for (let subview of subviews) {
            camera.position.copy(subview.pose.position)
            camera.quaternion.copy(subview.pose.orientation)
            camera.projectionMatrix.fromArray(subview.projectionMatrix)

            const { x, y, width, height } = subview.viewport

            camera.fov = THREE.Math.radToDeg(subview.frustum.fovy)

            cssRenderer.setViewport(x, y, width, height, subview.index)
            cssRenderer.render(scene, camera, subview.index)

            renderer.setViewport(x, y, width, height)
            renderer.setScissor(x, y, width, height)
            renderer.setScissorTest(true)
            renderer.render(scene, camera)
        }
    }
}
