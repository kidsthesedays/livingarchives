// @flow

// When you visit the map of all points
export function locations(state: Object) {
    // Enclosing function that receives route params
    return () => {
        console.log('list map state:', state)
        console.log('Show map for all points')
    }
}
