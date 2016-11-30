// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import LocationsMap from '../components/locations-map'
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

// Locations map route
function route(state: Object): Function {
    return () => {
        console.log('Locations Map:', state)

        const goToList = () => state.navigate('/locations')
        const listIcon = () => (
            <button type='button' className='switch-to-list' onClick={goToList}>
                <i className='icon ion-ios-list-outline'></i>
            </button>
        )

        render(
            <App state={state}>
                <Navigation
                    backUrl='/'
                    renderRight={listIcon}
                    title='All locations' />
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
