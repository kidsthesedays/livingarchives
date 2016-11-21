// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import LocationCamera from '../components/location-camera'

export function beforeLocationCamera(state: Object): Function {
    return (done: Function) => {
        console.log('Before location camera:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

export function afterLocationCamera(state: Object): Function {
    return () => {
        console.log('After location camera:', state)
    }
}

// When you visit the map of a sinle point of interest
export function locationCamera(state: Object): Function {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('Location camera', state, params)
        render(<LocationCamera />, state.reactMountNode)
    }
}

