// @flow
export function beforeLocationsList(state: Object): Function {
    return () => {
        console.log(state)
    }
}

export function afterLocationsList(state: Object): Function {
    return () => {
        console.log(state)
    }
}

// List of all points
export function locationsList(state: Object): Function {
    // Enclosing function invoked by the routing library
    return () => {
        console.log('list state:', state)
        console.log('list all points')
    }
}
