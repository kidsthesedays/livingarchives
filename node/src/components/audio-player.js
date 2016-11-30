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

        setCurrentSound(this.props.locationID, this.state.elapsedTime)

        this.setState({
            isPlaying: !isPlaying
        })
    }

    handleSongPlaying(elapsedTime: Number) {
        this.setState({
            elapsedTime: elapsedTime
        })

        this.audio.currentTime = elapsedTime
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
                <div className='audio-player-controls'>
                    {/* pause play */}
                    <button onClick={this.handlePlayPauseClick.bind(this)} className='play-pause'>
                        <i className={isPlaying ? 'icon ion-ios-pause' : 'icon ion-ios-play'}></i>
                    </button>

                    {/* current time and total */}
                    <p>{currentTime} / {total}</p>


                    <Slider 
                        value={elapsedTime}
                        max={audio.duration}
                        orientation="horizontal"
                        onChange={this.handleSongPlaying.bind(this)}
                    />

                    {/* mute button */}
                    <button onClick={this.handleMuteUnmuteClick.bind(this)} className='mute-unmute'>
                        <i className={isMuted ? 'icon ion-ios-volume-low' : 'icon ion-ios-volume-high' }></i>
                    </button>
                </div>
            </div>
        )
    }
}

export default AudioPlayer
