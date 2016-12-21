// @flow

import React, { Component } from 'react'
import { locationUnlocked } from '../cache'
import Distance from '../components/distance'
// import { throttle } from '../utilities'
// import {
//     // updateUserAndLocationPosition,
//     // setupFrameFunc,
//     loadPanorama,
//     updateUserPose,
//     renderArgon
// } from '../argon'

class LocationCamera extends Component {
    state: Object
    renderFunc: Function
    updateFunc: Function

    constructor(props: Object) {
        super(props)

        const { location } = this.props

        this.state = {
            showOverlay: false
        }

        // Only throttle callback
        // this.updateFunc = updateUserAndLocationPosition(
        //         state,
        //         location.meta.id,
        //         throttle((f, d) => console.log(f ? 'found' : 'lost', d), 6000)
        // )

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

        // this.updateFunc = updateUserPose(state)
        // this.renderFunc = renderArgon(state)
        const panorama = {
            url: '/static/images/aqui.jpg',
            longitude: location.meta.longitude,
            latitude: location.meta.latitude
        }
        const connectFunc = session => {
            if (session.supportsProtocol('single.panorama')) {
                session.request('single.panorama.showPanorama', panorama)
            }
        }
        this.connectFunc = connectFunc
    }

    componentDidMount() {
        const { state } = this.props
        // state.app.updateEvent.addEventListener(this.updateFunc)
        // state.app.renderEvent.addEventListener(this.renderFunc)
        // TODO bottleneck?
        // setupFrameFunc(state)

        // const app  = Argon.init()
        // app.reality.setDefault({
        //     title: 'test',
        //     uri: 'test',
        //     providedReferenceFrames: ['FIXED']
        // })

        state.app.reality.connectEvent.addEventListener(this.connectFunc)

        // loadPanorama(state, panorama)
    }

    componentWillUnmount() {
        const { state } = this.props
        // state.app.updateEvent.removeEventListener(this.updateFunc)
        // state.app.renderEvent.removeEventListener(this.renderFunc)
        state.app.reality.connectEvent.removeEventListener(this.connectFunc)
    }

    toggleOverlay() {
        this.setState({ showOverlay: !this.state.showOverlay })
    }

    closeOverlay() {
        this.setState({ showOverlay: false })
    }

    renderOverlay() {

        const cancel = e => {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
        }

        return (
            <div
                onClick={this.closeOverlay.bind(this)}
                className='info-overlay'>
                <div
                    onClick={cancel}
                    className='info-container'>
                    <div
                        onClick={this.closeOverlay.bind(this)}
                        className='close-info-container'>
                        <i className='icon ion-ios-close-empty'></i>
                    </div>
                    <div className='content'>
                        <h2>Test</h2>
                        <p>hehehe</p>
                    
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {
            state,
            userPosition,
            location
        } = this.props

        const handleClick = () => {
            // locationUnlocked(location.meta.id)
            // state.navigate(`/locations/${location.meta.id}/story`)
            this.toggleOverlay()
        }

        // TODO fix later
        // const hasUnlockedLocation: bool = state.userData.locations[`location_${location.meta.id}`].unlocked
        const hasUnlockedLocation: bool = true

        console.log(locationUnlocked, state)

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
                {this.state.showOverlay ? this.renderOverlay() : null}
            </div>
        )
    }
}

export default LocationCamera
