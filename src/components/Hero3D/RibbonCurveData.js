import * as THREE from 'three';
import { createBroadRibbonProfile, createStrandProfile } from './RibbonProfiles.js';

/**
 * Procedural ribbon configuration precisely matching the reference image:
 * - Thick, rounded, volumetric chrome bands (no flat paper sheets or cut-off ends)
 * - All ribbons extend well beyond the viewport frame on both ends
 * - Intertwined foreground and background sweeps with continuous parallel strand bundles
 * - Smooth physical cross-sections catching studio specular reflections
 */

export const RIBBON_CONFIGS = [
  // 1. Primary Foreground Broad Hero Ribbon
  // Sweeps from far off-screen top-left diagonally down across to bottom-right
  {
    id: 'hero-broad',
    type: 'broad',
    points: [
      new THREE.Vector3(-4.8, 3.2, -1.2),
      new THREE.Vector3(-2.8, 2.6, -0.2),
      new THREE.Vector3(-1.0, 1.8, 0.6),
      new THREE.Vector3(0.5, 0.8, 1.15),
      new THREE.Vector3(1.7, -0.2, 0.95),
      new THREE.Vector3(2.6, -1.4, 0.45),
      new THREE.Vector3(3.6, -2.6, -0.3),
      new THREE.Vector3(5.0, -3.8, -1.4),
    ],
    steps: 280,
    profile: createBroadRibbonProfile({
      width: 1.05,
      thickness: 0.26,
    }),
    twist: (t) => 0.35 + t * 0.85 + Math.sin(t * Math.PI) * 0.22,
    scale: (t) => 1.0 + Math.sin(t * Math.PI) * 0.22,
  },

  // 2. Upper Crest Broad Band
  // Arches high across the upper right behind the hero ribbon
  {
    id: 'crest-broad',
    type: 'broad',
    points: [
      new THREE.Vector3(-4.8, 0.6, -2.0),
      new THREE.Vector3(-2.8, 2.2, -0.8),
      new THREE.Vector3(-0.8, 3.0, -0.2),
      new THREE.Vector3(1.2, 2.8, -0.4),
      new THREE.Vector3(2.8, 1.8, -1.0),
      new THREE.Vector3(4.0, 0.4, -1.9),
      new THREE.Vector3(5.2, -0.8, -2.8),
    ],
    steps: 240,
    profile: createBroadRibbonProfile({
      width: 0.92,
      thickness: 0.22,
    }),
    twist: (t) => -0.25 + t * 0.75,
    scale: (t) => 0.95 + Math.sin(t * Math.PI) * 0.2,
  },

  // 3. Center Intertwining Broad Band
  // Sweeps from bottom-left through the center of the frame, passing under the hero ribbon
  {
    id: 'center-arch',
    type: 'broad',
    points: [
      new THREE.Vector3(-4.8, -2.6, -0.8),
      new THREE.Vector3(-2.6, -1.1, 0.2),
      new THREE.Vector3(-0.8, 0.1, 0.8),
      new THREE.Vector3(0.5, 0.4, 1.0),
      new THREE.Vector3(1.7, -0.1, 0.7),
      new THREE.Vector3(2.7, -1.1, 0.3),
      new THREE.Vector3(3.8, -2.3, -0.3),
      new THREE.Vector3(5.0, -3.4, -1.3),
    ],
    steps: 260,
    profile: createBroadRibbonProfile({
      width: 0.98,
      thickness: 0.24,
    }),
    twist: (t) => 0.55 + t * 0.82 + Math.sin(t * Math.PI) * 0.28,
    scale: (t) => 1.0 + Math.sin(t * Math.PI) * 0.2,
  },

  // 4. Slender Parallel Inner Strand A
  // Sleek continuous chrome cable extending all the way across along the upper curve
  {
    id: 'strand-inner-a',
    type: 'strand',
    points: [
      new THREE.Vector3(-4.8, -2.8, -0.4),
      new THREE.Vector3(-3.0, -1.0, 0.4),
      new THREE.Vector3(-1.4, 0.8, 0.9),
      new THREE.Vector3(0.0, 1.7, 0.9),
      new THREE.Vector3(1.4, 1.2, 0.5),
      new THREE.Vector3(2.6, 0.0, 0.2),
      new THREE.Vector3(3.8, -1.4, -0.4),
      new THREE.Vector3(5.0, -2.8, -1.2),
    ],
    steps: 240,
    profile: createStrandProfile({
      radius: 0.09,
    }),
    twist: (t) => t * 0.5,
    scale: () => 1.0,
  },

  // 5. Slender Parallel Inner Strand B
  // Continuous twin-rail companion to Strand A with tight parallel offset
  {
    id: 'strand-inner-b',
    type: 'strand',
    points: [
      new THREE.Vector3(-4.6, -2.6, -0.2),
      new THREE.Vector3(-2.8, -0.8, 0.6),
      new THREE.Vector3(-1.2, 1.0, 1.1),
      new THREE.Vector3(0.2, 1.9, 1.1),
      new THREE.Vector3(1.6, 1.4, 0.7),
      new THREE.Vector3(2.8, 0.2, 0.4),
      new THREE.Vector3(4.0, -1.2, -0.2),
      new THREE.Vector3(5.2, -2.6, -1.0),
    ],
    steps: 240,
    profile: createStrandProfile({
      radius: 0.08,
    }),
    twist: (t) => t * 0.55,
    scale: () => 1.0,
  },

  // 6. Slender Center Intertwining Strand
  // Flows alongside the center broad band right through the middle of the composition
  {
    id: 'strand-center',
    type: 'strand',
    points: [
      new THREE.Vector3(-4.6, -2.4, -0.4),
      new THREE.Vector3(-2.6, -0.8, 0.5),
      new THREE.Vector3(-1.0, 0.4, 1.0),
      new THREE.Vector3(0.3, 0.5, 1.1),
      new THREE.Vector3(1.6, 0.0, 0.8),
      new THREE.Vector3(2.8, -1.0, 0.4),
      new THREE.Vector3(4.0, -2.2, -0.2),
      new THREE.Vector3(5.0, -3.2, -1.2),
    ],
    steps: 230,
    profile: createStrandProfile({
      radius: 0.088,
    }),
    twist: (t) => 0.4 + t * 0.7,
    scale: () => 1.0,
  },

  // 7. Sweeping Lower Base Strand
  // Underneath the cascade, framing the bottom edge from off-screen to off-screen
  {
    id: 'strand-base',
    type: 'strand',
    points: [
      new THREE.Vector3(-4.8, -3.6, -0.4),
      new THREE.Vector3(-3.0, -2.2, 0.3),
      new THREE.Vector3(-1.2, -1.2, 0.6),
      new THREE.Vector3(0.8, -1.1, 0.4),
      new THREE.Vector3(2.4, -1.8, 0.0),
      new THREE.Vector3(3.8, -2.8, -0.6),
      new THREE.Vector3(5.0, -3.8, -1.4),
    ],
    steps: 210,
    profile: createStrandProfile({
      radius: 0.09,
    }),
    twist: (t) => 0.2 + t * 0.5,
    scale: () => 1.0,
  },
];
