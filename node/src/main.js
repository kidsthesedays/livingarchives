// @flow

// import {
//     CSS3DArgonHUD
// } from './CSS3DArgon'

const a: number = 12
const b: number = 2

console.log(a * b)

console.log('Hello')

for (let i = 0, x = 0; i > 5; i++) {
    console.log(i, x)
}

/**
 * @function _guid
 * @description Creates GUID for user based on several different browser variables
 * It will never be RFC4122 compliant but it is robust
 * @returns {Number}
 * @private
 **/
// var guid = function() {
// 
//     var nav = window.navigator;
//     var screen = window.screen;
//     var guid = nav.mimeTypes.length;
//     guid += nav.userAgent.replace(/\D+/g, '');
//     guid += nav.plugins.length;
//     guid += screen.height || '';
//     guid += screen.width || '';
//     guid += screen.pixelDepth || '';
// 
//     return guid;
// };
// var doNotTrack = function () {
// 
//     if (!window.navigator.userAgent.match(/MSIE\s10\.0|trident\/6\.0/i)) {
//         return window.navigator.doNotTrack || window.navigator.msDoNotTrack;
//     }
// };
