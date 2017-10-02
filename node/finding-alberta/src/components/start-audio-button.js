import React, { Component } from 'react'
import { render } from 'react-dom'
import AudioPlayerBar from './audio-player-bar'

class StartAudioButton extends Component {
    constructor(props) { 
        super(props)
    }

    initializeAudioBar() {
        const { state, location } = this.props

        // Audio has already been loaded
        if (state.audio.active && state.audio.locationID === location.meta.id) {
            return false
        }

        state.audio.active = true
        state.audio.src = `/static/audio/${location.meta.audio.src}`
        state.audio.name = location.meta.audio.title
        state.audio.locationID = location.meta.id

        render(<AudioPlayerBar state={state} />, state.audioMountNode)
    }

    render() {
        const { location } = this.props

        return (
            <div
                className='start-audio-button'
                onClick={this.initializeAudioBar.bind(this)}>
                <i className='icon ion-ios-volume-high'></i>
                <p>Listen</p>
            </div>
        )
    }
}

export default StartAudioButton
