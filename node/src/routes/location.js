// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import Location from '../components/location'
import { setupLocationData } from '../utilities'

// Before
function before(state: Object): Function {
    return (done: Function) => {
        unmountComponentAtNode(state.reactMountNode)
        state.argonMountNode.style.display = 'none'
        setupLocationData(state, done)
    }
}

// After
function after(): Function {
    return () => {
    }
}

// Location route
function route(state: Object): Function {
    return (params: Object) => {
        console.log('Location:', state, params)

        const { id } = params
        
        // NOTE: weak equality check due to strings
        const location = state.locations.filter(loc => loc.meta.id == id).reduce((_, l) => l, {})

        // TODO check if we didnt find a location?

        render(
            <App state={state}>
                <Navigation
                    backURL={`https://alberta.livingarchives.org/locations/${id}/camera`} />
                <Location
                    location={location} />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const location = {
    urls: ['/locations/:id', '/locations/:id/story', '/locations/:id/*'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
