// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import Location from '../components/location'

export function beforeLocation(state: Object): Function {
    return (done: Function) => {
        console.log('Before location:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

export function afterLocation(state: Object): Function {
    return () => {
        console.log('After location:', state)
    }
}

// When you visit a single point of interest
export function location(state: Object): Function {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('Location:', state)
        render(<Location />, state.reactMountNode)
    }
}

