// @flow

import React from 'react'

import Distance from '../components/distance'

const Navigation: Function = (props: Object): Object => {

    const {
        state,
        title,
        renderLeft,
        renderRight,
        distance,
        location,
        backUrl,
        userPosition
    } = props

    const goBack: Function = () => {
        state.prevRoute = ''
        state.navigate(backUrl || '')
    }

    const renderDistance = d => <div className='distance'>{d}</div>

    let left: Object = <div className='left'></div>
    let right: Object = <div className='right'></div>

    if (renderLeft) {
        left = renderLeft()
    } else if (backUrl) {
        left = <div className='left' onClick={goBack}><p>&lt;</p></div>
    }

    if (renderRight) {
        right = renderRight() 
    } else if (distance) {
        right = (
            <Distance
                userPosition={userPosition}
                location={location}
                render={renderDistance} />
        )
    }

    return (
        <div className='navigation'>
            {left}
            <div className='center'>
                <p>{title || ''}</p>
            </div>
            {right}
        </div>
    )
}

export default Navigation
