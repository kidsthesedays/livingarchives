// @flow

import 'whatwg-fetch'
import {
    guid,
    sendStatistic
} from './utilities'

// TODO check for errors when parsing JSON
// Store and fetch data from local storage
// Based on wether a value was passed or not
function cache(key: string, value: ?Object): Object {
    const data: ?string = localStorage.getItem('lva-cache')

    if (typeof value === 'undefined') {
        if (data) {
            const json: Object = JSON.parse(data)
            return json.hasOwnProperty(key) ? json[key] : {}
        }

        return {}
    }

    if (data) {
        const json: Object = JSON.parse(data)
        json[key] = value
        localStorage.setItem('lva-cache', JSON.stringify(json))
    } else {
        const json: Object = { [key]: value }
        localStorage.setItem('lva-cache', JSON.stringify(json))
    }

    return {}
}

// Fetch the location data from our API
export function fetchLocationData(callback: Function) {
    const cached: Object = cache('locationData')

    if (!cached.hasOwnProperty('locations')) {
        fetch('https://api.livingarchives.org/locations')
            .then(res => res.json())
            .then(json => {
                cache('locationData', json)
                callback(json)
            })
            .catch(err => console.log(err))
    } else {
        callback(cached)
    }
}

// Fetch user data from the cache, create a new one otherwise
export function fetchUserData(callback: Function) {
    const cached: Object = cache('userData')

    if (!cached.hasOwnProperty('id')) {
        fetchLocationData(json => {
            const userData: Object = {
                id: guid(window),
                hasStarted: false,
                currentSound: {
                    id: 0,
                    position: null
                },
                locations: json.locations.reduce((a, n) => {
                    a[`location_${n.id}`] = {
                        id: n.id,
                        unlocked: false,
                        visited: false
                    }
                    return a
                }, {})
            }

            cache('userData', userData)
            callback(userData)
        })
    } else {
        callback(cached)
    }
}

// TODO should we create a new object (copy) instead of mutating the current one?
export function locationVisited(id: number) {
    const userData: Object = cache('userData')

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

export function locationUnlocked(id: number) {
    const userData: Object = cache('userData')

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

export function userStartedTour() {
    const userData: Object = cache('userData')

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
