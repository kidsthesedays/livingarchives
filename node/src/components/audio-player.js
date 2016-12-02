// @flow
declare var Audio

import React, { Component } from 'react'
import Slider from 'react-rangeslider'
import { formatSeconds } from '../utilities'
import { setCurrentSound } from '../cache'

class AudioPlayer extends Component {
    state: Object
    audio: Object
    timerID: number

    constructor(props: Object, context: Object) { 
        super(props, context)
        
        this.audio = new Audio(`/static/${this.props.src}`)

        this.state = {
            isPlaying: false,
            isMuted: false,
            elapsedTime: 0
        }
    }

    play() {
        this.audio.play()
    }

    pause() {
        this.audio.pause()
    }

    mute() {
        this.audio.muted = true
    }

    unmute() {
        this.audio.muted = false
    }

    handleMuteUnmuteClick() {
        if (this.state.isMuted) {
            this.unmute() 
        } else {
            this.mute()
        }

        this.setState({ isMuted: !this.state.isMuted })
    }

    handlePlayPauseClick() {
        if (this.state.isPlaying) {
            this.pause()
        } else {
            this.play()
        }

        setCurrentSound(this.props.locationID, this.state.elapsedTime)

        this.setState({ isPlaying: !this.state.isPlaying })
    }

    handleSongPlaying(elapsedTime: Number) {
        this.audio.currentTime = elapsedTime
        this.setState({ elapsedTime: elapsedTime })
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timerID)
    }

    tick() {
        // If song has ended or not
        if (this.state.elapsedTime == this.audio.duration) {
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

    render() {
        // Format time output
        const currentTime = formatSeconds(this.state.elapsedTime)
        const total = formatSeconds(this.audio.duration)

        const playIcon: string = this.state.isPlaying
            ? 'icon ion-ios-pause'
            : 'icon ion-ios-play'

        const muteIcon: string = this.state.isMuted
            ? 'icon ion-ios-volume-low'
            : 'icon ion-ios-volume-high'

        return (
            <div className='audio-player'>
                <h5 className='title'>{this.props.title}</h5>

                <div className='audio-player-controls'>
                    <button
                        onClick={this.handlePlayPauseClick.bind(this)}
                        className='play-pause'>
                        <i className={playIcon}></i>
                    </button>

                    <p className='elapsed-time'>{currentTime} / {total}</p>

                    <Slider 
                        value={this.state.elapsedTime}
                        max={this.audio.duration}
                        orientation="horizontal"
                        onChange={this.handleSongPlaying.bind(this)} />

                    <button
                        onClick={this.handleMuteUnmuteClick.bind(this)}
                        className='mute-unmute'>
                        <i className={muteIcon}></i>
                    </button>
                </div>
            </div>
        )
    }
}

export default AudioPlayer
