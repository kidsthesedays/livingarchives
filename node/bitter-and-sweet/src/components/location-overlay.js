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
        if (location.meta.hasOwnProperty('audio')) {
            return this.renderAudio(state, location)
        } else if (location.meta.hasOwnProperty('video')) {
            return this.renderVideo(location)
        } else if (location.meta.hasOwnProperty('gallery')) {
            return this.renderGallery(location)
        } else if (location.meta.hasOwnProperty('image')) {
            return this.renderImage(location)
        }

        return null
    }

    renderImage(location) {
        const src = `/static/media/photos/${location.meta.image.src}`
        return (
            <img className='content-image' src={src} />
        )
    }

    renderAudio(state, location) {
        return (
            <StartAudioButton state={state} location={location} />
        )
    }

    renderVideo(location) {
        const url = `/static/videos/${location.meta.video.src}`
        const onPlay = () => {
            videoViewed(location.meta.id)
        }

        return (
            <ReactPlayer
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
                thumbnail: `/static/media/gallery/thumb_${p.src}`
            }
        })

        return (
            <ImageGallery showPlayButton={false} items={photos} />
        )
    }

    render() {
        const { state, location, visible, close } = this.props

        if (!visible) {
            return null
        }

        // TODO check if audio is available
        return (
            <div className='info-box'>
            <div onClick={close} className='info-overlay'>
            </div>
                <div onClick={this.cancel} className='info-container'>
                    <button onClick={close} className='close-info-container'>
                        <i className='icon ion-ios-close-empty'></i>
                    </button>

                    <div className='content'>
                        <h1 className='title'>{location.meta.name}</h1>
                        <div className='text' dangerouslySetInnerHTML={{ __html: location.content }} />
                        {this.renderMedia(state, location)}
                    </div>
                </div>
            </div>
        )
    }
}

export default LocationOverlay

