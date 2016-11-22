// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationMap from '../components/location-map'

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

// Location map route
function route(state: Object): Function {
    return (params: Object) => {
        console.log('Location map:', state, params)
        render(
            <App state={state}>
                <Navigation
                    backURL='https://alberta.livingarchives.org/locations'
                    title='Location map' />
                <LocationMap />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const locationMap = {
    urls: ['/locations/:id/map'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
