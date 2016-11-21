// @flow

import 'whatwg-fetch'

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
