// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationsList from '../components/locations-list'
import {
    setupLocationData,
    setupUserData
} from '../utilities'

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

// Locations list route
function route(state: Object): Function {
    return () => {
        console.log('Locations list:', state)

        const goToMap = () => state.navigate('/map')
        const mapIcon = () => (
            <button type='button' className='switch-to-map' onClick={goToMap}>
                <i className='icon ion-ios-location'></i>
            </button>
        )

        render(
            <App state={state}>
                <Navigation
                    backUrl={state.prevRoute || '/'}
                    renderRight={mapIcon}
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
