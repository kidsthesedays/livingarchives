import React, { Component } from 'react'
import { mapStyles } from '../map-style'
import { withGoogleMap, GoogleMap, Circle, Marker } from 'react-google-maps'
import { locationVisited } from '../cache'
import { calculateDistance, userHasVisitedLocation } from '../utilities'
import Distance from '../components/distance'

const Map = withGoogleMap(({ location, userPosition }) => {
    const center = {
        lat: location.meta.latitude,
        lng: location.meta.longitude
    }

    const googleMapOpts = {
        defaultZoom: 15,
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

    const circleOpts = {
        center: center,
        radius: 100,
        options: {
            fillColor: 'red',
            fillOpacity: 0.2,
            strokeColor: 'red',
            strokeOpacity: 0.5,
            strokeWidth: 1
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
            size: new google.maps.Size(42, 42),
            scaledSize: new google.maps.Size(21, 21),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(8, 8)
        },
        key: 'User location'
    }

    const markerOpts = {
        position: center,
        label: String(location.meta.id),
        key: location.meta.name
    }

    return (
        <GoogleMap {...googleMapOpts}>
            <Marker {...userMarkerOpts} />
            <Circle {...circleOpts} />
            <Marker {...markerOpts}  />
        </GoogleMap>
    )
})

class LocationMap extends Component {
    constructor(props) {
        super(props)
    }

    handleClick() {
        const { state, location } = this.props
        locationVisited(location.meta.id)
        state.navigate(`/locations/${location.meta.id}/camera`)
    }

    renderActiveButton() {
        return (
            <button 
                className='location-map-button'
                onClick={this.handleClick.bind(this)}
                type='button'>
                <i className='icon ion-ios-checkmark-empty'></i>
            </button>
        )
    }

    renderDisabledButton() {
        return (
            <button 
                className='location-map-button disabled'
                type='button'>
                <i className='icon ion-ios-close-empty'></i>
            </button>
        )
    }

    renderDistance(d) {
        return <div className='distance'>{d}</div>
    }

    render() {
        const { state, location, userPosition } = this.props

        const div = <div style={{ height: '100%' }} />
        const visited = userHasVisitedLocation(state, location.meta.id)

        if (userPosition === null) {
            return (
                <div className='location-map'>
                    <Map
                        location={location}
                        containerElement={div}
                        mapElement={div} />

                    <div className='distance-container'>
                        <Distance
                            userPosition={userPosition}
                            location={location}
                            render={this.renderDistance.bind(this)} />
                    </div>

                    {this.renderDisabledButton()}
                </div>
            )
        }

        const locationPosition = {
            lat: location.meta.latitude,
            lng: location.meta.longitude
        }

        const distance = calculateDistance(
            userPosition,
            locationPosition
        )

        const cls = state.audio.active
            ? 'location-map audio-bar'
            : 'location-map'

        // TODO fix distance-limit
        return (
            <div className={cls}>
                <Map
                    location={location}
                    userPosition={userPosition}
                    containerElement={div}
                    mapElement={div} />

                <div className='distance-container'>
                    <Distance
                        userPosition={userPosition}
                        location={location}
                        render={this.renderDistance.bind(this)} />
                </div>

                {visited
                    ? this.renderActiveButton()
                    : distance < 10000000
                        ? this.renderActiveButton()
                        : this.renderDisabledButton()}
            </div>
        )
    }
}

export default LocationMap
