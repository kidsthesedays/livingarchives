import React, { Component } from 'react'
import Distance from '../components/distance'

const renderDistance = d => <div className='distance'>{d}</div>

class Navigation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showOverlay: false
        }
    }

    toggleOverlay() {
        this.setState({ showOverlay: !this.state.showOverlay })
    }

    closeOverlay(e) {
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

        const goBack = () => {
            state.prevRoute = ''
            state.navigate(backUrl || '')
        }

        let left = <div></div>
        let right = <div></div>
        let center = <h2>{title || ''}</h2>
        let infoComponent = null

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
            // e.nativeEvent.stopImmediatePropagation()
        }

        if (renderInfo) {
            infoComponent = (
                <div className='info-box'>
                    <div onClick={this.closeOverlay.bind(this)} className='info-overlay'>

                        <div className='info-container' onClick={cancel}>
                            <div className='close-info-container'>
                                <i onClick={this.closeOverlay.bind(this)} className='icon ion-ios-close-empty'></i>
                            </div>

                            <div onClick={cancel} className='content'>{renderInfo()}</div>
                        </div>
                        
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
