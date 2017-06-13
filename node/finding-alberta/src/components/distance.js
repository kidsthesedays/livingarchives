import React from 'react'
import { calculateDistance, humanReadableDistance } from '../utils'

const Distance = ({ location, userPosition, render }) => {
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

    const locationCoords = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    const distance = humanReadableDistance(
        calculateDistance(
            locationCoords,
            userPosition
        )
    )

    const component = render(distance)

    return <div>{component}</div>
}

export default Distance
