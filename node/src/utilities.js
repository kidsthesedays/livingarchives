// @flow

import { Object3D } from 'three'
import { Cesium } from '@argonjs/argon'
import {
    fetchLocationData,
    fetchUserData
} from './cache'

// Format seconds to 0:00:00 format
function formatSeconds(seconds) {
    seconds = Number(seconds)

    const h = Math.floor(seconds / 3600) | 0
    const m = Math.floor(seconds / 60) | 0
    const s = Math.floor(seconds % 60) | 0

    var hms = ''

    if (h > 0) {
        hms += '' + h + ':' + (m < 10 ? '0' : '')
    }

    hms += '' + m + ':' + (s < 10 ? '0' : '')
    hms += '' + s
    return hms
}

// Format floating points
export function toFixed(value: number, precision: number = 0): number {
    const p: number = Math.pow(10, precision)
    return Math.round(value * p) / p
}

export function generateHash(s: string): number {
    let hash: number = 0
    let i: number
    let len: number
    let chr: number

    for (i = 0, len = s.length; i < len; i++) {
        chr = s.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
    }

    return hash
}

// Creates a GUID based on several different browser variables
// It wont be compliant with RFC4122 but hopefully good enough
export function guid(window: Object): number {
    const nav: Object = window.navigator
    const screen: Object = window.screen
    const s: string = [
        nav.mimeTypes.length,
        nav.userAgent.replace(/D+/g, ''),
        nav.plugins.length,
        screen.height || '',
        screen.width || '',
        screen.pixelDepth || ''
    ].join('')

    return generateHash(s)
}

// Setup a new location
export function setupLocation(meta: Object, content: string): Object {
    // THREE.js 3D objects and a Cesium entity - these represents the location/pose
    let locationObject: Object = new Object3D()
    let geoObject: Object = new Object3D()
    let geoEntity: Object = new Cesium.Entity({
        name: meta.name,
        orientation: Cesium.Quaternion.IDENTITY,
        position: Cesium.Cartesian3.fromDegrees(
            meta.longitude,
            meta.latitude
        )
    })

    // We need to add a location object to the geo object
    // to be able to calculate the distance between two objects
    geoObject.add(locationObject)

    return {
        initialized: false,
        meta,
        content,
        geoEntity,
        geoObject,
        locationObject
    }
}

// Limit amount of time between function calls to a function
export function throttle(fn: Function, ms: number): Function {
    let lastCall: number = 0
    return function() {
        const now: number = Date.now()

        if (lastCall + ms < now) {
            lastCall = now
            return fn.apply(this, arguments)
        }
    }
}

// Format distance into a more readable format
export function humanReadableDistance(d: number): string {
    // Kilometer
    if (d > 1000) {
        const km: number = d / 1000
        return `${km.toFixed(1)}km`
    }

    // Meter
    return `${Math.floor(d)}m`
}


// Fetch and setup location data for the cache from the API
export function setupLocationData(state: Object, cb: ?Function) {
    fetchLocationData(json => {
        state.locations = json.locations.map(location => {
            //  filter out content based on location id
            const content: string = json.content
                .filter(c => c.id === location.id)
                .reduce((_, c) => c.html, '')

            return setupLocation(location, content)
        })

        cb && cb(json)
    })
}

export function setupUserData(state: Object, cb: ?Function) {
    fetchUserData(userData => {
        state.userData = userData
        cb && cb(userData)
    })
}

// Calculate the rad of 'n'
export function rad(n: number): number {
    return n * Math.PI / 180;
}

// Returns the distance between to lat/lng points
export function calculateDistance(p1: Object, p2: Object): number {
    // Earth’s mean radius in meter
    const R: number = 6378137
    const dLat: number = rad(p2.lat - p1.lat)
    const dLong: number = rad(p2.lng - p1.lng)
    const a: number = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2)
    const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d: number = R * c
    return d
}

