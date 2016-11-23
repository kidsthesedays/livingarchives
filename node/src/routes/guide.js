// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import App from '../components/app'
import Guide from '../components/guide'

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

// Guide route
function route(state: Object): Function {
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
export const guide: Object = {
    urls: ['/*'],
    route,
    hooks: (state: Object) => ({ before: before(state), after: after(state) })
}
