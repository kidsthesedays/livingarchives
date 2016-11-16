// @flow
export function beforeLocationCamera(state: Object): Function {
    return () => {
        console.log(state)
    }
}

export function afterLocationCamera(state: Object): Function {
    return () => {
        console.log(state)
    }
}

// When you visit the map of a sinle point of interest
export function locationCamera(state: Object): Function {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('ar-mode state:', state)
        console.log('Show the AR mode for a point', params)
    }
}

