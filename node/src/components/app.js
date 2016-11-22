// @flow

import React, { Children, cloneElement } from 'react'

const App: Function = ({ state, children }): Object => {
    // Pass the 'state' prop to all of the children elements
    return (
        <div className='app'>
            {Children.map(children, c => cloneElement(c, { state }))}
        </div>
    )
}

export default App
