// @flow

import { Object3D } from 'three'
import { Cesium } from '@argonjs/argon'
import { fetchLocationData } from './cache'

// Format floating points
export function toFixed(value: number, precision: number = 0): number {
    const p: number = Math.pow(10, precision)
    return Math.round(value * p) / p
}

// Creates a GUID based on several different browser variables
// It wont be compliant with RFC4122 but hopefully good enough
export function guid(): string {
    const nav: Object = window.navigator
    const screen: Object = window.screen

    return [
        nav.mimeTypes.length,
        nav.userAgent.replace(/D+/g, ''),
        nav.plugins.length,
        screen.height || '',
        screen.width || '',
        screen.pixelDepth || ''
    ].join('')
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

export function humanReadableDistance(d: number): string {
    // Kilometer
    if (d > 1000) {
        const km: number = d / 1000
        return `${km.toFixed(1)}km`
    }

    // Meter
    return `${d}m`
}

export function setupLocationData(state: Object, cb: Function) {
    fetchLocationData(json => {
        state.locations = json.locations.map(location => {
            //  filter out content based on location id
            const content: string = json.content
                .filter(c => c.id === location.id)
                .reduce((_, c) => c.html, '')

            return setupLocation(location, content)
        })

        cb()
    })
}

// export function rad(x) {
//     return x * Math.PI / 180;
// }
// 
// export function getDistance(p1, p2) {
//     var R = 6378137; // Earth’s mean radius in meter
//     var dLat = rad(p2.lat() - p1.lat());
//     var dLong = rad(p2.lng() - p1.lng());
//     var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
//         Math.sin(dLong / 2) * Math.sin(dLong / 2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     var d = R * c;
//     return d; // returns the distance in meter
// }
