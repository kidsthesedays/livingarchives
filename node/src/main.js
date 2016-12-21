// @flow
import Navigo from 'navigo'
import { routes } from './routes/index'
import { setupArgon } from './argon'

function main() {
    // TODO remove
    console.log('clearing local storage')
    localStorage.clear()

    // Used by the Navigo router library
    const BASE_URL: string = 'http://alberta.livingarchives.org'
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
        app: null,
        scene: null,
        camera: null,
        userLocation: null,
        renderer: null,
        loader: null,
        eyeEntity: null,
        scratchQuaternion: null,
        locations: [],
        prevRoute: '',
        userPosition: {},
        userData: {}
    }

    // Initialize basic argon setup
    setupArgon(state)

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
