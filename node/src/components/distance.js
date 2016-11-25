// @flow

import React from 'react'

import {
    calculateDistance,
    humanReadableDistance
} from '../utilities'

const Distance: Function = ({ location, userPosition, render }: Object) => {
    if (userPosition === null) {
        return null
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
