// @flow

import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
import * as routes from './routes/index'
import Navigo from 'navigo'

import {
    CSS3DArgonHUD,
    CSS3DArgonRenderer
} from './CSS3DArgon'

import { setupArgon } from './argon'
import { setupLocation } from './utilities'
import { fetchLocationData } from './cache'

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
        reactMountNode: document.getElementById('mount'),
        app: Argon.init(),
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(),
        userLocation: new THREE.Object3D(),
        renderer: new THREE.WebGLRenderer({
            alpha: true,
            logarithimDepthBuffer: true
        }),
        cssRenderer: new CSS3DArgonRenderer(),
        hud: new CSS3DArgonHUD(),
        locations: []
    }

    // Initialize basic argon setup
    state = setupArgon(state)

    fetchLocationData(json => {
        console.log('Fetched location data:', json)

        // Setup all locations
        state.locations = json.locations.map(location => {
            //  filter out content based on location id
            const content: string = json.content
                .filter(c => c.id === location.id)
                .reduce((_, c) => c.html, '')

            return setupLocation(location, content)
        })

        console.log(state.locations)
    })

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

    Router.on(
        '/locations/:id/map',
        routes.locationMap(state),
        locationMapHooks
    )
    Router.on(
        '/locations/:id/camera',
        routes.locationCamera(state),
        locationCameraHooks
    )
    Router.on(
        '/locations/:id',
        routes.location(state),
        locationHooks
    )
    Router.on(
        '/locations/:id/*',
        routes.location(state),
        locationHooks
    )
    Router.on(
        '/map',
        routes.locationsMap(state),
        locationsMapHooks
    )
    Router.on(
        '/locations',
        routes.locationsList(state),
        locationsListHooks
    )
    Router.on(
        '/*',
        routes.guide(state),
        guideHooks
    )
    
    Router.resolve()
}

main()
