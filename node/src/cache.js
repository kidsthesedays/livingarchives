// @flow

import 'whatwg-fetch'

// Store and fetch data from local storage
// Based on wether a value was passed or not
function cache(key: string, value: ?Object): Object | bool {
    const data: ?string = localStorage.getItem('lva-cache')

    if (typeof value === 'undefined') {
        if (data) {
            // TODO try/catch for JSON parsing
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
