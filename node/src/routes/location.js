// @flow

// When you visit a single point of interest
export function location(state: Object) {
    // Enclosing function that receives route params
    return (params: Object) => {
        console.log('point state:', state)
        console.log('Visiting the points:', params)
    }
}

