// @flow

import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
// 
// import {
//     CSS3DArgonHUD,
//     CSS3DArgonRenderer,
//     CSS3DSprite,
//     CSS3DObject
// } from './CSS3DArgon'
// 
// import {
//     toFixed
// } from './utilities'
// 

import Navigo from 'navigo'

import * as routes from './routes/index'

// Router to manage different views/states
// React components for basic lists/content?
//  Does this work with Argon/plain DOM?
// Global state?

function main() {
    // Used by the Navigo router library
    const BASE_URL: string = 'http://alberta.livingarchives.dev'

    // set default reference frame
    //
    //
    // create a webglrenderer
    // create a cssrenderer
    // create a css3dargonHUD
    //
    // add the camera and userlocation to the scene
    // set the pixelration of the webglrenderer
    // add renderers + hud to the app element
    //
    // fetch the main "hud" element from the document (so we can manipulate this)
    //
    // create/initialize each point as a object?
    //
    // functions for updateEvent/renderEvent, for starting/pausing
    //  requestAnimationFrame for renderEvent


    const Router: Object = new Navigo(BASE_URL)

    // Main state of our application
    let state: Object = {
        router: Router,
        app: Argon.init(),
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(),
        userLocation: new THREE.Object3D()
    }

    state.app.context.setDefaultReferenceFrame(state.app.contextLocalOriginEastUpSouth)

    const locationMapHooks: Object = {
        before: routes.beforeLocationMap(state),
        after: routes.afterLocationMap(state)
    }

    const locationCameraHooks: Object = {
        before: routes.beforeLocationCamera(state),
        after: routes.afterLocationCamera(state)
    }

    const locationHooks: Object = {
        before: routes.beforeLocation(state),
        after: routes.afterLocation(state)
    }

    const locationsMapHooks: Object = {
        before: routes.beforeLocationsMap(state),
        after: routes.afterLocationsMap(state)
    }

    const locationsListHooks: Object = {
        before: routes.beforeLocationsList(state),
        after: routes.afterLocationsList(state)
    }

    const guideHooks: Object = {
        before: routes.beforeGuide(state),
        after: routes.afterGuide(state)
    }

    Router
        .on(
            '/locations/:id/map',
            routes.locationMap(state),
            locationMapHooks
        )
        .on(
            '/locations/:id/camera',
            routes.locationCamera(state),
            locationCameraHooks
        )
        .on(
            '/locations/:id',
            routes.location(state),
            locationHooks
        )
        .on(
            '/locations/:id/*',
            routes.location(state),
            locationHooks
        )
        .on(
            '/map',
            routes.locationsMap(state),
            locationsMapHooks
        )
        .on(
            '/locations',
            routes.locationsList(state),
            locationsListHooks
        )
        .on(
            '/',
            routes.guide(state),
            guideHooks
        )
        .resolve()
}

main()
