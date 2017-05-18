import 'whatwg-fetch'
import { guid, sendStatistic } from './utilities'

// Parse json more safely
function parseJSON(json) {
    try {
        return JSON.parse(json)
    } catch (e) {
        console.log('Unable to parse JSON', e.message)
        return {}
    }
}

// Store and fetch data from local storage
// Based on wether a value was passed or not
function cache(key, value) {
    const data = localStorage.getItem('lva-cache')

    if (typeof value === 'undefined') {
        if (data) {
            const json: Object = parseJSON(data)
            return json.hasOwnProperty(key) ? json[key] : {}
        }

        return {}
    }

    if (data) {
        const json = parseJSON(data)
        json[key] = value
        localStorage.setItem('lva-cache', JSON.stringify(json))
    } else {
        const json = { [key]: value }
        localStorage.setItem('lva-cache', JSON.stringify(json))
    }

    return {}
}

// Fetch the location data from our API
export function fetchLocationData(callback) {
    const cached = cache('locationData')
    // OLD: const url = 'https://api.livingarchives.org/locations'
    const url = '/locations'

    if (!cached.hasOwnProperty('locations')) {
        fetch(url, { credentials: 'include' })
            .then(res => res.json())
            .then(json => {
                cache('locationData', json)
                callback(json)
            })
            .catch(err => {
                console.log(err)
                callback({ locations: [], content: [] })
            })
    } else {
        callback(cached)
    }
}

// Fetch user data from the cache, create a new one otherwise
export function fetchUserData(callback) {
    const cached = cache('userData')

    if (cached.hasOwnProperty('id')) {
        return callback(cached)
    }

    return fetchLocationData(json => {
        const locations = json.locations.reduce((a, n) => {
            a[`location_${n.id}`] = {
                id: n.id,
                unlocked: false,
                visited: false,
                listened: false,
                viewed: false
            }

            return a
        }, {})

        const userData = {
            id: guid(window),
            hasStarted: false,
            currentSound: { id: 0, position: null },
            locations: locations
        }

        cache('userData', userData)
        callback(userData)
    })
}

// TODO should we create a new object (copy) instead of mutating the current one?
export function locationVisited(id) {
    const userData = cache('userData')

    if (!userData.hasOwnProperty('id')) {
        return false
    }

    if (userData.hasOwnProperty('locations')
        && userData.locations.hasOwnProperty(`location_${id}`)
        && !userData.locations[`location_${id}`].visited) {
        // Only update cache and send statistics if the location hasnt been visited 
        userData.locations[`location_${id}`].visited = true
        cache('userData', userData)
        sendStatistic(
            userData.id,
            id,
            'visited'
        )
    }
}

// Set current sound ID + elapsed time
export function setCurrentSound(id, position) {
    const userData = cache('userData')

    if (!userData.hasOwnProperty('id')) {
        return false
    }

    if (userData.hasOwnProperty('currentSound')
        && userData.hasOwnProperty('locations')
        && userData.locations.hasOwnProperty(`location_${id}`)) {

        // Update current sound
        userData.currentSound.id = id
        userData.currentSound.position = position

        if (!userData.locations[`location_${id}`].listened) {
            // Only update cache and send statistics if the location-sound hasnt been listened to
            userData.locations[`location_${id}`].listened = true
            sendStatistic(
                userData.id,
                id,
                'listened'
            )
        }

        cache('userData', userData)
    }
}

// Assign the location as unlocked for the current user
export function locationUnlocked(id) {
    const userData = cache('userData')

    if (!userData.hasOwnProperty('id')) {
        return false
    }

    if (userData.hasOwnProperty('locations')
        && userData.locations.hasOwnProperty(`location_${id}`)
        && !userData.locations[`location_${id}`].unlocked) {
        // Only update cache and send statistics if the location hasnt been unlocked
        userData.locations[`location_${id}`].unlocked = true
        cache('userData', userData)
        sendStatistic(
            userData.id,
            id,
            'unlocked'
        )
    }
}

// Assign the video as being seen by the user
export function videoViewed(id) {
    const userData = cache('userData')

    if (!userData.hasOwnProperty('id')) {
        return false
    }

    if (userData.hasOwnProperty('locations')
        && userData.locations.hasOwnProperty(`location_${id}`)
        && !userData.locations[`location_${id}`].viewed) {
        // Only update cache and send statistics if the video hasnt been viewed
        userData.locations[`location_${id}`].viewed = true
        cache('userData', userData)
        sendStatistic(
            userData.id,
            id,
            'viewed'
        )
    }
}

// User has started the tour (i.e using the web app)
export function userStartedTour() {
    const userData = cache('userData')

    if (!userData.hasOwnProperty('id')) {
        return false
    }

    if (userData.hasOwnProperty('hasStarted') && !userData.hasStarted) {
        userData.hasStarted = true
        cache('userData', userData)
        sendStatistic(
            userData.id,
            0,
            'started'
        )
    }
}
