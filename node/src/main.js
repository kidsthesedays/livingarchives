// @flow

import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
import Navigo from 'navigo'
import { routes } from './routes/index'

import {
    // CSS3DArgonHUD,
    CSS3DArgonRenderer
} from './CSS3DArgon'

import { setupArgon } from './argon'
import {
    setupLocationData,
    setupUserData
} from './utilities'

function main() {
    // TODO remove
    console.log('clearing local storage')
    localStorage.clear()

    console.log(Argon)

    // Used by the Navigo router library
    const BASE_URL: string = 'https://alberta.livingarchives.org'
    // Application Router
    const Router: Object = new Navigo(BASE_URL)

    // Main state of our application (mutable)
    let state: Object = {
        router: Router,
        navigate: path => Router.navigate(`${window.location.origin}${path}`, true),
        documentRootNode: document.documentElement,
        reactMountNode: document.getElementById('mount'),
        argonMountNode: document.getElementById('argon'),
        locationIndicatorNode: document.getElementById('indicators'),
        app: Argon.init(),
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(),
        userLocation: new THREE.Object3D(),
        renderer: new THREE.WebGLRenderer({
            alpha: true,
            logarithmicDepthBuffer: true
        }),
        cssRenderer: new CSS3DArgonRenderer(),
        // hud: new CSS3DArgonHUD(), // TODO unused?
        locations: [],
        prevRoute: '',
        userPosition: {},
        userData: {}
    }

    // Initialize basic argon setup
    setupArgon(state)
    // Fetch location + user data and store it in the cache
    setupLocationData(state)
    setupUserData(state)

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
