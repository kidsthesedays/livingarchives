// @flow
import React, { Component } from 'react'
import Distance from '../components/distance'

const renderDistance = d => <div className='distance'>{d}</div>

class Navigation extends Component {
    state: Object

    constructor(props: Object) {
        super(props)
        this.state = {
            showOverlay: false
        }
    }

    toggleOverlay() {
        this.setState({ showOverlay: !this.state.showOverlay })
    }

    closeOverlay() {
        this.setState({ showOverlay: false })
    }

    render() {
        const {
            state,
            title,
            renderLeft,
            renderRight,
            distance,
            location,
            backUrl,
            info,
            renderInfo,
            userPosition
        } = this.props

        const goBack: Function = () => {
            state.prevRoute = ''
            state.navigate(backUrl || '')
        }

        let left: Object = <div></div>
        let right: Object = <div></div>
        let center: Object = <h2>{title || ''}</h2>
        let infoComponent: ?Object = null

        if (renderLeft) {
            left = renderLeft()
        } else if (backUrl) {
            left = (
                <div onClick={goBack} className='back-button'>
                    <i className='icon ion-ios-arrow-left'></i>
                </div>
            )
        }

        if (renderRight) {
            right = renderRight() 
        } else if (distance && !info) {
            right = (
                <Distance
                    userPosition={userPosition}
                    location={location}
                    render={renderDistance} />
            )
        } else if (distance && info) {
            right = (
                <div className='info-and-distance'>
                    <div 
                        onClick={this.toggleOverlay.bind(this)}
                        className='info'>
                        <i className='icon ion-ios-information'></i>
                    </div>
                </div>
            )
        }

        // Cancel further propagation of events
        const cancel = e => {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
        }

        if (renderInfo) {
            infoComponent = (
                <div className='info-box'>
                    <div
                        onClick={this.closeOverlay.bind(this)}
                        className='info-overlay'>
                    </div>
                    <div
                        onClick={cancel}
                        className='info-container'>
                        <div
                            onClick={this.closeOverlay.bind(this)}
                            className='close-info-container'>
                            <i className='icon ion-ios-close-empty'></i>
                        </div>
                        <div className='content'>{renderInfo()}</div>
                    </div>
                </div>
            )
        }

        return (
            <div className='navigation'>
                <div className='left'>{left}</div>
                <div className='center'>{center}</div>
                <div className='right'>{right}</div>
                {this.state.showOverlay ? infoComponent : null}
            </div>
        )
    }
}

export default Navigation
