// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import Location from '../components/location'

// Before
function before(state: Object): Function {
    return (done: Function) => {
        console.log('Before location:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
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

        render(
            <App state={state}>
                <Navigation
                    backURL={`https://alberta.livingarchives.org/locations/${id}/camera`}
                    title='Location' />
                <Location />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const location = {
    urls: ['/locations/:id', '/locations/:id/*'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
