// @flow

import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
import Navigo from 'navigo'
import { routes } from './routes/index'

import {
    CSS3DArgonHUD,
    CSS3DArgonRenderer
} from './CSS3DArgon'

import { setupArgon } from './argon'
import { setupLocationData } from './utilities'

function main() {
    // Used by the Navigo router library
    const BASE_URL: string = 'http://alberta.livingarchives.dev'
    // Application Router
    const Router: Object = new Navigo(BASE_URL)

    // Main state of our application (mutable)
    let state: Object = {
        router: Router,
        reactMountNode: document.getElementById('mount'),
        argonMountNode: document.getElementById('argon'),
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
        locations: [],
        prevRoute: '',
        userPosition: {},
        userData: {}
    }

    // Initialize basic argon setup
    state = setupArgon(state)
    // Fetch location data and store it in the cache
    setupLocationData(state)

    // TODO fetch and initialize user data

    // Iterate through all routes and their urls,
    // add a new route for each of these urls
    routes.forEach(r => {
        r.urls.forEach(url => Router.on(
            url,
            r.route(state),
            r.hooks(state)
        ))
    })

    // Resolve the current url
    Router.resolve()
}

main()
