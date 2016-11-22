// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationsMap from '../components/locations-map'

// Before
function before(state: Object): Function {
    return (done: Function) => {
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

// After
function after(): Function {
    return () => {
    }
}

// Locations map route
function route(state: Object): Function {
    return () => {
        console.log('Locations Map:', state)
        render(
            <App state={state}>
                <Navigation
                    backURL='https://alberta.livingarchives.org'
                    title='Locations' />
                <LocationsMap />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const locationsMap = {
    urls: ['/map'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
