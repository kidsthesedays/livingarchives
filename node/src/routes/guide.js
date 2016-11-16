// @flow

// Show the guide
export function guide(state: Object) {
    // Enclosing function invoked by the routing library
    return () => {
        console.log('guide state:', state)
        console.log('show the guide')
    }
}

