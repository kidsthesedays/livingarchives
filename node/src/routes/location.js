// @flow
export function beforeLocation(state: Object): Function {
    return () => {
        console.log(state)
    }
}

export function afterLocation(state: Object): Function {
    return () => {
        console.log(state)
    }
}

// When you visit a single point of interest
export function location(state: Object): Function {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('point state:', state)
        console.log('Visiting the points:', params)
    }
}

