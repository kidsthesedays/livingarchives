// @flow

import React, { Component } from 'react'

import { mapStyles } from './map-style'

import {
    withGoogleMap,
    GoogleMap,
    Circle,
    Marker
} from 'react-google-maps'

import {
    humanReadableDistance,
    getDistance
} from '../utilities'

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

class Distance extends Component {

    state: Object

    constructor(props) {
        super(props)

        // const { state, location } = this.props

        // this.state = {
        //     distance: 0,
        //     updateEventFunc: throttle(updateUserAndLocationPosition(
        //         state,
        //         location.meta.id,
        //         n => this.setState({ distance: n })
        //     ), 2000)
        // }

        this.state = {
            distance: 0
        }
    }

    componentDidMount() {
        // const { state } = this.props
        // state.app.updateEvent.addEventListener(this.state.updateEventFunc)
    }

    componentWillUnmount() {
        // const { state } = this.props
        // state.app.updateEvent.removeEventListener(this.state.updateEventFunc)
    }

    render() {
        const { location, userPosition } = this.props

        if (userPosition === null) {
            return (
                <div className='location-map-distance'>
                    <p>Distance: ?</p>
                </div>
            )
        }

        const locationCoords = {
            lat: location.meta.latitude,
            lng: location.meta.longitude
        }

        const distance = humanReadableDistance(getDistance(locationCoords, userPosition))

        return (
            <div className='location-map-distance'>
                <p>Distance: {distance}</p>
            </div>
        )
    }
}

class LocationMap extends Component {
    render() {
        const { state, location, userPosition } = this.props

        const handleClick = () => state.router.navigate(`https://alberta.livingarchives.org/locations/${location.meta.id}/camera`, true)
        const div = <div style={{ height: '100%' }} />

        return (
            <div className='location-map'>
                <Map
                    location={location}
                    containerElement={div}
                    mapElement={div} />

                <button 
                    className='location-map-button'
                    onClick={handleClick}
                    type='button'>
                    Go to AR mode
                </button>

                <Distance
                    userPosition={userPosition}
                    state={state}
                    location={location} />
            </div>
        )
    }
}

export default LocationMap
