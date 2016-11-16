// @flow
export function beforeLocationsMap(state: Object): Function {
    return (done: Function) => {
        console.log(state)
        done()
    }
}

export function afterLocationsMap(state: Object): Function {
    return () => {
        console.log(state)
    }
}

// When you visit the map of all points
export function locationsMap(state: Object): Function {
    // Enclosing function that receives route params
    return () => {
        console.log('list map state:', state)
        console.log('Show map for all points')
    }
}
