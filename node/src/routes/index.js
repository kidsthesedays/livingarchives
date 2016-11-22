// @flow

// Import all route handlers
import { guide } from './guide'
import { locationsList } from './locations-list'
import { locationsMap } from './locations-map'
import { location } from './location'
import { locationMap } from './location-map'
import { locationCamera } from './location-camera'

// NOTE: the order of these _do_ matter
export const routes: Array<Object> = [
    locationMap,
    locationCamera,
    location,
    locationsMap,
    locationsList,
    guide
]
