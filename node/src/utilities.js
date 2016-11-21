// @flow
import 'whatwg-fetch'

// Format floating points
export function toFixed(value: number, precision: number = 0): number {
    const p: number = Math.pow(10, precision)
    return Math.round(value * p) / p
}

// Creates a GUID based on several different browser variables
// It wont be compliant with RFC4122 but hopefully good enough
export function guid(): string {
    const nav: Object = window.navigator
    const screen: Object = window.screen

    return [
        nav.mimeTypes.length,
        nav.userAgent.replace(/D+/g, ''),
        nav.plugins.length,
        screen.height || '',
        screen.width || '',
        screen.pixelDepth || ''
    ].join('')
}

// Initialize stuff for argon
export function setupArgon(state: Object): Object {
    state.app.context.setDefaultReferenceFrame(state.app.contextLocalOriginEastUpSouth)
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

// Store and fetch data from local storage
// Based on wether a value was passed or not
function cache(key: string, value: ?Object): Object | bool {
    // TODO try/catch for JSON parsing
    if (typeof value === 'undefined') {
        const data: ?string = localStorage.getItem(key)
        return data ? JSON.parse(data) : false
    }

    localStorage.setItem(key, JSON.stringify(value))
    return true
}

// Store location data in local storage
export function cacheLocationData(json: Object) {
    cache('livingarchives/location-data', json)
}

// Fetch the location data from our API
export function fetchLocationData(callback: Function) {
    const cached: Object | bool = cache('livingarchives/location-data')

    if (cached === false) {
        fetch('https://api.livingarchives.org/locations')
            .then(res => res.json())
            .then(json => {
                cache('livingarchives/location-data', json)
                callback(json)
            })
            .catch(err => console.log(err))
    } else {
        callback(cached)
    }
}
