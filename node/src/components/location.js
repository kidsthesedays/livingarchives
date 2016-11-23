// @flow

import React from 'react'

const Location: Function = ({ state, location }: Object): Object => {

    if (!location.hasOwnProperty('meta')) {
        return (
            <div className='location'>
                <p>No location found</p>
            </div>
        )
    }

    const { router } = state
    const navigateToList = () => router.navigate('https://alberta.livingarchives.org/locations', true)

    return (
        <div className='location'>

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

