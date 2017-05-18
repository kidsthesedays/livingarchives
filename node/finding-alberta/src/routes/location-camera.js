import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import App from '../components/app'
import Navigation from '../components/navigation'
import LocationCamera from '../components/location-camera'
import ErrorView from '../components/error-view'
import {
    setupLocationData,
    setupUserData,
    userHasVisitedLocation
} from '../utilities'

// Before
function before(state) {
    return done => {
        unmountComponentAtNode(state.reactMountNode)
        state.argonMountNode.style.display = 'block'
        state.documentRootNode.style.background = 'transparent'
        // Setup location data then the user data
        setupLocationData(state, () => setupUserData(state, done))
    }
}

// Location camera route
function route(state) {
    return params => {
        console.log('Location camera', state, params)

        const { id } = params
        
        // NOTE: weak equality check due to strings
        const location = state.locations
            .filter(loc => loc.meta.id == id)
            .reduce((_, l) => l, {})

        const goHome = () => state.navigate('/locations')
        const goHomeIcon = () => (
            <button type='button' className='go-home' onClick={goHome}>
                <i className='icon ion-ios-home'></i>
            </button>
        )

        if (!location.hasOwnProperty('meta')) {
            // White transparent background 
            state.documentRootNode.style.background = 'rgba(255, 255, 255, 0.9)'
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

        // TODO fix  (set to !visited)
        if (visited == 'abc') {
            // White transparent background 
            state.documentRootNode.style.background = 'rgba(255, 255, 255, 0.9)'
            return render(
                <App state={state}>
                    <Navigation
                        backUrl={`/locations/${id}/map`}
                        title={`Location ${location.meta.position}`} />
                    <ErrorView msg='You need to visit the location first!' />
                </App>,
                state.reactMountNode
            )
        }

        const info = () => (
            <div>
                <h2>Info</h2>
                <p>Informationsbeskrivning.</p>
            </div>
        )

        render(
            <App state={state}>
                <Navigation
                    backUrl={`/locations/${id}/map`}
                    distance={true}
                    location={location}
                    renderInfo={info}
                    info={true}
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
    hooks: state => ({ before: before(state) })
}
