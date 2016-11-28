// @flow

import React from 'react'

const Guide = ({ state }: Object): Object => {

    const navigate: Function = () => state.navigate('/locations')

    return (
        <div className='guide'>
            <h1 className='title'>Finding Alberta</h1>
            <p className='instructions'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <ol className='instructions-list'>
                <li>Choose a spot</li>
                <li>Find the house</li>
                <li>Push the AR-button</li>
                <li>Do something</li>
                <li>Enjoy the story</li>
                <li>Share with friends</li>
            </ol>
            <button
                className='start'
                type='button'
                onClick={navigate}>Let's go</button>
        </div>
    )
}

export default Guide
