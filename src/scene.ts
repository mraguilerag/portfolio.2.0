import * as THREE from 'three'

// --- Palette (original, not derived from any reference site) ---
const SKIN = 0xf2c9a5
const HAIR = 0xe3bd66
const EYE = 0x6b7280
const SHIRT = 0x5b8a8f
const PANTS = 0x2e2e35
const SHOES = 0xf5f5f5
const DESK_TOP = 0xe9e2d6
const DESK_LEG = 0xffffff
const MONITOR_BODY = 0x24262b
const MONITOR_SCREEN = 0x3a6ea5
const CHAIR = 0xffffff
const PLANT_POT = 0xb5651d
const PLANT_LEAF = 0x4c8c5a
const RUG = 0xe08a3c
const GLOW = 0x4fd7ff

function makeGlowTexture(): THREE.Texture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(79, 215, 255, 0.9)')
  gradient.addColorStop(0.5, 'rgba(79, 215, 255, 0.35)')
  gradient.addColorStop(1, 'rgba(79, 215, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

interface Character {
  root: THREE.Group
  hips: THREE.Group
  leftArm: THREE.Group
  rightArm: THREE.Group
  leftLeg: THREE.Group
  rightLeg: THREE.Group
  head: THREE.Group
  meshes: THREE.Mesh[]
  standardMaterials: THREE.MeshStandardMaterial[]
}

function buildCharacter(): Character {
  const root = new THREE.Group()
  const meshes: THREE.Mesh[] = []
  const standardMaterials: THREE.MeshStandardMaterial[] = []

  function mat(color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra })
    standardMaterials.push(m)
    return m
  }

  const hips = new THREE.Group()
  hips.position.y = 0.72
  root.add(hips)

  // Torso — kept small relative to the head for a friendly, chibi proportion.
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.24, 4, 8), mat(SHIRT))
  torso.position.y = 0.33
  hips.add(torso)
  meshes.push(torso)

  // Head
  const head = new THREE.Group()
  head.position.y = 0.66
  hips.add(head)

  const face = new THREE.Mesh(new THREE.SphereGeometry(0.29, 20, 16), mat(SKIN))
  head.add(face)
  meshes.push(face)

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.305, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(HAIR))
  hair.position.y = 0.04
  head.add(hair)
  meshes.push(hair)

  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mat(HAIR))
  hairBack.position.set(0, -0.04, -0.06)
  hairBack.scale.set(1, 1.15, 0.85)
  head.add(hairBack)
  meshes.push(hairBack)

  const eyeGeo = new THREE.SphereGeometry(0.032, 10, 10)
  const eyeMat = mat(EYE)
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
  leftEye.position.set(-0.1, 0, 0.26)
  head.add(leftEye)
  meshes.push(leftEye)
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
  rightEye.position.set(0.1, 0, 0.26)
  head.add(rightEye)
  meshes.push(rightEye)

  // Arms
  function buildArm(side: number) {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.21, 0.42, 0)
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.22, 4, 8), mat(SKIN))
    arm.position.y = -0.16
    pivot.add(arm)
    meshes.push(arm)
    hips.add(pivot)
    return pivot
  }
  const leftArm = buildArm(-1)
  const rightArm = buildArm(1)

  // Legs
  function buildLeg(side: number) {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.11, 0, 0)
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.45, 4, 8), mat(PANTS))
    leg.position.y = -0.31
    pivot.add(leg)
    meshes.push(leg)
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.19), mat(SHOES))
    shoe.position.set(0, -0.655, 0.045)
    pivot.add(shoe)
    meshes.push(shoe)
    hips.add(pivot)
    return pivot
  }
  const leftLeg = buildLeg(-1)
  const rightLeg = buildLeg(1)

  return { root, hips, leftArm, rightArm, leftLeg, rightLeg, head, meshes, standardMaterials }
}

function buildDesk(): THREE.Group {
  const group = new THREE.Group()

  function mat(color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...extra })
  }

  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.03, 32), mat(RUG))
  rug.position.y = 0
  group.add(rug)

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.7), mat(DESK_TOP))
  deskTop.position.set(0, 0.75, -0.3)
  group.add(deskTop)

  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8)
  const legPositions: [number, number][] = [
    [-0.68, -0.6],
    [0.68, -0.6],
    [-0.68, 0],
    [0.68, 0],
  ]
  for (const [x, z] of legPositions) {
    const leg = new THREE.Mesh(legGeo, mat(DESK_LEG))
    leg.position.set(x, 0.375, z)
    group.add(leg)
  }

  const monitorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), mat(DESK_LEG))
  monitorArm.position.set(0, 0.88, -0.5)
  group.add(monitorArm)

  const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.03), mat(MONITOR_BODY))
  monitorBody.position.set(0, 1.1, -0.52)
  group.add(monitorBody)

  const monitorScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.34),
    mat(MONITOR_SCREEN, { emissive: MONITOR_SCREEN, emissiveIntensity: 0.5 }),
  )
  monitorScreen.position.set(0, 1.1, -0.5)
  group.add(monitorScreen)

  // Chair
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), mat(CHAIR))
  seat.position.set(0, 0.5, 0.1)
  group.add(seat)
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.06), mat(CHAIR))
  back.position.set(0, 0.8, -0.13)
  group.add(back)
  const chairLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8)
  const chairLegPositions: [number, number][] = [
    [-0.2, -0.1],
    [0.2, -0.1],
    [-0.2, 0.3],
    [0.2, 0.3],
  ]
  for (const [x, z] of chairLegPositions) {
    const leg = new THREE.Mesh(chairLegGeo, mat(CHAIR))
    leg.position.set(x, 0.25, z)
    group.add(leg)
  }

  // Plant
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 12), mat(PLANT_POT))
  pot.position.set(-0.55, 0.82, -0.4)
  group.add(pot)
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat(PLANT_LEAF))
  leaves.position.set(-0.55, 0.96, -0.4)
  leaves.scale.set(1, 1.3, 1)
  group.add(leaves)

  return group
}

export async function initScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  scene.add(new THREE.AmbientLight(0xffffff, 1.1))
  const key = new THREE.DirectionalLight(0xffffff, 1.4)
  key.position.set(4, 6, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x8ab4ff, 0.7)
  rim.position.set(-4, 3, -4)
  scene.add(rim)

  // --- Desk (positioned to the right of the character, seated at it initially) ---
  const desk = buildDesk()
  const deskOffset = new THREE.Vector3(0.55, 0, -0.15)
  desk.position.copy(deskOffset)
  scene.add(desk)

  // --- Character ---
  const character = buildCharacter()
  scene.add(character.root)

  // --- Grounded glow (appears to emanate from the character, not a floating shape) ---
  const glowTexture = makeGlowTexture()
  const glowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  glowDisc.rotation.x = -Math.PI / 2
  glowDisc.position.y = 0.005
  scene.add(glowDisc)

  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({ color: GLOW, transparent: true, opacity: 0 }),
  )
  glowRing.rotation.x = -Math.PI / 2
  glowRing.position.y = 0.01
  scene.add(glowRing)

  // --- Camera framing ---
  // The rig is ~2.1 units tall; these distances keep it comfortably inside
  // frame (roughly half the viewport height) instead of filling/clipping it.
  const heroCamPos = new THREE.Vector3(1.1, 1.5, 5.4)
  const heroCamTarget = new THREE.Vector3(0.3, 0.95, -0.2)
  const aboutCamPos = new THREE.Vector3(0, 1.3, 6.4)
  const aboutCamTarget = new THREE.Vector3(0, 0.95, 0)

  camera.position.copy(heroCamPos)
  camera.lookAt(heroCamTarget)

  // Off-axis shift: pushes the rendered image right so the 3D scene clears
  // the left-aligned text instead of sitting dead-center under it. Kept
  // modest so the character never runs off the right edge once it scales up.
  const HORIZONTAL_SHIFT = 0.32

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.setViewOffset(w * (1 + HORIZONTAL_SHIFT), h, 0, 0, w, h)
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  // --- Pose helpers (procedural, no baked animation clips) ---
  const SIT = { leg: -1.35, arm: -1.15, hipsY: 0.44 }
  const STAND = { leg: 0, arm: -0.08, hipsY: 0.72 }

  const clock = new THREE.Clock()
  let elapsed = 0

  function render() {
    elapsed += clock.getDelta()

    const idleBob = Math.sin(elapsed * 1.6) * 0.012
    character.root.position.y = idleBob

    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
  render()

  function setProgress(t: number) {
    const clamped = Math.min(Math.max(t, 0), 1)

    // The transition is sequenced, not simultaneous, so no two things are
    // changing drastically at once: desk leaves -> she stands & walks in ->
    // glow grows at her feet -> wave. Freezing at any point should still read
    // as one coherent moment instead of two disconnected effects colliding.

    // 1) Desk sinks away and shrinks out first, while the camera just starts easing back.
    const deskOut = THREE.MathUtils.smoothstep(clamped, 0.05, 0.32)
    desk.position.y = deskOffset.y - deskOut * 1.2
    desk.scale.setScalar(1 - deskOut * 0.98)
    desk.visible = deskOut < 0.995

    // 2) Once the desk has cleared, she stands and walks to center.
    const standT = THREE.MathUtils.smoothstep(clamped, 0.3, 0.68)
    const legAngle = THREE.MathUtils.lerp(SIT.leg, STAND.leg, standT)
    const armAngle = THREE.MathUtils.lerp(SIT.arm, STAND.arm, standT)
    character.leftLeg.rotation.x = legAngle
    character.rightLeg.rotation.x = legAngle
    character.hips.position.y = THREE.MathUtils.lerp(SIT.hipsY, STAND.hipsY, standT)

    character.root.position.x = THREE.MathUtils.lerp(deskOffset.x - 0.15, 0, standT)
    character.root.position.z = THREE.MathUtils.lerp(deskOffset.z + 0.32, 0, standT)
    character.root.scale.setScalar(THREE.MathUtils.lerp(1, 1.25, standT))

    // Camera follows the same arc as the character, slightly ahead of it.
    const camT = THREE.MathUtils.smoothstep(clamped, 0.1, 0.72)
    camera.position.lerpVectors(heroCamPos, aboutCamPos, camT)
    const target = new THREE.Vector3().lerpVectors(heroCamTarget, aboutCamTarget, camT)
    camera.lookAt(target)

    // 3) Wave once she has arrived and the glow has mostly formed.
    const waveT = THREE.MathUtils.smoothstep(clamped, 0.88, 1)
    const armRestX = THREE.MathUtils.lerp(armAngle, -2.3, waveT)
    character.rightArm.rotation.x = armRestX
    character.rightArm.rotation.z = waveT > 0.01 ? Math.sin(elapsed * 6) * 0.25 * waveT : 0
    character.leftArm.rotation.x = armAngle

    // Glow: reveal grows from directly beneath the character's feet, tied to
    // its own position so it always reads as coming from the character.
    const glowT = THREE.MathUtils.smoothstep(clamped, 0.58, 0.92)
    glowDisc.position.x = character.root.position.x
    glowDisc.position.z = character.root.position.z
    glowRing.position.x = character.root.position.x
    glowRing.position.z = character.root.position.z
    const glowScale = 0.5 + glowT * 0.9
    glowDisc.scale.setScalar(glowScale)
    glowRing.scale.setScalar(glowScale)
    ;(glowDisc.material as THREE.MeshBasicMaterial).opacity = glowT * 0.8
    ;(glowRing.material as THREE.MeshBasicMaterial).opacity = glowT * 0.9
    glowRing.rotation.z += 0.003

    // Subtle cyan rim-light bleeds into the character as the glow ramps up.
    for (const m of character.standardMaterials) {
      m.emissive = new THREE.Color(GLOW)
      m.emissiveIntensity = glowT * 0.35
    }
  }

  setProgress(0)

  return { setProgress }
}
