// @flow
declare var google: Object

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

const Map: Function = withGoogleMap(({ location, userPosition }: Object) => {
    const center: Object = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    const userMarkerOpts = {
        clickable: false,
        cursor: 'pointer',
        draggable: false,
        flat: true,
        optimized: false,
        position: {
            lat: userPosition ? userPosition.lat : 0,
            lng: userPosition ? userPosition.lng : 0,
            enableHighAccuracy: true,
            maximumAge: 1000
        },
        title: 'Current location',
        zIndex: 2,
        icon: {
            url: '/static/gpsloc.png',
            size: new google.maps.Size(42, 42),
            scaledSize: new google.maps.Size(21, 21),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(8, 8)
        },
        key: 'User location'
    }

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

            <Marker {...userMarkerOpts} />

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
                label={String(location.meta.id)}
                key={location.meta.name} />
        </GoogleMap>
    )
})


class LocationMap extends Component {
    render() {
        const { state, location, userPosition } = this.props

        const handleClick = () => {
            locationVisited(location.meta.id)
            state.navigate(`/locations/${location.meta.id}/camera`)
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
                    userPosition={userPosition}
                    containerElement={div}
                    mapElement={div} />

                {hasVisitedLocation
                    ? activeButton
                    : distance < 100000 ? activeButton : disabledButton }
            </div>
        )
    }
}

export default LocationMap
