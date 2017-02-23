// @flow
import React, { Component } from 'react'
import { locationUnlocked } from '../cache'
import Distance from './distance'
import LocationOverlay from './location-overlay'

const renderDistance: Object = d => <p className='distance'>{d}</p>

class LocationCamera extends Component {
    state: Object

    constructor(props: Object) {
        super(props)

        this.state = {
            visibleOverlay: false
        }
    }

    componentDidMount() {
        const { state, location } = this.props

        const panorama = {
            url: `/static/panoramas/location_${location.meta.id}.jpg`,
            longitude: location.meta.longitude,
            latitude: location.meta.latitude
        }

        state.showPanorama(panorama)
    }

    toggleOverlay() {
        this.setState({ visibleOverlay: !this.state.visibleOverlay })
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

    render() {
        const {
            state,
            userPosition,
            location
        } = this.props

        const { visibleOverlay } = this.state

        // TODO fix later
        // const hasUnlockedLocation: bool = state.userData.locations[`location_${location.meta.id}`].unlocked
        const hasUnlockedLocation: bool = true

        const cls: string = state.audio.active
            ? 'location-camera audio-bar'
            : 'location-camera'

        // TODO add distance check to be able to unlock

        return (
            <div className={cls}>
                <div className='distance-container'>
                    <Distance
                        userPosition={userPosition}
                        location={location}
                        render={renderDistance} />
                </div>

                {hasUnlockedLocation
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
