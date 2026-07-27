import '@fontsource/urbanist/400.css'
import '@fontsource/urbanist/700.css'
import '@fontsource/urbanist/900.css'
import 'lenis/dist/lenis.css'
import './style.css'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initScene } from './scene'

gsap.registerPlugin(ScrollTrigger)

// --- Smooth scroll (Lenis) driving GSAP's ticker/ScrollTrigger ---
const lenis = new Lenis({
  duration: 1.1,
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// --- Preloader ---
window.addEventListener('load', () => {
  document.body.classList.remove('is-loading')
  document.body.classList.add('is-loaded')

  gsap.to('.preloader', {
    autoAlpha: 0,
    duration: 0.6,
    delay: 0.2,
    onComplete: () => {
      document.querySelector('.preloader')?.remove()
      playHeroIntro()
    },
  })
})

// --- Hero intro (runs once, on load) ---
function playHeroIntro() {
  gsap.from('#hero .reveal', {
    y: 24,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
  })
}

// --- Scroll-triggered reveals for everything outside the hero ---
document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
  if (el.closest('#hero')) return
  gsap.from(el, {
    y: 30,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
    },
  })
})

// --- Header background fades in once you scroll past the hero ---
ScrollTrigger.create({
  trigger: '#about',
  start: 'top top',
  onEnter: () => document.querySelector('.site-header')?.classList.add('is-scrolled'),
  onLeaveBack: () => document.querySelector('.site-header')?.classList.remove('is-scrolled'),
})

// --- Footer year ---
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

// --- 3D story: desk scene -> character -> hologram, driven by scroll through #story ---
const canvas = document.getElementById('webgl-scene') as HTMLCanvasElement | null
const backdrop = document.getElementById('scene-backdrop')
if (canvas) {
  initScene(canvas).then(({ setProgress }) => {
    canvas.classList.add('is-ready')

    ScrollTrigger.create({
      trigger: '#story',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress)
        if (backdrop) {
          // Synced to the desk fade (scene.ts) so the world dims at the same
          // moment the desk leaves, instead of drifting independently.
          const t = gsap.utils.clamp(0, 1, (self.progress - 0.05) / 0.27)
          backdrop.style.backgroundColor = gsap.utils.interpolate('#f4e3ca', '#0a1633', t)
        }
      },
    })

    // Fade the 3D canvas out once the scroll narrative ends and normal sections begin.
    ScrollTrigger.create({
      trigger: '#work',
      start: 'top bottom',
      end: 'top 60%',
      scrub: true,
      onUpdate: (self) => {
        canvas.style.opacity = String(1 - self.progress)
      },
    })
  })
}
