// @flow

// When you visit the map of a sinle point of interest
export function pointMap(state: Object) {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('map state:', state)
        console.log('Show map for a point', params)
    }
}
