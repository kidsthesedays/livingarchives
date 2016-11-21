// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import LocationsMap from '../components/locations-map'

export function beforeLocationsMap(state: Object): Function {
    return (done: Function) => {
        console.log('Before locations map:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

export function afterLocationsMap(state: Object): Function {
    return () => {
        console.log('After locations map:', state)
    }
}

// When you visit the map of all points
export function locationsMap(state: Object): Function {
    // Enclosing function that receives route params
    return () => {
        console.log('Locations Map:', state)
        render(<LocationsMap />, state.reactMountNode)
    }
}
