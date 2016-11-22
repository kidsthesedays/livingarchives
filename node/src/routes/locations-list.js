// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationsList from '../components/locations-list'

// Before
function before(state: Object): Function {
    return (done: Function) => {
        unmountComponentAtNode(state.reactMountNode)
        state.argonMountNode.style.display = 'none'
        done()
    }
}

// After
function after(): Function {
    return () => {
    }
}

// Locations list route
function route(state: Object): Function {
    return () => {
        console.log('Locations list:', state)
        render(
            <App state={state}>
                <Navigation
                    backURL='https://alberta.livingarchives.org'
                    title='Locations' />
                <LocationsList />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const locationsList = {
    urls: ['/locations'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
