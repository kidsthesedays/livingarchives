import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import App from '../components/app'
import Guide from '../components/guide'

// Before
function before(state) {
    return done => {
        unmountComponentAtNode(state.reactMountNode)
        state.argonMountNode.style.display = 'none'
        state.documentRootNode.style.background = 'rgba(255, 255, 255, 0.8)'
        done()
    }
}

// Guide route
function route(state) {
    return () => {
        console.log('Guide:', state)

        render(
            <App state={state}>
                <Guide />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const guide = {
    urls: ['/*'],
    route,
    hooks: state => ({ before: before(state) })
}
