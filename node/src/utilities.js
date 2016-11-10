// @flow

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
