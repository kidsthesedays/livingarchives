// @flow
// declare var Argon
// import * as Argon from '@argonjs/argon'
import * as THREE from 'three'

// Setup argon
export function setupArgon(state: Object) {
    state.app = Argon.init()
    state.app.reality.setDesired({
        title: 'Panorama',
        uri: Argon.resolveURL('/static/reality/panorama.html')
    })

    state.app.reality.connectEvent.addEventListener(session => {
        if (session.supportsProtocol('single.panorama')) {
            state.realitySession = session
        }
    })

    const showPanorama = () => {
        let ready = false

        const loadPanorama = panorama => {
            if (ready || 'realitySession' in state) {
                ready = true
                state.realitySession.request('single.panorama.showPanorama', panorama)
            } else {
                console.log('Retrying to fetch panorama')
                setTimeout(() => loadPanorama(panorama), 200)
            }
        }

        return loadPanorama
    }

    state.showPanorama = showPanorama()
}

export function loadPanorama(state: Object, panorama: Object) {
    const {
        loader,
        eyeEntity,
        userLocation
    } = state

    let entity = new Argon.Cesium.Entity

    if (Argon.Cesium.defined(panorama.latitude) && Argon.Cesium.defined(panorama.longitude)) {
        const positionProperty = new Argon.Cesium.ConstantPositionProperty()
        const positionValue = Argon.Cesium.Cartesian3.fromDegrees(
            panorama.longitude,
            panorama.latitude,
            panorama.height || 0
        )

        positionProperty.setValue(positionValue, Argon.Cesium.ReferenceFrame.FIXED)

        const orientationProperty = new Argon.Cesium.ConstantProperty()
        const orientationValue = Argon.Cesium.Transforms.headingPitchRollQuaternion(
            positionValue,
            0,
            0,
            0
        )

        orientationProperty.setValue(orientationValue)

        entity.position = positionProperty
        entity.orientation = orientationProperty

        loader.load(panorama.src, texture => {
            texture.minFilter = THREE.LinearFilter

            const sphereGeometry = new THREE.SphereGeometry(100, 32, 32)
            const meshBasicMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 })
            const mesh = new THREE.Mesh(sphereGeometry, meshBasicMaterial)

            userLocation.add(mesh)
            // meshBasicMaterial.transparent = true

            eyeEntity.position = new Argon.Cesium.ConstantPositionProperty(
                Argon.Cesium.Cartesian3.ZERO,
                entity
            )

            mesh.scale.set(-1, 1, 1)
            // mesh.material.opacity = 0
            // Fade in with tween
            //
        })
    }
}

// Setup a new location
export function setupLocation(meta: Object, content: string): Object {
    return { initialized: false, meta, content }
}
