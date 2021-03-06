import React, { Component } from 'react'
import { locationUnlocked } from '../cache'
import Distance from './distance'
import { calculateDistance } from '../utils'
import LocationOverlay from './location-overlay'

const renderDistance = d => <p className='distance'>{d}</p>

class LocationCamera extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            visibleOverlay: false
        }
    }

    componentDidMount() {
        const { state, location } = this.props

        const panorama = {
            url: `/static/media/panoramas/location_${location.meta.id}.jpg`,
            longitude: location.meta.longitude,
            latitude: location.meta.latitude,
            height: 271 // TODO ta reda på höjden för alla?
        }

        const done = () => this.setState({ loading: false })

        state.showPanorama(panorama, done)
    }

    toggleOverlay() {
        this.setState({ visibleOverlay: !this.state.visibleOverlay })

        // Zoomable image
        setTimeout(() => {
            if (this.state.visibleOverlay) {
                const elem = document.getElementById('zoomable')
                if (elem !== undefined) {
                    const zm = new Zoom(elem, { pan: false, rotate: false })
                }
            }
        }, 400)
    }

    closeOverlay() {
        this.setState({ visibleOverlay: false })
    }

    renderActiveButton() {
        const { location } = this.props

        const click = () => {
            this.toggleOverlay()
            locationUnlocked(location.meta.id)
        }

        return (
            <button 
                className='location-camera-button'
                onClick={click}
                type='button'>
                <i className='icon ion-ios-unlocked'></i>
            </button>
        )
    }

    renderDisabledButton() {
        return (
            <button 
                className='location-camera-button disabled'
                type='button'>
                <i className='icon ion-ios-locked'></i>
            </button>
        )
    }

    renderLoader() {
        return (
            <div className='panorama-loader'>
                <div className='spinner'>
                    <div className='bounce1'></div>
                    <div className='bounce2'></div>
                    <div className='bounce3'></div>
                </div>
            </div>
        )
    }

    render() {
        const { loading, visibleOverlay } = this.state
        const { state, userPosition, location } = this.props

        // TODO fix later
        const hasUnlockedLocation = state.userData.locations[`location_${location.meta.id}`].unlocked

        const cls = state.audio.active
            ? 'location-camera audio-bar'
            : 'location-camera'

        // TODO add distance check to be able to unlock
        const locationPosition = {
            lat: location.meta.latitude,
            lng: location.meta.longitude
        }

        const distance = calculateDistance(
            userPosition,
            locationPosition
        )

        // TODO fix distance limit

        return (
            <div className={cls}>

                {loading ? this.renderLoader() : null}

                <div className='distance-container'>
                    <Distance
                        userPosition={userPosition}
                        location={location}
                        render={renderDistance} />
                </div>

                {hasUnlockedLocation
                    ? this.renderActiveButton()
                    : distance < 30000000
                        ? this.renderActiveButton()
                        : this.renderDisabledButton()}

                <LocationOverlay
                    state={state}
                    location={location}
                    visible={visibleOverlay}
                    close={this.closeOverlay.bind(this)} />
            </div>
        )
    }
}

export default LocationCamera
