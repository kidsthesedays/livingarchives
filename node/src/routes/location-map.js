// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import {
    setupLocationData,
    setupUserData
} from '../utilities'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationMap from '../components/location-map'

// Before
function before(state: Object): Function {
    return (done: Function) => {
        unmountComponentAtNode(state.reactMountNode)
        state.argonMountNode.style.display = 'none'
        state.documentRootNode.style.background = 'white'
        // Setup location data then the user data
        setupLocationData(state, () => setupUserData(state, done))
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
        console.log('Location map:', state)

        const { id } = params

        // NOTE: weak equality check due to strings
        const location = state.locations.filter(loc => loc.meta.id == id).reduce((_, l) => l, {})

        // TODO check if we didnt find a location?

        render(
            <App state={state}>
                <Navigation
                    backUrl={state.prevRoute || '/locations'}
                    distance={true}
                    location={location}
                    title='Location map' />
                <LocationMap
                    location={location} />
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
