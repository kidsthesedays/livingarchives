// @flow
export function beforeGuide(state: Object): Function {
    return (done: Function) => {
        console.log(state)
        done()
    }
}

export function afterGuide(state: Object): Function {
    return () => {
        console.log(state)
    }
}

// Show the guide
export function guide(state: Object): Function {
    // Enclosing function invoked by the routing library
    return () => {
        console.log('guide state:', state)
        console.log('show the guide')
    }
}

