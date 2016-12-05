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
import ErrorView from '../components/error-view'

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

        const goHome = () => state.navigate('/locations')
        const goHomeIcon = () => (
            <button type='button' className='go-home' onClick={goHome}>
                <i className='icon ion-ios-home'></i>
            </button>
        )

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

        const info = () => (
            <div>
                <h2>Info</h2>
                <p>Här får vi fylla på med lite vettig info osv sen.</p>
            </div>
        )

        render(
            <App state={state}>
                <Navigation
                    backUrl={state.prevRoute || '/locations'}
                    distance={true}
                    location={location}
                    info={true}
                    renderInfo={info}
                    title={`Location ${location.meta.position}`} />
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
