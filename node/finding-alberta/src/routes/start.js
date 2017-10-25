import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import App from '../components/app'
import Start from '../components/start'

// Before
function before(state) {
    return done => {
        unmountComponentAtNode(state.reactMountNode)
        state.reactMountNode.style.background = 'rgba(255, 255, 255, 0.8)'
        done()
    }
}

// Guide route
function route(state) {
    return () => {
        // DEBUG
        // console.log('Start:', state)
        
        // Pause panorama rendering
        // state.pausePanorama()

        render(
            <App state={state}>
                <Start />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const start = {
    urls: ['/*'],
    route,
    hooks: state => ({ before: before(state) })
}
