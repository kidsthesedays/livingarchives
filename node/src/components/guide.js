// @flow

import React from 'react'

const Guide = ({ router }: Object): Object => {

    const navigate: Function = (e) => {
        e.preventDefault()
        router.navigate('https://alberta.livingarchives.org/locations', true)
    }

    return (
        <div className='guide'>
            <h1>Guide</h1>
            <p>Instructions</p>
            <a href="/locations" onClick={navigate}>Gå till listan</a>
            <ol>
                <li>Do this</li>
                <li>Then, this.</li>
            </ol>
        </div>
    )
}

export default Guide
