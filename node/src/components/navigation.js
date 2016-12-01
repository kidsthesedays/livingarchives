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

    let left: Object = <div></div>
    let right: Object = <div></div>
    let center: Object = <h2>{title || ''}</h2>

    if (renderLeft) {
        left = renderLeft()
    } else if (backUrl) {
        left = (
            <div onClick={goBack} className='back-button'>
                <i className='icon ion-ios-arrow-left'></i>
            </div>
        )
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
            <div className='left'>{left}</div>
            <div className='center'>{center}</div>
            <div className='right'>{right}</div>
        </div>
    )
}

export default Navigation
