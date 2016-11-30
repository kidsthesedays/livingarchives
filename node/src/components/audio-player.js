// @flow
import React, { Component } from 'react'

import { formatSeconds } from '../utilities'



class AudioPlayer extends Component {
    state: Object
    audio: Object

    constructor(props: Object) { 
        super(props)
        
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
        const isMuted = this.state.isMuted

        if (isMuted) {
            this.unmute() 
        } else {
            this.mute()
        }

        this.setState({
            isMuted: !isMuted
        })
    }

    handlePlayPauseClick() {
        const isPlaying = this.state.isPlaying

        if (isPlaying) {
            this.pause()
        } else {
            this.play()
        }

        this.setState({
            isPlaying: !isPlaying
        })
    }

    handleSongPlaying(e) {
        this.setState({
            elapsedTime: e.target.value
        })

        this.audio.currentTime = e.target.value
    }

    componentDidMount() {

        this.timerID = setInterval(
            () => this.tick(),
            1000
        )
    }

    componentWillUnmount() {
        clearInterval(this.timerID)
    }

    tick() {
        this.setState({
            elapsedTime: this.audio.currentTime
        })
    }


    render() {
        // yer own
        const audio = this.audio

        // props
        const { title } = this.props

        // state
        const { isPlaying, isMuted, elapsedTime } = this.state
        
        // formatted to look nice
        const currentTime = formatSeconds(elapsedTime)
        const total = formatSeconds(audio.duration)

        return (
            <div className='audio-player'>
                <p>{title}</p>

                {/* pause play */}
                <button onClick={this.handlePlayPauseClick.bind(this)} className='play-pause'>
                    <i className={isPlaying ? 'icon ion-ios-pause' : 'icon ion-ios-play'}></i>
                </button>

                {/* current time and total */}
                <p>{currentTime} / {total}</p>

                {/* slider/progress bar */}
                <input 
                    type="range" 
                    value={elapsedTime} 
                    max={audio.duration} 
                    onChange={this.handleSongPlaying.bind(this)}></input>

                {/* mute button */}
                <button onClick={this.handleMuteUnmuteClick.bind(this)} className='mute-unmute'>
                    <i className={isMuted ? 'icon ion-ios-volume-low' : 'icon ion-ios-volume-high' }></i>
                </button>
            </div>
        )
    }
}

export default AudioPlayer
