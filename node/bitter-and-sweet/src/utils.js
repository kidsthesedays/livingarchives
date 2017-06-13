import 'whatwg-fetch'
import { fetchLocationData, fetchUserData } from './cache'

// Format seconds to 0:00:00 format
export function formatSeconds(seconds) {
    // Bitwise conversion
    const h = Math.floor(seconds / 3600) | 0
    const m = Math.floor(seconds / 60) | 0
    const s = Math.floor(seconds % 60) | 0

    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
}

// Format floating points
export function toFixed(value, precision = 0) {
    const p = Math.pow(10, precision)
    return Math.round(value * p) / p
}

export function generateHash(s) {
    let hash = 0
    let i
    let len
    let chr

    for (i = 0, len = s.length; i < len; i++) {
        chr = s.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
    }

    return hash
}

// Creates a GUID based on several different browser variables
// It wont be compliant with RFC4122 but hopefully good enough
export function guid(window) {
    const nav = window.navigator
    const screen = window.screen
    const s = [
        nav.mimeTypes.length,
        nav.userAgent.replace(/D+/g, ''),
        nav.plugins.length,
        screen.height || '',
        screen.width || '',
        screen.pixelDepth || ''
    ].join('')

    return generateHash(s)
}

// Limit amount of time between function calls to a function
export function throttle(fn, ms) {
    let lastCall = 0
    return function() {
        const now = Date.now()

        if (lastCall + ms < now) {
            lastCall = now
            return fn.apply(this, arguments)
        }
    }
}

// Format distance into a more readable format
export function humanReadableDistance(d) {
    // Kilometer
    if (d > 1000) {
        const km = d / 1000
        return `${km.toFixed(1)}km`
    }

    // Meter
    return `${Math.floor(d)}m`
}

// Fetch and setup location data for the cache from the API
export function setupLocationData(state, cb) {
    fetchLocationData(json => {
        // Only create locations if none exist
        if (!state.locations.length) {
            state.locations = json.locations.map(location => {
                //  filter out content based on location id
                const content = json.content
                    .filter(c => c.id === location.id)
                    .reduce((_, c) => c.html, '')

                return { initialized: false, meta: location, content: content }
            })
        }

        cb && cb(json)
    })
}

// Fetch and assign user data to the app state object
export function setupUserData(state, cb) {
    fetchUserData(userData => {
        state.userData = userData
        cb && cb(userData)
    })
}

// Calculate the rad of 'n'
export function rad(n) {
    return n * Math.PI / 180;
}

// Returns the distance between to lat/lng points
export function calculateDistance(p1, p2) {
    if (p1 === null || p2 === null) {
        return 0
    }

    // Earth’s mean radius in meter
    const R = 6378137
    const dLat = rad(p2.lat - p1.lat)
    const dLong = rad(p2.lng - p1.lng)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
}

// Convert angle to degrees
function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

// Calculate angle between two points (lat, lng)
export function calculateAngle(p1, p2) {
    const dLon = p2.lng - p1.lng
    const y = Math.sin(dLon) * Math.cos(p2.lat)
    const x = Math.cos(p1.lat) * Math.sin(p2.lat) - Math.sin(p1.lat) * Math.cos(p2.lat) * Math.cos(dLon)
    let brng = Math.atan2(y, x)
    brng = toDegrees(brng)
    brng = (brng + 360) % 360
    return brng
}

// Init options for fetching
export function prepare(method, body) {
    return {
        method,
        credentials: 'include',
        headers: new Headers({ 'Content-type': 'application/json' }),
        body: JSON.stringify(body)
    }
}

// Send some statistics to the server
export function sendStatistic(guid, location, type) {
    const url = 'https://api.livingarchives.org/statistics-fa'
    const data = { guid, type, location }
    const payload = prepare('POST', data)

    // TODO what should we do with the response and error?
    // TODO should a callback be invoked?
    return fetch(url, payload)
        .then(res => console.log(res))
        .catch(e => console.log(e))
}

// Check if user has a certain prop
export function checkUserDataProp(prop, state, id) {
    if (!state.hasOwnProperty('userData')
        || !state.userData.locations.hasOwnProperty(`location_${id}`)
        || !state.userData.locations[`location_${id}`][prop]) {
        return false
    }
    
    return true
}

// Check if a user has visited a location or not
export function userHasVisitedLocation(state, id) {
    return checkUserDataProp('visited', state, id)
}

// Check if a user has unlocked a location or not
export function userHasUnlockedLocation(state, id) {
    return checkUserDataProp('unlocked', state, id)
}

// Setup argon (included via a <script> tag)
export function setupArgon(state) {
    state.app = Argon.init()

    state.app.reality.request(Argon.resolveURL('/static/reality/panorama.html'))

    state.app.reality.connectEvent.addEventListener(session => {
        if (session.supportsProtocol('single.panorama')) {
            state.realitySession = session
        }
    })

    const showPanorama = () => {
        let ready = false
        let timeout = null

        const loadPanorama = panorama => {
            if (ready || 'realitySession' in state) {
                ready = true
                clearTimeout(timeout)
                state.realitySession.request('single.panorama.showPanorama', panorama)
            } else {
                console.log('Retrying to fetch panorama')
                timeout = setTimeout(() => loadPanorama(panorama), 500)
            }
        }

        return loadPanorama
    }

    const pausePanorama = () => {
        if ('realitySession' in state) {
            state.realitySession.request('single.panorama.pausePanorama')
        }
    }

    state.showPanorama = showPanorama()
    state.pausePanorama = pausePanorama
}
