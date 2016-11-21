// @flow

import React from 'react'
import {
    render,
    unmountComponentAtNode
} from 'react-dom'

import Guide from '../components/guide'

export function beforeGuide(state: Object): Function {
    return (done: Function) => {
        console.log('Before guide:', state)
        unmountComponentAtNode(state.reactMountNode)
        done()
    }
}

export function afterGuide(state: Object): Function {
    return () => {
        console.log('After guide:', state)
    }
}

// Show the guide
export function guide(state: Object): Function {
    // Enclosing function invoked by the routing library
    return () => {
        console.log('Guide:', state)
        render(<Guide router={state.router} />, state.reactMountNode)
    }
}

