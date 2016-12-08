// @flow

import React, { Component } from 'react'
import { locationUnlocked } from '../cache'
import Distance from '../components/distance'
import { throttle } from '../utilities'
import {
    updateUserAndLocationPosition,
    renderArgon
} from '../argon'

class LocationCamera extends Component {
    renderFunc: Function
    updateFunc: Function

    constructor(props: Object) {
        super(props)

        const { state, location } = this.props


        // Only throttle callback
        this.updateFunc = updateUserAndLocationPosition(
                state,
                location.meta.id,
                throttle((f, d) => console.log(f ? 'found' : 'lost', d), 6000)
        )

        // Throttle whole update func (800ms)
        // this.updateFunc = throttle(
        //     updateUserAndLocationPosition(
        //         state,
        //         location.meta.id,
        //         (f, d) => console.log(f ? 'found' : 'lost', d)
        //     ),
        //     600
        // )

        // NOTE callback could edit state so button is active

        this.renderFunc = renderArgon(state)
    }

    componentDidMount() {
        const { state } = this.props
        state.app.updateEvent.addEventListener(this.updateFunc)
        state.app.renderEvent.addEventListener(this.renderFunc)
    }

    componentWillUnmount() {
        const { state } = this.props
        state.app.updateEvent.removeEventListener(this.updateFunc)
        state.app.renderEvent.removeEventListener(this.renderFunc)
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
