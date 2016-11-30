// @flow

import React from 'react'

import Distance from './distance'

const sortByPosition: Function = (a, b): number => a.meta.position - b.meta.position
const renderDistance: Object = d => <p className='distance'>{d}</p>

const Location: Function = ({ location, navigate, userData, userPosition, renderDistance }: Object): Object => {

    const backgroundStyle = {
        backgroundImage: `url(/static/location_${location.meta.id}.png)`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%'
    }

    const locationCache = userData.locations[`location_${location.meta.id}`]
    const unlocked = locationCache.visited && locationCache.unlocked

    const title = unlocked ? location.meta.name : `Location ${location.meta.position}`

    return (
        <div
            onClick={navigate(location.meta.id)}
            style={backgroundStyle}
            className='locations-list-item-outer'>
            <div className='locations-list-item'>

                <p className='title'>{title}</p>
                <p className='adress'>{location.meta.adress}</p>
                <div className='bottom'>
                    <Distance
                        userPosition={userPosition}
                        location={location}
                        render={renderDistance} />
                    <div className='visited'>
                        {unlocked
                            ? <i className='ion-ios-checkmark'></i>
                            : ''}
                    </div>
                </div>
                <div className='arrow'>
                    <i className='icon ion-ios-arrow-right'></i>
                </div>
            </div>
        </div>
    )
}

const LocationsList: Function = ({ state, userPosition }: Object): Object => {

    const navigate: Function = id => () => state.navigate(`/locations/${id}/map`)

    const locationComponents = state.locations.sort(sortByPosition).map((location, i) => (
        <Location
            key={i}
            location={location}
            navigate={navigate}
            userData={state.userData}
            userPosition={userPosition}
            renderDistance={renderDistance} />
    ))

    return (
        <div className='locations-list'>{locationComponents}</div>
    )
}

export default LocationsList
