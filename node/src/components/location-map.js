// @flow

import React, { Component } from 'react'

import { mapStyles } from './map-style'

import {
    withGoogleMap,
    GoogleMap,
    Circle,
    Marker
} from 'react-google-maps'

import { calculateDistance } from '../utilities'
import { locationVisited } from '../cache'

const Map: Function = withGoogleMap(({ location }: Object) => {
    const center: Object = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    // For custom icons add the attribute "icon=''" with a source url to a png

    return (
        <GoogleMap
            defaultZoom={15}
            defaultCenter={center}
            defaultOptions={{
                styles: mapStyles,
                mapTypeControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
                scaleControl: false
            }}>

            <Circle
                center={center}
                radius={80}
                options={{
                    fillColor: 'red',
                    fillOpacity: 0.2,
                    strokeColor: 'red',
                    strokeOpacity: 0.5,
                    strokeWidth: 1
                }} />
            <Marker
                position={center}
                key={location.meta.name} />
        </GoogleMap>
    )
})


class LocationMap extends Component {
    render() {
        const { state, location, userPosition } = this.props

        const handleClick = () => {
            locationVisited(location.meta.id)
            state.router.navigate(`https://alberta.livingarchives.org/locations/${location.meta.id}/camera`, true)
        }

        const div = <div style={{ height: '100%' }} />

        const hasVisitedLocation = state.userData.locations[`location_${location.meta.id}`].visited

        const activeButton = (
            <button 
                className='location-map-button'
                onClick={handleClick}
                type='button'>
                Go to AR mode
            </button>
        )

        const disabledButton = (
            <button 
                className='location-map-button disabled'
                type='button'>
                Go to AR mode
            </button>
        )


        if (userPosition === null) {
            return (
                <div className='location-map'>
                    <Map
                        location={location}
                        containerElement={div}
                        mapElement={div} />

                    {disabledButton}
                </div>
            )
        }

        const distance = calculateDistance(
            userPosition,
            {
                lat: location.meta.latitude,
                lng: location.meta.longitude
            }
        )

        // TODO fix distance
        return (
            <div className='location-map'>
                <Map
                    location={location}
                    containerElement={div}
                    mapElement={div} />

                {hasVisitedLocation
                    ? activeButton
                    : distance < 1000 ? activeButton : disabledButton }
            </div>
        )
    }
}

export default LocationMap
