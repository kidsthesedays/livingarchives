import React from 'react'
import { mapStyles } from '../map-style'
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps'

const renderMarker = navigateToLocation => location => {
    const pos = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    const markerOpts = {
        position: pos,
        onClick: navigateToLocation(location.meta.id),
        label: String(location.meta.position),
        key: location.meta.name
    }

    return <Marker {...markerOpts} />
}

const Map = withGoogleMap(({ navigateToLocation, locations, userPosition }) => {
    const center = {
        lat: 55.68177,
        lng: 12.55855
    }

    const googleMapOpts = {
        defaultZoom: 14,
        defaultCenter: center,
        defaultOptions: {
            styles: mapStyles,
            mapTypeControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            scaleControl: false
        }
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
            url: '/static/images/gpsloc.png',
            size: new google.maps.Size(34, 34),
            scaledSize: new google.maps.Size(17, 17),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(8, 8)
        },
        key: 'User location'
    }

    return (
        <GoogleMap {...googleMapOpts}>
            <Marker {...userMarkerOpts} />
            {locations.map(renderMarker(navigateToLocation))}
        </GoogleMap>
    )
})

const LocationsMap = ({ state, userPosition }) => {
    const { locations } = state

    const navigateToLocation = id => () => {
        state.prevRoute = '/map'
        state.navigate(`/locations/${id}/map`)
    }

    const div = <div style={{ height: '100%' }} />

    const cls = state.audio.active
        ? 'locations-map audio-bar'
        : 'locations-map'

    return (
        <div className={cls}>
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
