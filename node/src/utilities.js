// @flow

import { Object3D } from 'three'
import { Cesium } from '@argonjs/argon'

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
    return {
        meta,
        content,
        initialized: false,
        geoObject: new Object3D(),
        geoEntity: new Cesium.Entity({
            name: meta.name,
            orientation: Cesium.Quaternion.IDENTITY,
            position: Cesium.Cartesian3.fromDegrees(
                meta.longitude,
                meta.latitude
            )
        })
    }
}
