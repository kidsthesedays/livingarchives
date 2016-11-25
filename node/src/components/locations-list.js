// @flow

import React from 'react'

import Distance from './distance'

const sortByPosition: Function = (a, b): number => a.meta.position - b.meta.position

const renderLocation: Function = (navigate, userPosition) => (location, i) => {

    const renderDistance: Object = d => <p className='distance'>{d}</p>

    return (
        <div
            key={i}
            onClick={navigate(location.meta.id)}
            className='locations-list-item'>
            <p className='title'>Location {location.meta.position}</p>
            <p className='adress'>{location.meta.adress}</p>
            <Distance
                userPosition={userPosition}
                location={location}
                render={renderDistance} />
            <div className='arrow'>&gt;</div>
        </div>
    )
}

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
