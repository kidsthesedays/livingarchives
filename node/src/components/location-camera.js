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

    const { router } = state
    const handleClick = () => router.navigate(`https://alberta.livingarchives.org/locations/${location.meta.id}/story`, true)

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
