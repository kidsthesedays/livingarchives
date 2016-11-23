// @flow

import * as Argon from '@argonjs/argon'
import { toFixed } from './utilities'

// Initialize stuff for argon
export function setupArgon(state: Object): Object {
    state.app.context.setDefaultReferenceFrame(state.app.context.localOriginEastUpSouth)
    state.scene.add(state.camera)
    state.scene.add(state.userLocation)
        
    // set pixel ratio (ex "2" for retina screens etc)
    state.renderer.setPixelRatio(window.devicePixelRatio)

    // append renderers to our app view
    state.app.view.element.appendChild(state.renderer.domElement)
    state.app.view.element.appendChild(state.cssRenderer.domElement)
    state.app.view.element.appendChild(state.hud.domElement)

    return state
}

// Calculate distance between two 3D objects (THREE)
export function getDistanceFromUser(user: Object, location: Object): number {
    const userPos: Object = user.getWorldPosition()
    const locationPos: Object = location.locationObject.getWorldPosition()
    const distance: number = userPos.distanceTo(locationPos)
    return toFixed(distance, 2)
}

// Handles the update of user and _one_ location position
export function updateUserAndLocationPosition(state: Object, id: number, cb: Function) {

    const { app, scene, userLocation, locations } = state

    return (frame: Object) => {
        // Update user position
        const userPose: Object = app.context.getEntityPose(app.context.user)

        if (!(userPose.poseStatus & Argon.PoseStatus.KNOWN)) {
            return
        }

        userLocation.position.copy(userPose.position)

        // Update position for all locations
        locations.filter(loc => loc.meta.id == id).forEach(location => {
            // Initialize location for Argon as a reference frame
            if (!location.initialized) {
                if (Argon.convertEntityReferenceFrame(location.geoEntity, frame.time, Argon.Cesium.ReferenceFrame.FIXED)) {
                    location.initialized = true
                    scene.add(location.geoObject) 
                }
            }
            
            // Update geo position
            const locationPose: Object = app.context.getEntityPose(location.geoEntity)
            location.geoObject.position.copy(locationPose)
            location.geoObject.quaternion.copy(locationPose)

            cb(getDistanceFromUser(userLocation, location))
        })
    }
}

