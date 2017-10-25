// Import all route handlers
import { start } from './start'
import { guide } from './guide'
import { about } from './about'
import { locationsList } from './locations-list'
import { locationsMap } from './locations-map'
import { locationMap } from './location-map'
import { locationCamera } from './location-camera'

// NOTE the order of these DO matter
export const routes = [
    locationMap,
    locationCamera,
    locationsMap,
    locationsList,
    about,
    guide,
    start
]
