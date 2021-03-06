import React from 'react'

const ErrorView = ({ msg }) => {
    return (
        <div className='error-view location-content'>
            <h2>Something went wrong!</h2>
            <p>{msg}</p>
        </div>
    )
}

export default ErrorView
