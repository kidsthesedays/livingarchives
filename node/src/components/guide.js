// @flow

import React from 'react'

const Guide = ({ state }: Object): Object => {

    const { router } = state

    const navigate: Function = () => {
        router.navigate('https://alberta.livingarchives.org/locations', true)
    }

    return (
        <div className='guide'>
            <h1>Guide</h1>
            <p>Instructions</p>
            <ol>
                <li>Do this</li>
                <li>Then, this.</li>
            </ol>
            <button type='button' onClick={navigate}>Gå till listan</button>
        </div>
    )
}

export default Guide
