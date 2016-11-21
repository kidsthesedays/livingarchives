// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import LocationMap from '../components/location-map'

export function beforeLocationMap(state: Object): Function {
    return (done: Function) => {
        console.log('Before location map:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

export function afterLocationMap(state: Object): Function {
    return () => {
        console.log('After location map:', state)
    }
}

// When you visit the map of a sinle point of interest
export function locationMap(state: Object): Function {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('Location map:', state, params)
        render(<LocationMap />, state.reactMountNode)
    }
}
