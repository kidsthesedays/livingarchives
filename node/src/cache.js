// @flow

import 'whatwg-fetch'
import { guid } from './utilities'

// TODO check for errors when parsing JSON
// Store and fetch data from local storage
// Based on wether a value was passed or not
function cache(key: string, value: ?Object): Object | bool {
    const data: ?string = localStorage.getItem('lva-cache')

    if (typeof value === 'undefined') {
        if (data) {
            const json: Object = JSON.parse(data)
            return json.hasOwnProperty(key) ? json[key] : false
        }

        return false
    }

    if (data) {
        const json: Object = JSON.parse(data)
        json[key] = value
        localStorage.setItem('lva-cache', JSON.stringify(json))
    } else {
        const json: Object = { [key]: value }
        localStorage.setItem('lva-cache', JSON.stringify(json))
    }

    return true
}

// Fetch the location data from our API
export function fetchLocationData(callback: Function) {
    const cached: Object | bool = cache('locationData')

    if (cached === false) {
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

export function fetchUserData(callback: Function) {
    const cached: Object | bool = cache('userData')

    if (cached === false) {
        fetchLocationData(json => {
            const userData: Object = {
                id: guid(window),
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

export function locationVisited(id: number) {
    const userData: Object | bool = cache('userData')

    console.log('cached?', userData)
    if (userData === false) {
        return false
    }

    // const newUserData = Object.assign(userData, {
    //     locations: Object.assign(userData.locations, {
    //         Object.assign(userData.locations[`location_${id}`], {
    //             visited: true
    //         })
    //     })
    // })

    userData.locations[`location_${id}`].visited = true

    // console.log(newUserData)

    console.log(userData)
    cache('userData', userData)
}
