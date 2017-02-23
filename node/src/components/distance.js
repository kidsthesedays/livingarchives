// @flow
import React from 'react'
import { calculateDistance, humanReadableDistance } from '../utilities'

const Distance: Function = ({ location, userPosition, render }: Object) => {
    // Show a loading icon
    if (userPosition === null) {
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
