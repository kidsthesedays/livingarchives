import React from 'react'
import { userStartedTour } from '../cache'

const Guide = ({ state }) => {
    const navigate = () => {
        userStartedTour()
        state.navigate('/locations')
    }

    return (
        <div className='guide location-content'>
            <h1 className='title'>Finding Alberta</h1>
            <p className='instructions'>
                Here is a memory hidden in the city of Copenhagen. Several
                memories actually. You are invited to walk in the footsteps of
                a black child, Alberta Viola Roberts, who was taken from the
                Caribbean to be displayed as a human exhibit at Tivoli Gardens.
                The year was 1905, but we will get to the specifics later. This
                is an unusual story, a Danish and a colonial one. For now, pick
                a spot where you would like to begin. We recommend Vestergade
                as a natural beginning. Here are a few instructions:
            </p>
            <ol className='instructions-list'>
                <li>Choose a location from the list or map</li>
                <li>Find the house</li>
                <li>Push the unlock key</li>
                <li>Enjoy the story</li>
                <li>Go to the next place</li>
                <li>Share your experience</li>
            </ol>
            <button
                className='start'
                type='button'
                onClick={navigate}>Let's go</button>
        </div>
    )
}

export default Guide
