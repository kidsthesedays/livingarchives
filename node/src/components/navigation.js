// @flow

import React from 'react'

const Navigation: Function = ({ state, back, backURL, title }: Object): Object => {

    const { router } = state

    const goBack: Function = () => router.navigate(backURL || '', true)

    return (
        <div className='navigation'>
            <div className='left' onClick={goBack}>
                {back === false
                    ? ''
                    : <p>back</p>}
            </div>
            <div className='center'>
                <p>{title || ''}</p>
            </div>
            <div className='right'>
            </div>
        </div>
    )
}

export default Navigation
