// @flow

import React from 'react'

import AudioPlayer from './audio-player'

const Location: Function = ({ state, location }: Object): Object => {

    const navigateToList = () => state.navigate('/locations')

    return (
        <div className='location'>

            <AudioPlayer src='example.mp3' title='Title' locationID={location.meta.id}/>

            <div dangerouslySetInnerHTML={{ __html: location.content }} />

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

