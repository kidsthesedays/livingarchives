// @flow

import React from 'react'

import AudioPlayer from './audio-player'

const Location: Function = ({ state, location }: Object): Object => {

    const navigateToList = () => {
        state.prevRoute = `/locations/${location.meta.id}`
        state.navigate('/locations')
    }

    return (
        <div className='location'>

            <h1 className='location-name'>{location.meta.name}</h1>
            <p className='location-address'>{location.meta.address}</p>

            <AudioPlayer src='example.mp3' title='Voice recording: Victor' locationID={location.meta.id}/>

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

