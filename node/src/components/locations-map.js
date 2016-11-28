// @flow

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

const Map: Function = withGoogleMap(({ navigateToLocation, locations }) => {

    const center: Object = {
        lat: 55.68177,
        lng: 12.55855
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
            {locations.map(renderMarker(navigateToLocation))}
        </GoogleMap>
    )
})

const LocationsMap: Function = ({ state }: Object): Object => {
    const { locations, router } = state

    const navigateToLocation = id => () => {
        state.prevRoute = '/map'
        router.navigate(`/locations/${id}/map`)
    }

    const div = <div style={{ height: '100%' }} />

    return (
        <div className='locations-map'>
            <Map
                navigateToLocation={navigateToLocation}
                locations={locations}
                containerElement={div}
                mapElement={div} />
        </div>
    )
}

export default LocationsMap
