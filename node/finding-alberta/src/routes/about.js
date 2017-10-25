import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import App from '../components/app'
import Navigation from '../components/navigation'
import About from '../components/about'

// Before
function before(state) {
    return done => {
        unmountComponentAtNode(state.reactMountNode)
        state.reactMountNode.style.background = '#444444'
        done()
    }
}

// Guide route
function route(state) {
    return () => {
        // DEBUG
        // console.log('About:', state)
        
        render(
            <App state={state}>
                <Navigation backUrl='/locations' title='About' />
                <About />
            </App>,
            state.reactMountNode
        )
    }
}

// Export the route handlers
export const about = {
    urls: ['/about'],
    route,
    hooks: state => ({ before: before(state) })
}

