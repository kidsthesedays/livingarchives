// @flow

import React from 'react'
import { humanReadableDistance } from '../utilities'

const sortByPosition: Function = (a, b): number => a.meta.position - b.meta.position

const renderLocation: Function = navigate => (location, i) => (
    <div
        key={i}
        onClick={navigate(location.meta.id)}
        className='locations-list-item'>
        <p className='title'>Location {location.meta.position}</p>
        <p className='adress'>{location.meta.adress}</p>
        <p className='distance'>{humanReadableDistance(Math.floor((Math.random() * 700) + 500))}</p>
        <div className='arrow'>&gt;</div>
    </div>
)

const LocationsList: Function = ({ state }: Object): Object => {
    const {
        locations,
        router
    } = state

    if (locations.length === 0) {
        return (
            <div className='loading'>Loading</div>
        )
    }

    const navigate: Function = id => () => {
        const url: string = `https://alberta.livingarchives.org/locations/${id}/map`
        router.navigate(url, true)
    }

    return (
        <div className='locations-list'>
            {locations.sort(sortByPosition).map(renderLocation(navigate))}
        </div>
    )
}

export default LocationsList
