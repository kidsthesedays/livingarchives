// @flow

// TODO hide/show some element?
export function notFound(state: Object) {

    return () => {
        console.log('Page not found state:', state)
        console.log('404')
    }
}
