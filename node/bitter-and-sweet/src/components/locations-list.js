import React from 'react'
import Distance from './distance'
import { userHasVisitedLocation, userHasUnlockedLocation } from '../utils'

const sortByPosition = (a, b) => a.meta.position - b.meta.position
const renderDistance = d => <p className='distance'>{d}</p>

const Location = ({ location, navigate, state, userPosition, renderDistance }) => {
    const backgroundStyle = {
        backgroundImage: `url(/static/media/images/location_${location.meta.id}.png)`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    }

    const visited = userHasVisitedLocation(state, location.meta.id)
    const unlocked = userHasUnlockedLocation(state, location.meta.id)

    const title = visited && unlocked
        ? location.meta.name
        : `Location ${location.meta.position}`

    return (
        <div
            onClick={navigate(location.meta.id)}
            style={backgroundStyle}
            className='locations-list-item-outer'>
            <div className='locations-list-item'>

                <p className='title'>{title}</p>
                <p className='address'>{location.meta.address}</p>
                <div className='bottom'>
                    <div className='visited'>
                        {unlocked
                            ? <i className='ion-ios-checkmark'></i>
                            : ''}
                    </div>
                    <Distance
                        userPosition={userPosition}
                        location={location}
                        render={renderDistance} />
                </div>
                <div className='arrow'>
                    <i className='icon ion-ios-arrow-right'></i>
                </div>
            </div>
        </div>
    )
}

const LocationsList = ({ state, userPosition }) => {
    const navigate = id => () => state.navigate(`/locations/${id}/map`)

    const locationComponents = state.locations
        .sort(sortByPosition)
        .map((location, i) => (
            <Location
                key={i}
                location={location}
                navigate={navigate}
                state={state}
                userPosition={userPosition}
                renderDistance={renderDistance} />
        ))

    const cls = state.audio.active
        ? 'locations-list audio-bar'
        : 'locations-list'

    return <div className={cls}>{locationComponents}</div>
}

export default LocationsList
