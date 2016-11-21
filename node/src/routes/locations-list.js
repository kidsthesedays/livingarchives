// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'
import LocationsList from '../components/locations-list'

export function beforeLocationsList(state: Object): Function {
    return (done: Function) => {
        console.log('Before locations list:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

export function afterLocationsList(state: Object): Function {
    return () => {
        console.log('After locations list:', state)
    }
}

// List of all points
export function locationsList(state: Object): Function {
    // Enclosing function invoked by the routing library
    return () => {
        console.log('Locations list:', state)
        render(<LocationsList />, state.reactMountNode)
    }
}
