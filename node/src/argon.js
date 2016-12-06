// @flow
import * as Argon from '@argonjs/argon'
import * as THREE from 'three'
import { CSS3DSprite } from './CSS3DArgon'
import { toFixed } from './utilities'

// Initialize stuff for argon
export function setupArgon(state: Object) {
    state.app.context.setDefaultReferenceFrame(state.app.context.localOriginEastUpSouth)
    state.scene.add(state.camera)
    state.scene.add(state.userLocation)
        
    // set pixel ratio (ex "2" for retina screens etc)
    state.renderer.setPixelRatio(window.devicePixelRatio)

    // append renderers to our app view
    state.app.view.element.appendChild(state.renderer.domElement)
    state.app.view.element.appendChild(state.cssRenderer.domElement)
    state.app.view.element.appendChild(state.hud.domElement)
}

// Setup a new location
export function setupLocation(meta: Object, content: string, state: Object): Object {
    // THREE.js 3D objects and a Cesium entity - these represents the location/pose
    let locationObject: Object = new THREE.Object3D()
    let geoObject: Object = new THREE.Object3D()
    let geoEntity: Object = new Argon.Cesium.Entity({
        name: meta.name,
        orientation: Argon.Cesium.Quaternion.IDENTITY,
        position: Argon.Cesium.Cartesian3.fromDegrees(
            meta.longitude,
            meta.latitude
        )
    })

    let label: Object = document.createElement('div')
    let p: Object = document.createElement('p')
    label.className = 'indicator-container'
    label.style.background = '#444444'
    label.style.padding = '15px'
    p.className = 'indicator'
    p.textContent = meta.position
    label.appendChild(p)

    state.locationIndicatorNode.appendChild(label)

    let labelObject: Object = new CSS3DSprite(label)
    labelObject.scale.set(0.02, 0.02, 0.02)
    labelObject.position.set(0, 1.25, 0)
    geoObject.add(labelObject)

    // We need to add a location object to the geo object
    // to be able to calculate the distance between two objects
    geoObject.add(locationObject)

    return {
        initialized: false,
        meta,
        content,
        geoEntity,
        geoObject,
        locationObject,
        labelObject
    }
}

/*
        if (hasLabel) {
            this.labelElement = this.createLabel(name)
            this.parentElement.appendChild(this.labelElement)
            this.labelObject = new CSS3DSprite(this.labelElement)
            this.labelObject.scale.set(0.02, 0.02, 0.02)
            this.labelObject.position.set(0, 1.25, 0)
            this.geoObject.add(this.labelObject)
        }

        this.geoObject.add(this.pointObject)

    createLabel(text) {
        let div = document.createElement('div')
        let p = document.createElement('p')

        p.className = 'point-text'
        p.textContent = text

        div.className = 'point-container'
        div.appendChild(p)

        return div
    }

    renderEventFunc() {
        const viewport = this.app.view.getViewport()
        let subviews = this.app.view.getSubviews()

        const monoMode = subviews.length === 1

        this.renderer.setSize(viewport.width, viewport.height)
        this.cssRenderer.setSize(viewport.width, viewport.height)
        this.hud.setSize(viewport.width, viewport.height)

        for (let subview of subviews) {
            let frustum = subview.frustum

            this.camera.position.copy(subview.pose.position)
            this.camera.quaternion.copy(subview.pose.orientation)

            // log(toFixed(this.camera.getWorldDirection(this.direction).y, 4))
            // log(toFixed(this.camera.getWorldDirection(this.direction).y, 4) < -0.75 ? 'tittar ner' : 'tittar upp')

            this.camera.projectionMatrix.fromArray(subview.projectionMatrix)

            let { x, y, width, height } = subview.viewport

            this.camera.fov = THREE.Math.radToDeg(frustum.fovy)

            this.cssRenderer.setViewport(x, y, width, height, subview.index)
            this.cssRenderer.render(this.scene, this.camera, subview.index)

            this.renderer.setViewport(x, y, width, height)
            this.renderer.setScissor(x, y, width, height)
            this.renderer.setScissorTest(true)
            this.renderer.render(this.scene, this.camera)

            // if monoMode...

            this.hud.setViewport(x, y, width, height, subview.index)
            this.hud.render(subview.index)
        }
    }

    app.renderEvent.addEventListener(() => {
        // only schedule a new callback if the old one has completed
        if (!rAFpending) {
            rAFpending = true;
            viewport = app.view.getViewport();
            subViews = app.view.getSubviews();
            window.requestAnimationFrame(renderFunc);
        }
    });
*/

// Calculate distance between two 3D objects (THREE)
export function getDistanceFromUser(user: Object, location: Object): number {
    const userPos: Object = user.getWorldPosition()
    const locationPos: Object = location.locationObject.getWorldPosition()
    const distance: number = userPos.distanceTo(locationPos)
    return toFixed(distance, 2)
}

// Handles the update of user and _one_ location position
export function updateUserAndLocationPosition(state: Object, id: number, cb: Function): Function {
    const {
        app,
        scene,
        userLocation,
        locations
    } = state

    return (frame: Object) => {
        // Update user position
        const userPose: Object = app.context.getEntityPose(app.context.user)

        if (!(userPose.poseStatus & Argon.PoseStatus.KNOWN)) {
            return
        }

        // Update user position for the 3D Object
        userLocation.position.copy(userPose.position)

        // Update position for all locations
        locations.filter(l => l.meta.id == id).forEach(location => {
            // Initialize location for Argon as a reference frame
            if (!location.initialized) {
                if (Argon.convertEntityReferenceFrame(location.geoEntity, frame.time, Argon.Cesium.ReferenceFrame.FIXED)) {
                    location.initialized = true
                    scene.add(location.geoObject) 
                }
            }
            
            // Update geo position
            const locationPose: Object = app.context.getEntityPose(location.geoEntity)
            location.geoObject.position.copy(locationPose)
            location.geoObject.quaternion.copy(locationPose)

            // Send distance to callback
            cb && cb(getDistanceFromUser(userLocation, location))
        })
    }
}

export function renderArgon(state: Object): Function {
    const {
        app,
        camera,
        scene,
        renderer,
        cssRenderer
    } = state

    return () => {
        const viewport = app.view.getViewport()
        const subviews = app.view.getSubviews()

        renderer.setSize(viewport.width, viewport.height)
        cssRenderer.setSize(viewport.width, viewport.height)

        for (let subview of subviews) {
            camera.position.copy(subview.pose.position)
            camera.quaternion.copy(subview.pose.orientation)
            camera.projectionMatrix.fromArray(subview.projectionMatrix)

            const { x, y, width, height } = subview.viewport

            camera.fov = THREE.Math.radToDeg(subview.frustum.fovy)

            cssRenderer.setViewport(x, y, width, height, subview.index)
            cssRenderer.render(scene, camera, subview.index)

            renderer.setViewport(x, y, width, height)
            renderer.setScissor(x, y, width, height)
            renderer.setScissorTest(true)
            renderer.render(scene, camera)
        }
    }
}
