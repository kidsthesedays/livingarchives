// @flow

import React, { Component } from 'react'

import { locationUnlocked } from '../cache'
import Distance from '../components/distance'

// TODO should only be able to unlock if the user has "scanned" the object

class LocationCamera extends Component {
    constructor(props: Object) {
        super(props)
    }


    render() {
        const {
            state,
            userPosition,
            location
        } = this.props

        const handleClick = () => {
            locationUnlocked(location.meta.id)
            state.navigate(`/locations/${location.meta.id}/story`)
        }

        // TODO fix later
        // const hasUnlockedLocation: bool = state.userData.locations[`location_${location.meta.id}`].unlocked
        const hasUnlockedLocation: bool = true


        const activeButton = (
            <button 
                className='location-camera-button'
                onClick={handleClick}
                type='button'>
                <i className='icon ion-ios-unlocked'></i>
            </button>
        )

        const disabledButton = (
            <button 
                className='location-camera-button disabled'
                type='button'>
                <i className='icon ion-ios-locked'></i>
            </button>
        )

        const renderDistance = d => <div className='distance'>{d}</div>

        return (
            <div className='location-camera'>
                <div className='distance-container'>
                    <Distance
                        userPosition={userPosition}
                        location={location}
                        render={renderDistance} />
                </div>
                {hasUnlockedLocation ? activeButton : disabledButton}
            </div>
        )
    }
}

export default LocationCamera
