// @flow

import React, { Children, cloneElement, Component } from 'react'

class App extends Component {
    constructor(props) {
        super(props)

        this.watchID = null
        this.state = {
            userPosition: null
        }
    }

    componentWillMount() {
        const { state } = this.props

        // Success handler
        const success: Function = p => {
            const userPosition = {
                lat: p.coords.latitude,
                lng: p.coords.longitude
            }

            state.userPosition = userPosition
            this.setState({ userPosition })
        }

        // Error handler
        const error: Function = e => console.error(e)

        if ('geolocation' in navigator) {

            this.watchID = navigator.geolocation.watchPosition(
                success,
                error
            )

            if (state.userPosition.hasOwnProperty('lat')) {
                this.setState({ userPosition: state.userPosition })
            }

        } else {
            console.error('Geolocation not supported')
        }
    }

    componentWillUnmount() {
        if ('geolocation' in navigator) {
            navigator.geolocation.clearWatch(this.watchID)
        }
    }

    render() {
        const { state, children } = this.props

        return (
            <div className='app'>
                {Children.map(children, c => cloneElement(c, {
                    state: state,
                    userPosition: this.state.userPosition
                }))}
            </div>
        )
    }
}

export default App
