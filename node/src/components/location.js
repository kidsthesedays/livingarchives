// @flow

import React from 'react'

import AudioPlayer from './audio-player'

const Location: Function = ({ state, location }: Object): Object => {

    const navigateToList = () => {
        state.prevRoute = `/locations/${location.meta.id}/story`
        state.navigate('/locations')
    }

    return (
        <div className='location'>

            <h1 className='location-name'>{location.meta.name}</h1>
            <p className='location-address'>{location.meta.address}</p>

            <AudioPlayer
                src={location.meta.audio.src} 
                title={location.meta.audio.title} 
                locationID={location.meta.id} />

            <div
                className='location-content'
                dangerouslySetInnerHTML={{ __html: location.content }} />

            <button 
                className='location-navigate-to-list'
                onClick={navigateToList}
                type='button'>
                Go back to the locations
            </button>
        </div>
    )
}

export default Location

