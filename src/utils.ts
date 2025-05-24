import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class CharacterControls {

    map: Map<string, HTMLElement> = new Map()

    model: THREE.Group

    mixer: THREE.AnimationMixer
    animationsMap: Map<string, THREE.AnimationAction> = new Map() // Walk, Run, Idle

    orbitControl: OrbitControls
    camera: THREE.Camera


    // state

    toggleRun: boolean = true
    currentAction: string

    public up (key: string) {
        if (this.map.get(key.toLowerCase())) {
            this.map.get(key.toLowerCase()).style.color = 'blue'
        }
    }
}

// Константы для клавиш
export const W = 'w';
export const A = 'a';
export const S = 's';
export const D = 'd';
export const SHIFT = 'shift';
export const DIRECTIONS = [W, A, S, D];

// Обработчики клавиш
export function keyDown(e: KeyboardEvent, keysPressed: any) {
  if (DIRECTIONS.includes(e.key.toLowerCase()) || e.key.toLowerCase() === SHIFT) {
    keysPressed[e.key.toLowerCase()] = true;
  }
}

export function keyUp(e: KeyboardEvent, keysPressed: any) {
  if (DIRECTIONS.includes(e.key.toLowerCase()) || e.key.toLowerCase() === SHIFT) {
    keysPressed[e.key.toLowerCase()] = false;
  }
}
