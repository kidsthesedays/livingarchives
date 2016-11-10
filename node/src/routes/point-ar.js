// @flow

// When you visit the map of a sinle point of interest
export function pointArMode(state: Object) {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('ar-mode state:', state)
        console.log('Show the AR mode for a point', params)
    }
}

