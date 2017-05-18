import React, { Children, cloneElement, Component } from 'react'

class App extends Component {
    constructor(props) {
        super(props)

        this.watchID = 0
        this.state = { userPosition: null }
    }

    componentWillMount() {
        const { state } = this.props

        // Success handler
        const success = p => {
            const userPosition = {
                lat: p.coords.latitude,
                lng: p.coords.longitude
            }

            state.userPosition = userPosition
            this.setState({ userPosition })
        }

        // Error handler
        // TODO remove?
        const error = e => {
            console.log('Unable to get position', e.message)

            const userPosition = {
                lat: 55.5941971,
                lng: 13.0167396
            }

            state.userPosition = userPosition
            this.setState({ userPosition })
        }

        if ('geolocation' in navigator) {
            this.watchID = navigator.geolocation.watchPosition(
                success,
                error
            )

            // TODO also check for lng?
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
