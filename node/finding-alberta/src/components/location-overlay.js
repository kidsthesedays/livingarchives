import React, { Component } from 'react'
import { videoViewed } from '../cache'
import StartAudioButton from './start-audio-button'
import ImageGallery from 'react-image-gallery'
import ReactPlayer from 'react-player'

class LocationOverlay extends Component {
    constructor(props) { 
        super(props)
    }

    // Cancels propagation
    cancel(e) {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
    }

    // NOTE this limits the media to 1 thing (audio/video/gallery)
    renderMedia(state, location) {
        const media = []

        if (location.meta.hasOwnProperty('audio')) {
            media.push(this.renderAudio(state, location))
        }
        
        if (location.meta.hasOwnProperty('video')) {
            media.push(this.renderVideo(location))
        }
        
        if (location.meta.hasOwnProperty('gallery')) {
            media.push(this.renderGallery(location))
        }

        if (location.meta.hasOwnProperty('image')) {
            media.push(this.renderImage(location))
        }

        return media.length > 0 ? media : null
    }

    renderImage(location) {
        const src = `/static/media/photos/${location.meta.image.src}`
        return (
            <div key={1} className='content-image'>
                <img src={src} />
            </div>
        )
    }

    renderAudio(state, location) {
        return (
            <StartAudioButton key={2} state={state} location={location} />
        )
    }

    renderVideo(location) {
        const url = `/static/videos/${location.meta.video.src}`
        const onPlay = () => {
            videoViewed(location.meta.id)
        }

        return (
            <ReactPlayer
                key={3}
                url={url}
                onPlay={onPlay}
                controls={true}
                width='100%'
                height='auto' />
        )
    }

    // NOTE we can add description here if we want to
    renderGallery(location) {
        const photos = location.meta.gallery.photos.map(p => {
            return {
                original: `/static/media/gallery/${p.src}`,
                thumbnail: `/static/media/gallery/thumbnails/${p.src}`
            }
        })

        return (
            <ImageGallery key={4} showPlayButton={false} items={photos} />
        )
    }

    render() {
        const { state, location, visible, close } = this.props

        if (!visible) {
            return null
        }

        // old back to start button
        // const backToStart = () => state.navigate('/locations')
        // <button onClick={backToStart} className='back-to-the-start' type='button'>
        //     <i className='icon ion-ios-arrow-left'></i>
        //     Back to the start
        // </button>

        // TODO check if audio is available
        return (
            <div className='info-box'>
                <div onClick={close} className='info-overlay'>
                    <div onClick={this.cancel.bind(this)} className='info-container'>
                        <div className='close-info-container'>
                            <i onClick={close} className='icon ion-ios-close-empty'></i>
                        </div>

                        <div className='content'>
                            <h1 className='title'>{location.meta.title}</h1>
                            <div className='text' dangerouslySetInnerHTML={{ __html: location.content }} />
                            {this.renderMedia(state, location)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default LocationOverlay

