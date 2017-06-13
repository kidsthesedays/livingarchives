import Navigo from 'navigo'
import { routes } from './routes/index'
import { setupArgon } from './utils'

function main() {
    // TODO remove
    console.log('clearing local storage')
    localStorage.clear()

    // Application Router
    const Router = new Navigo(null)

    // Main state of our application (mutable)
    let state = {
        router: Router,
        navigate: path => Router.navigate(`${window.location.origin}${path}`, true),
        documentRootNode: document.documentElement,
        reactMountNode: document.getElementById('mount'),
        audioMountNode: document.getElementById('audio-mount'),
        argonMountNode: document.getElementById('argon'),
        locationIndicatorNode: document.getElementById('indicators'),
        app: null,
        locations: [],
        prevRoute: '',
        userPosition: {},
        userData: {},
        audio: {
            active: false,
            src: '',
            name: '',
            locationID: null
        }
    }

    // Initialize basic argon setup
    setupArgon(state)

    // Iterate through all routes and their urls,
    // add a new route for each of these urls
    routes.forEach(r => {
        r.urls.forEach(url => {
            Router.on(
                url,
                r.route(state),
                r.hooks(state)
            )
        })
    })

    // Resolve the current url
    Router.resolve()
}

main()
