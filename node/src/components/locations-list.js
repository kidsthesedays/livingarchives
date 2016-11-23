// @flow

import React, { Component } from 'react'
import {
    humanReadableDistance,
    getDistance
} from '../utilities'

const sortByPosition: Function = (a, b): number => a.meta.position - b.meta.position

class Distance extends Component {

    state: Object

    constructor(props) {
        super(props)
        this.state = { distance: 0 }
    }

    render() {
        const { location, userPosition } = this.props

        if (userPosition === null) {
            return (
                <p className='distance'>Distance: ?</p>
            )
        }

        const locationCoords = {
            lat: location.meta.latitude,
            lng: location.meta.longitude
        }

        const distance = humanReadableDistance(getDistance(locationCoords, userPosition))

        return (
            <p className='distance'>{distance}</p>
        )
    }
}

const renderLocation: Function = (navigate, userPosition) => (location, i) => (
    <div
        key={i}
        onClick={navigate(location.meta.id)}
        className='locations-list-item'>
        <p className='title'>Location {location.meta.position}</p>
        <p className='adress'>{location.meta.adress}</p>
        <Distance
            userPosition={userPosition}
            location={location} />
        <div className='arrow'>&gt;</div>
    </div>
)

const LocationsList: Function = ({ state, userPosition }: Object): Object => {
    const { locations, router } = state

    const navigate: Function = id => () => {
        const url: string = `https://alberta.livingarchives.org/locations/${id}/map`
        router.navigate(url, true)
    }

    return (
        <div className='locations-list'>
            {locations.sort(sortByPosition).map(renderLocation(navigate, userPosition))}
        </div>
    )
}

export default LocationsList
