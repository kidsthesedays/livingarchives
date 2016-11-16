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

    // initialize Argon
    // set default reference frame
    //
    // create the Scene
    // create the Camera
    // create a object that represents the userLocation
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

    Router
        .on({
            // Show the map for a single location
            '/locations/:id/map': routes.locationMap(state),
            // Show the ar mode for a single location
            '/locations/:id/camera': routes.locationCamera(state),
            // Show a single location
            '/locations/:id': routes.location(state),
            // Captures badly formatted routes for a location
            '/locations/:id/*': routes.location(state),
            // Show a map of all locations
            '/map': routes.locations(state),
            // Show all locations
            '/locations': routes.list(state),
            // Show introductory text
            '/': routes.guide(state)
        })
        .resolve()
}

main()
