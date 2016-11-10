// @flow

// List of all points
export function list(state: Object) {
    // Enclosing function invoked by the routing library
    return () => {
        console.log('list state:', state)
        console.log('list all points')
    }
}
