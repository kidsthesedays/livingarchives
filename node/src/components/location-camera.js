// @flow

import React, { Component } from 'react'

import { locationUnlocked } from '../cache'

// TODO should only be able to unlock if the user has "scanned" the object

class LocationCamera extends Component {
    constructor(props: Object) {
        super(props)
    }


    render() {
        const { state, location } = this.props

        const handleClick = () => {
            locationUnlocked(location.meta.id)
            state.navigate(`/locations/${location.meta.id}/story`)
        }

        // const hasUnlockedLocation: bool = state.userData.locations[`location_${location.meta.id}`].unlocked
        // TODO fix later
        const hasUnlockedLocation: bool = true

        // const activeButton = (
        //     <button 
        //         className='location-camera-button'
        //         onClick={handleClick}
        //         type='button'>
        //         Unlock the story
        //     </button>
        // )

        // const disabledButton = (
        //     <button 
        //         className='location-camera-button disabled'
        //         type='button'>
        //         Find the circle
        //     </button>
        // )

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

        return (
            <div className='location-camera'>
                {hasUnlockedLocation ? activeButton : disabledButton}
            </div>
        )
    }
}

export default LocationCamera
