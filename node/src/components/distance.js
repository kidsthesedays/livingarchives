// @flow

import React from 'react'

import {
    calculateDistance,
    humanReadableDistance
} from '../utilities'

const Distance: Function = ({ location, userPosition, render }: Object) => {
    // Render a distance of 0 meters if no user position is available
    if (userPosition === null) {
        // const temp: Object = render(humanReadableDistance(0))
        // return <div>{temp}</div>
        return (
            <div className='spinner'>
                <div className='bounce1'></div>
                <div className='bounce2'></div>
                <div className='bounce3'></div>
            </div>
        )
    }

    const locationCoords: Object = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    const distance: string = humanReadableDistance(
        calculateDistance(
            locationCoords,
            userPosition
        )
    )

    const component: Object = render(distance)

    return <div>{component}</div>
}

export default Distance
