// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Navigation from '../components/navigation'
import Location from '../components/location'
import ErrorView from '../components/error-view'

import {
    setupLocationData,
    setupUserData,
    userHasVisitedLocation,
    userHasUnlockedLocation
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

// Location route
function route(state: Object): Function {
    return (params: Object) => {
        console.log('Location:', state, params)

        const { id } = params
        
        // NOTE: weak equality check due to strings
        const location = state.locations.filter(loc => loc.meta.id == id).reduce((_, l) => l, {})

        const goHome = () => state.navigate('/locations')
        const goHomeIcon = () => (
            <button type='button' className='go-home' onClick={goHome}>
                <i className='icon ion-ios-home'></i>
            </button>
        )


        // TODO check if we didnt find a location?
        if (!location.hasOwnProperty('meta')) {
            return render(
                <App state={state}>
                    <Navigation
                        renderRight={goHomeIcon}
                        backUrl='/locations'
                        title='Unknown location' />
                    <ErrorView msg='The location doesnt exist' />
                </App>,
                state.reactMountNode
            )
        }

        const visited = userHasVisitedLocation(state, location.meta.id)
        const unlocked = userHasUnlockedLocation(state, location.meta.id)

        if (!visited || !unlocked) {
            return render(
                <App state={state}>
                    <Navigation
                        renderRight={goHomeIcon}
                        title={`Location ${id}`}
                        backUrl={`/locations/${id}/camera`} />
                    <ErrorView msg='You need to visit and unlock the location!' />
                </App>,
                state.reactMountNode
            )
        }

        render(
            <App state={state}>
                <Navigation
                    renderRight={goHomeIcon}
                    title={`Location ${id}`}
                    backUrl={`/locations/${id}/camera`} />
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
