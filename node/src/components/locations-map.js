// @flow
/* global google */

import React from 'react'

import { mapStyles } from './map-style'

import {
    withGoogleMap,
    GoogleMap,
    Marker
} from 'react-google-maps'

const renderMarker: Function = navigateToLocation => location => )
    <Marker
        position={{
            lat: location.meta.latitude,
            lng: location.meta.longitude
        }}
        onClick={navigateToLocation(location.meta.id)}
        key={location.meta.name} />
)

const Map: Function = withGoogleMap(({ navigateToLocation, locations }) => {

    // const center: Object = new google.maps.LatLng(55.68177, 12.55855)
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
    const navigateToLocation = id => () => router.navigate(`https://alberta.livingarchives.org/locations/${id}/map`, true)
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
