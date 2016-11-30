// @flow
/* global google */

import React from 'react'

import { mapStyles } from './map-style'

import {
    withGoogleMap,
    GoogleMap,
    Marker
} from 'react-google-maps'

const renderMarker: Function = navigateToLocation => location => {

    const pos: Object = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    return (
        <Marker
            position={pos}
            onClick={navigateToLocation(location.meta.id)}
            label={String(location.meta.position)}
            key={location.meta.name} />
    )
}

const Map: Function = withGoogleMap(({ navigateToLocation, locations, userPosition }) => {

    const center: Object = {
        lat: 55.68177,
        lng: 12.55855
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
            size: new google.maps.Size(34, 34),
            scaledSize: new google.maps.Size(17, 17),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(8, 8)
        },
        key: 'User location'
    }

    return (
        <GoogleMap
            defaultZoom={14}
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
            {locations.map(renderMarker(navigateToLocation))}
        </GoogleMap>
    )
})

const LocationsMap: Function = ({ state, userPosition }: Object): Object => {
    const { locations } = state

    const navigateToLocation = id => () => {
        state.prevRoute = '/map'
        state.navigate(`/locations/${id}/map`)
    }

    const div = <div style={{ height: '100%' }} />

    return (
        <div className='locations-map'>
            <Map
                navigateToLocation={navigateToLocation}
                userPosition={userPosition}
                locations={locations}
                containerElement={div}
                mapElement={div} />
        </div>
    )
}

export default LocationsMap
