// @flow

// Import all route handlers
import { guide } from './guide'
import { locationsList } from './locations-list'
import { locationsMap } from './locations-map'
import { locationMap } from './location-map'
import { locationCamera } from './location-camera'

// NOTE: the order of these DO matter
export const routes: Array<Object> = [
    locationMap,
    locationCamera,
    locationsMap,
    locationsList,
    guide
]
