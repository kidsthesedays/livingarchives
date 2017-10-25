import React from 'react'

const Start = ({ state }) => {
    const navigate = () => state.navigate('/guide')

    return (
        <div className='start location-content' onClick={navigate}>
            <img src='/static/media/images/alberta-turned.jpg' />
            <button
                className='go-to-guide'
                type='button'>Finding Alberta</button>
        </div>
    )
}

export default Start
