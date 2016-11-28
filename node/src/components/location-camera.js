// @flow

import React from 'react'

const LocationCamera: Function = ({ state, location }: Object): Object => {

    if (!location.hasOwnProperty('meta')) {
        return (
            <div className='location-camera'>
                <p>No location found</p>
            </div>
        )
    }

    const handleClick = () => state.navigate(`/locations/${location.meta.id}/story`)

    return (
        <div className='location-camera'>
            <button 
                className='location-camera-button'
                onClick={handleClick}
                type='button'>
                Unlock the story
            </button>
        </div>
    )
}

export default LocationCamera
