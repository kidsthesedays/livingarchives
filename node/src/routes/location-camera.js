// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationCamera from '../components/location-camera'
import { setupLocationData } from '../utilities'

// Before
function before(state: Object): Function {
    return (done: Function) => {
        unmountComponentAtNode(state.reactMountNode)
        setupLocationData(state, done)
    }
}

// After
function after(): Function {
    return () => {
    }
}

// Location camera route
function route(state: Object): Function {
    return (params: Object) => {
        console.log('Location camera', state, params)

        const { id } = params
        
        // NOTE: weak equality check due to strings
        const location = state.locations.filter(loc => loc.meta.id == id).reduce((_, l) => l, {})

        // TODO check if we didnt find a location?

        render(
            <App state={state}>
                <Navigation
                    backURL={`https://alberta.livingarchives.org/locations/${id}/map`}
                    title={`Location ${location.meta.position}`} />
                <LocationCamera
                    location={location} />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const locationCamera = {
    urls: ['/locations/:id/camera'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
