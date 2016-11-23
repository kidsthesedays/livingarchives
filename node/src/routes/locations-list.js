// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationsList from '../components/locations-list'
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

// Locations list route
function route(state: Object): Function {
    return () => {
        console.log('Locations list:', state)

        const { router } = state

        const goToMap = () => router.navigate('https://alberta.livingarchives.org/map', true)
        const mapIcon = () => (
            <button type='button' className='switch-to-map' onClick={goToMap}>Map</button>
        )

        render(
            <App state={state}>
                <Navigation
                    backURL='https://alberta.livingarchives.org'
                    right={mapIcon}
                    title='All locations' />
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
