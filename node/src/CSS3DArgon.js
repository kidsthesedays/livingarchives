// @flow
/**
* @author mrdoob / http://mrdoob.com/
* @author blairmacintyre / http://blairmacintyre.me/
*
* Usage:
* ======
* 
* import {
*     CSS3DArgonHUD,
*     CSS3DArgonRenderer,
*     CSS3DObject,
*     CSS3DSprite
* } from './path/to/CSS3DArgon'
*
**/

import * as THREE from 'three'

export class CSS3DArgonHUD {

    viewWidth: Array<number>
    viewHeight: Array<number>
    domElement: Object
    hudElements: Array<Object>

    constructor(props: Object = {}) {
        this.viewWidth = []
        this.viewHeight = []

        this.domElement = props.domElement || document.createElement('div')
        this.domElement.style.pointerEvents = props.pointerEvents || 'auto'

        this.hudElements = []

        this.hudElements[0] = this.createHudElement()
        this.domElement.appendChild(this.hudElements[0])

        this.hudElements[1] = this.createHudElement()
        this.domElement.appendChild(this.hudElements[1])
    }

    createHudElement() {
        let div = document.createElement('div')
        // Starts off as hidden
        div.style.display = 'none'
        div.style.position = 'absolute'
        div.style.overflow = 'hidden'
        return div
    }

    appendChild(firstElement: Object, secondElement: Object) {
        secondElement = secondElement || firstElement.cloneNode(true)
        this.hudElements[0].appendChild(firstElement)
        this.hudElements[1].appendChild(secondElement)
    }

    setViewport(x: number, y: number, width: number, height: number, side: number) {
        this.hudElements[side].style.display = 'inline-block'
        this.hudElements[side].style.top = `${y}px`
        this.hudElements[side].style.left = `${x}px`
        this.hudElements[side].style.width = `${width}px`
        this.hudElements[side].style.height = `${height}px`

        this.viewWidth[side] = width
        this.viewHeight[side] = height
    }

    showViewport(side: number) {
        this.hudElements[side].style.display = 'inline-block'
    }

    hideViewport(side: number) {
        this.hudElements[side].style.display = 'none'
    }

    setSize(width: number, height: number) {
        // Size of overall DOM
        this.domElement.style.width = `${width}px`
        this.domElement.style.height = `${height}px`
        // NOTE: Do not reset the subviews
        // Default viewports for left and right eyes
        this.hudElements[0].style.display = 'none'
        this.hudElements[1].style.display = 'none'
    }

    render(side: number) {
        this.hudElements[side].style.display = 'inline-block'
    }
}

export class CSS3DObject extends THREE.Object3D {
    constructor(element: Array<Object> | Object) {
        super()

        this.elements = []

        if (Array.isArray(element)) {
            this.elements = element.map(e => e)
        } else {
            this.elements[0] = element
            this.elements[1] = element.cloneNode(true)
        }

        this.elements.forEach(el => el.style.position = 'absolute')

        this.addEventListener('removed', e => {
            this.elements
                .filter(el => el.parentNode !== null)
                .forEach(el => {
                    // remove node
                    el.parentNode.removeChild(el)
                    // remove all children 
                    for (let i = 0; i < el.children.length; i++) {
                        el.children[i].dispatchEvent(e)
                    }
                })
        })
    }
}

export class CSS3DSprite extends CSS3DObject {
    constructor(element: Array<Object> | Object) {
        super(element)
    }
}

// based on CSS3DStereoRenderer in threejs.org github repo
export class CSS3DArgonRenderer {
    width: number
    height: number
    viewWidth: Array<number>
    viewHeight: Array<number>
    tempMatrix: Object
    tempMatrix2: Object
    cache: Object
    domElement: Object
    domElements: Array<Object>
    cameraElements: Array<Object>
    oldProjection: Object
    oldFOV: number
    eps: number
    projInv: Object
    fovStyle: string

    constructor() {
        // NOTE not used?
        // this.cameras = []
        this.width = 0
        this.height = 0
        this.viewWidth = []
        this.viewHeight = []

        this.tempMatrix = new THREE.Matrix4()
        this.tempMatrix2 = new THREE.Matrix4()

        this.cache = {
            camera: {
                fov: [],
                style: []
            },
            objects: []
        }

        this.domElement = document.createElement('div')
        this.domElement.style.pointerEvents = 'auto'

        this.domElements = []
        this.domElements[0] = this.createDOMElement(true)
        this.domElements[1] = this.createDOMElement(true)

        this.cameraElements = []
        this.cameraElements[0] = this.createDOMElement()
        this.cameraElements[1] = this.createDOMElement()

        this.domElement.appendChild(this.domElements[0])
        this.domElements[0].appendChild(this.cameraElements[0])
        this.domElement.appendChild(this.domElements[1])
        this.domElements[1].appendChild(this.cameraElements[1])

        this.oldProjection = new THREE.Matrix4()
        this.oldFOV = 0
        this.eps = 0.0000001
        this.projInv = new THREE.Matrix4()
    }

    createDOMElement(hidden: bool = false) {
        let div = document.createElement('div')

        if (hidden) {
            div.style.display = 'none'
            div.style.overflow = 'hidden'
            div.style.position = 'absolute'
            div.style.pointerEvents = 'auto'
        }

        // NOTE deprecated?
        // div.style.WebkitTransformStyle = 'preserve-3d'
        // div.style.MozTransformStyle = 'preserve-3d'
        // div.style.oTransformStyle = 'preserve-3d'
        div.style.transformStyle = 'preserve-3d'
        return div
    }

    setClearColor() {}

    setViewport(x: number, y: number, width: number, height: number, side: number = 0) {
        this.domElements[side].style.display = 'inline-block'
        this.domElements[side].style.top = `${y}px`
        this.domElements[side].style.left = `${x}px`
        this.domElements[side].style.width = `${width}px`
        this.domElements[side].style.height = `${height}px`

        this.cameraElements[side].style.width = `${width}px`
        this.cameraElements[side].style.height = `${height}px`

        this.viewWidth[side] = width
        this.viewHeight[side] = height
    }

    showViewport(side: number = 0) {
        this.domElements[side].style.display = 'inline-block'
    }

    hideViewport(side: number = 0) {
        this.domElements[side].style.display = 'none'
    }

    setSize(width: number, height: number) {
        this.domElement.style.width = `${width}px`
        this.domElement.style.height = `${height}px`

        let w = width / 2
        let h = height

        // Do not reset the subviews
        // Hide elements after setSize
        this.domElements[0].style.display = 'none'
        this.domElements[0].style.top = `${0}px`
        this.domElements[0].style.left = `${0}px`
        this.domElements[0].style.width = `${w}px`
        this.domElements[0].style.height = `${h}px`

        this.cameraElements[0].style.width = `${w}px`
        this.cameraElements[0].style.height = `${h}px`

        this.domElements[1].style.display = 'none'
        this.domElements[1].style.top = `${0}px`
        this.domElements[1].style.left = `${w}px`
        this.domElements[1].style.width = `${w}px`
        this.domElements[1].style.height = `${h}px`

        this.cameraElements[1].style.width = `${w}px`
        this.cameraElements[1].style.height = `${h}px`
    }

    toFixed(value: number, precision: number = 0) {
        const pow = Math.pow(10, precision)
        return String(Math.round(value * pow) / pow)
    }

    epsilon(value: number) {
        return this.toFixed(value, 6)
    }

    getCameraCSSMatrix(m: Object) {
        let matrix = this.tempMatrix2
        matrix.copy(m)
        matrix.multiplyScalar(100)

        // We dont want the lower corner to be scaled, just the rest
        matrix.elements[15] = m.elements[15]

        const elements = matrix.elements

        const params = [
            this.epsilon(elements[0]),
            this.epsilon(-elements[1]),
            this.epsilon(elements[2]),
            this.epsilon(elements[3]),
            this.epsilon(elements[4]),
            this.epsilon(-elements[5]),
            this.epsilon(elements[6]),
            this.epsilon(elements[7]),
            this.epsilon(elements[8]),
            this.epsilon(-elements[9]),
            this.epsilon(elements[10]),
            this.epsilon(elements[11]),
            this.epsilon(elements[12]),
            this.epsilon(-elements[13]),
            this.epsilon(elements[14]),
            this.epsilon(elements[15])
        ].join(',')

        return `matrix3d(${params})`
    }

    getObjectCSSMatrix(m: Object) {
        let matrix = this.tempMatrix2
        matrix.copy(m)
        matrix.multiplyScalar(100)

        // We dont want the lower corner to be scaled, just the rest
        matrix.elements[15] = m.elements[15]

        const elements = matrix.elements

        const params = [
            this.epsilon(elements[0]),
            this.epsilon(elements[1]),
            this.epsilon(elements[2]),
            this.epsilon(elements[3]),
            this.epsilon(-elements[4]),
            this.epsilon(-elements[5]),
            this.epsilon(-elements[6]),
            this.epsilon(-elements[7]),
            this.epsilon(elements[8]),
            this.epsilon(elements[9]),
            this.epsilon(elements[10]),
            this.epsilon(elements[11]),
            this.epsilon(elements[12]),
            this.epsilon(elements[13]),
            this.epsilon(elements[14]),
            this.epsilon(elements[15])
        ].join(',')

        return `translate3d(-50%, -50%, 0) matrix3d(${params})`
    }

    renderObject(object: Object, camera: Object, cameraElement: Object, side: number, visible: bool) {
        visible = visible && object.visible

        if (object instanceof CSS3DObject) {
            let element = object.elements[side]

            if (visible === false) {
                element.style.display = 'none'
            } else {
                element.style.display = 'inline-block'
            }

            let style = undefined

            if (object instanceof CSS3DSprite) {
                // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/
                let matrix = this.tempMatrix
                matrix.copy(camera.matrixWorldInverse)
                matrix.transpose()
                matrix.copyPosition(object.matrixWorld)
                matrix.scale(object.scale)

                matrix.elements[3] = 0
                matrix.elements[7] = 0
                matrix.elements[11] = 0
                matrix.elements[15] = 1

                style = this.getObjectCSSMatrix(matrix)
            } else {
                style = this.getObjectCSSMatrix(object.matrixWorld)
            }

            // NOTE deprecated?
            // element.style.WebkitTransform = style
            // element.style.MozTransform = style
            // element.style.oTransform = style
            element.style.transform = style

            if (element.parentNode !== cameraElement) {
                cameraElement.appendChild(element)
            }
        }

        // we can't short circuit this, because we have to
        // make sure we clear all the children of this 
        // if (!object.visible) return
        for (let i = 0, len = object.children.length; i < len; i++) {
            this.renderObject(object.children[i], camera, cameraElement, side, visible)
        }
    }

    render(scene: Object, camera: Object, side: number) {
        scene.updateMatrixWorld()

        if (camera.parent === null) {
            camera.updateMatrixWorld()
        }

        const fov = this.toFixed(
            0.5 / Math.tan(THREE.Math.degToRad(camera.fov * 0.5)) * this.viewHeight[side],
            2
        )

        this.fovStyle = fov

        if (this.cache.camera.fov[side] !== fov) {
            // NOTE deprecated?
            // this.domElements[side].style.WebkitPerspective = `${fov}px`
            // this.domElements[side].style.MozPerspective = `${fov}px`
            // this.domElements[side].style.oPerspective = `${fov}px`
            this.domElements[side].style.perspective = `${fov}px`
            this.cache.camera.fov[side] = fov
        }

        this.domElements[side].style.display = 'inline-block'

        camera.matrixWorldInverse.getInverse(camera.matrixWorld)

        let style = `translate3d(0, 0, ${fov}px)
            ${this.getCameraCSSMatrix(camera.matrixWorldInverse)}
            translate3d(
                ${this.toFixed(this.viewWidth[side] / 2, 4)}px,
                ${this.toFixed(this.viewHeight[side] / 2, 4)}px, 0)`

        if (this.cache.camera.style[side] !== style) {
            // NOTE deprecated?
            // this.cameraElements[side].style.WebkitTransform = style
            // this.cameraElements[side].style.MozTransform = style
            // this.cameraElements[side].style.oTransform = style
            this.cameraElements[side].style.transform = style
            this.cache.camera.style[side] = style
        }

        this.renderObject(scene, camera, this.cameraElements[side], side, scene.visible)
    }

    epsilonEquals(matrix: Object) {
        let te = this.oldProjection.elements
        let me = matrix.elements

        for (let i = 0; i < 16; i++) {
            if (Math.abs(te[i] - me[i]) > this.eps) {
                this.oldProjection.copy(matrix)
                return false
            }
        }

        return true
    }

    applyProjection(x: number, y: number, matrix: Object) {
        let e = matrix.elements
        // Any depth will do, just use the middle of the canonical depth space
        let z = 0.5
        // For the perspective divide
        let d = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]) 
        // Do the minimal math
        let nx = (e[0] * x + e[4] * y + e[8] * z + e[12]) * d
        let ny = (e[1] * x + e[5] * y + e[9] * z + e[13]) * d
        let nz = (e[2] * x + e[6] * y + e[10] * z + e[14]) * d

        let len = Math.sqrt(nx * nx + ny * ny + nz * nz)
        return [nx / len, ny / len, nz / len]
    }

    angleBetween(v1: Array<number>, v2: Array<number>) {
        // v1 and v2 are normalized above
        let dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
        // Clamp, to handle numerical problems
        let theta = Math.max(-1, Math.min(1, dot))

        return Math.acos(theta)
    }

    updateCameraFOVFromProjection(camera: Object) {
        let projection = camera.projectionMatrix

        // If its different from what it was, update FOV
        if (!this.epsilonEquals(projection)) {
            // console.log(`get FOV: projection={${projection[0]}, ${projection[1]}, ...}`)
            this.projInv.getInverse(camera.projectionMatrix)

            let v1 = this.applyProjection(0, 1, this.projInv)
            let v2 = this.applyProjection(0, -1, this.projInv)
            // console.log(`get FOV: v1={${v1[0]}, ${v1[1]}, ${v1[2]}}`)
            // console.log(`get FOV: v2={${v2[0]}, ${v2[1]}, ${v2[2]}}`)

            this.oldFOV = this.angleBetween(v1, v2) * 180 / Math.PI
            camera.fov = this.oldFOV
        }
    }
}
