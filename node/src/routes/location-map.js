// @flow
export function beforeLocationMap(state: Object): Function {
    return (done: Function) => {
        console.log(state)
        done()
    }
}

export function afterLocationMap(state: Object): Function {
    return () => {
        console.log(state)
    }
}

// When you visit the map of a sinle point of interest
export function locationMap(state: Object): Function {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('map state:', state)
        console.log('Show map for a point', params)
    }
}
