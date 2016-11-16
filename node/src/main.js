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
    const state: Object = {
        router: Router,
        app: Argon.init(),
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(),
        userLocation: new THREE.Object3D()
    }

    Router
        .on({
            // Show a map of all points
            '/points/map': routes.listMap(state),
            // Show the map for a single point
            '/points/:id/map': routes.pointMap(state),
            // Show the ar mode for a single point
            '/points/:id/ar': routes.pointArMode(state),
            // Show a single point
            '/points/:id': routes.point(state),
            // Captures badly formatted routes for a point
            '/points/:id/*': routes.point(state),
            // Show all points
            '/points': routes.list(state),
            // Show all points
            '/': routes.list(state)
        })
        .resolve()
}

main()
