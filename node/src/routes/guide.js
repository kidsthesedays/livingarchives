// @flow

import React from 'react'
import { render } from 'react-dom'
import Guide from '../components/guide'

export function beforeGuide(state: Object): Function {
    return (done: Function) => {
        console.log('Before guide:', state)
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
        render(<Guide />, state.reactMountNode)
    }
}

