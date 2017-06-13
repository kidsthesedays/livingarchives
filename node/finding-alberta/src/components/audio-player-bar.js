import React, { Component } from 'react'
import { unmountComponentAtNode } from 'react-dom'
import { formatSeconds } from '../utils'
import { setCurrentSound } from '../cache'
import Slider from 'react-rangeslider'

class AudioPlayerBar extends Component {
    constructor(props) { 
        super(props)

        this.timerID = 0
        this.audio = new Audio(this.props.state.audio.src)
        
        this.state = {
            expanded: false,
            isPlaying: false,
            elapsedTime: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        // Check if we have an audio src and its not the same as before
        if (nextProps.state.audio.src !== ''
            && this.props.state.audio.src !== nextProps.state.audio.src) {
            this.audio.src = nextProps.state.audio.src
        }
    }

    play() {
        this.audio.play()
    }

    pause() {
        this.audio.pause()
    }

    getDuration() {
        return isNaN(this.audio.duration) ? 0 : this.audio.duration
    }

    toggleExpand() {
        this.setState({ expanded: !this.state.expanded })
    }

    togglePlay() {
        const { state } = this.props
        const { isPlaying, elapsedTime } = this.state

        if (isPlaying) {
            this.pause()
            clearInterval(this.timerID)
        } else {
            this.play()
            this.timerID = setInterval(this.tick.bind(this), 500)
        }

        if (state.audio.locationID) {
            setCurrentSound(state.audio.locationID, elapsedTime)
        }

        this.setState({ isPlaying: !isPlaying })
    }

    tick() {
        const { elapsedTime } = this.state

        if (elapsedTime == this.audio.duration) {
            this.pause()
            this.audio.currentTime = 0
            this.setState({
                isPlaying: false,
                elapsedTime: 0
            })
        } else {
            this.setState({ elapsedTime: this.audio.currentTime })
        }
    }

    updateElapsedTime(elapsedTime) {
        if (isNaN(elapsedTime)) {
            return false
        }

        this.audio.currentTime = elapsedTime
        this.setState({ elapsedTime })
    }

    makeInactive() {
        const { state } = this.props

        clearInterval(this.timerID)
        this.pause()
        unmountComponentAtNode(state.audioMountNode)
    }

    componentWillUnmount() {
        const { state } = this.props

        state.audio.active = false
        state.audio.src = ''
        state.audio.name = ''
        state.audio.locationID = null
    }

    render() {
        const { state } = this.props
        const { expanded, elapsedTime } = this.state

        if (!state.audio.active) {
            return null
        }

        const playIcon = this.state.isPlaying
            ? 'icon ion-ios-pause'
            : 'icon ion-ios-play'

        const expandIcon = this.state.expanded
            ? 'icon ion-ios-arrow-down'
            : 'icon ion-ios-arrow-up'

        const progress = this.getDuration() === 0
            ? 0
            : Math.round((elapsedTime / this.audio.duration) * 100)

        if (expanded) {
            const currentTime = formatSeconds(elapsedTime)
            const total = formatSeconds(this.getDuration())

            return (
                <div className='audio-player-bar expanded'>
                    <div className='audio-player-bar-expanded-content'>
                        <p className='audio-name'>{state.audio.name}</p>
                        <Slider 
                            tooltip={false}
                            value={this.state.elapsedTime}
                            max={this.audio.duration}
                            onChange={this.updateElapsedTime.bind(this)}
                            orientation='horizontal' />
                        <p className='elapsed-time'>{currentTime} / {total}</p>
                    </div>

                    <div className='audio-player-bar-content'>
                        <button
                            onClick={this.toggleExpand.bind(this)}
                            className='toggle-expand-button'>
                            <i className={expandIcon}></i>
                        </button>

                        <button
                            onClick={this.makeInactive.bind(this)}
                            className='cancel-audio-button'>
                            <i className='icon ion-ios-close-outline'></i>
                        </button>

                        <button
                            onClick={this.togglePlay.bind(this)}
                            className='toggle-play-button'>
                            <i className={playIcon}></i>
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className='audio-player-bar'>
                <div className='audio-player-progress'>
                    <div style={{width: `${progress}%`}}></div>
                </div>
                <div className='audio-player-bar-content'>
                    <button
                        onClick={this.toggleExpand.bind(this)}
                        className='toggle-expand-button'>
                        <i className={expandIcon}></i>
                    </button>

                    <p className='audio-name'>{state.audio.name}</p>

                    <button
                        onClick={this.togglePlay.bind(this)}
                        className='toggle-play-button'>
                        <i className={playIcon}></i>
                    </button>
                </div>
            </div>
        )
    }
}

export default AudioPlayerBar
