export const soundPacks = [
  {
    id: 'eg-oreo',
    name: 'EG Oreo',
    type: 'single',
    configUrl: 'https://raw.githubusercontent.com/hainguyents13/mechvibes/main/src/audio/eg-oreo/config.json',
    audioUrl: 'https://raw.githubusercontent.com/hainguyents13/mechvibes/main/src/audio/eg-oreo/oreo.ogg'
  },
  {
    id: 'box-jade',
    name: 'Box Jade',
    type: 'single',
    configUrl: 'https://raw.githubusercontent.com/23jmo/typr/main/public/sounds/boxjade/config.json',
    audioUrl: 'https://raw.githubusercontent.com/23jmo/typr/main/public/sounds/boxjade/boxjade.ogg'
  },
  {
    id: 'nk-cream',
    name: 'NK Cream',
    type: 'multi',
    configUrl: 'https://raw.githubusercontent.com/hainguyents13/mechvibes/main/src/audio/nk-cream/config.json',
    baseUrl: 'https://raw.githubusercontent.com/hainguyents13/mechvibes/main/src/audio/nk-cream/'
  }
]

const scanCodes = {
  Escape: 1,
  Digit1: 2,
  Digit2: 3,
  Digit3: 4,
  Digit4: 5,
  Digit5: 6,
  Digit6: 7,
  Digit7: 8,
  Digit8: 9,
  Digit9: 10,
  Digit0: 11,
  Minus: 12,
  Equal: 13,
  Backspace: 14,
  Tab: 15,
  KeyQ: 16,
  KeyW: 17,
  KeyE: 18,
  KeyR: 19,
  KeyT: 20,
  KeyY: 21,
  KeyU: 22,
  KeyI: 23,
  KeyO: 24,
  KeyP: 25,
  BracketLeft: 26,
  BracketRight: 27,
  Enter: 28,
  ControlLeft: 29,
  KeyA: 30,
  KeyS: 31,
  KeyD: 32,
  KeyF: 33,
  KeyG: 34,
  KeyH: 35,
  KeyJ: 36,
  KeyK: 37,
  KeyL: 38,
  Semicolon: 39,
  Quote: 40,
  Backquote: 41,
  ShiftLeft: 42,
  Backslash: 43,
  KeyZ: 44,
  KeyX: 45,
  KeyC: 46,
  KeyV: 47,
  KeyB: 48,
  KeyN: 49,
  KeyM: 50,
  Comma: 51,
  Period: 52,
  Slash: 53,
  ShiftRight: 54,
  NumpadMultiply: 55,
  AltLeft: 56,
  Space: 57,
  CapsLock: 58,
  F1: 59,
  F2: 60,
  F3: 61,
  F4: 62,
  F5: 63,
  F6: 64,
  F7: 65,
  F8: 66,
  F9: 67,
  F10: 68,
  NumLock: 69,
  ScrollLock: 70,
  Numpad7: 71,
  Numpad8: 72,
  Numpad9: 73,
  NumpadSubtract: 74,
  Numpad4: 75,
  Numpad5: 76,
  Numpad6: 77,
  NumpadAdd: 78,
  Numpad1: 79,
  Numpad2: 80,
  Numpad3: 81,
  Numpad0: 82,
  NumpadDecimal: 83,
  F11: 87,
  F12: 88
}

let context = null
const cache = new Map()
const loading = new Map()

function getContext() {
  if (context) return context
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  context = new AudioContext()
  return context
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'force-cache' })
  if (!response.ok) throw new Error(`Soundpack config failed: ${response.status}`)
  return response.json()
}

async function fetchBuffer(url, audioContext) {
  const response = await fetch(url, { cache: 'force-cache' })
  if (!response.ok) throw new Error(`Soundpack audio failed: ${response.status}`)
  const bytes = await response.arrayBuffer()
  return audioContext.decodeAudioData(bytes.slice(0))
}

async function loadPack(pack) {
  const audioContext = getContext()
  if (!audioContext) throw new Error('Web Audio is not supported in this browser.')

  const config = await fetchJson(pack.configUrl)

  if (pack.type === 'single') {
    const buffer = await fetchBuffer(pack.audioUrl, audioContext)
    return { pack, config, buffer }
  }

  const filenames = [...new Set(Object.values(config.defines || {}).filter(value => typeof value === 'string' && value))]
  const decoded = new Map()

  await Promise.all(filenames.map(async filename => {
    const url = `${pack.baseUrl}${encodeURIComponent(filename)}`
    const buffer = await fetchBuffer(url, audioContext)
    decoded.set(filename, buffer)
  }))

  return { pack, config, buffers: decoded }
}

export async function preloadSoundPack(id = 'eg-oreo') {
  if (cache.has(id)) return cache.get(id)
  if (loading.has(id)) return loading.get(id)

  const pack = soundPacks.find(item => item.id === id) || soundPacks[0]
  const promise = loadPack(pack)
    .then(loaded => {
      cache.set(pack.id, loaded)
      loading.delete(pack.id)
      return loaded
    })
    .catch(error => {
      loading.delete(pack.id)
      console.warn(`Wordspace: could not load ${pack.name}.`, error)
      throw error
    })

  loading.set(pack.id, promise)
  return promise
}

function startBuffer(audioContext, buffer, volume, offset = 0, duration) {
  if (!buffer) return
  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()
  gain.gain.value = Math.max(0, Math.min(1, Number(volume) || 0))
  source.buffer = buffer
  source.connect(gain)
  gain.connect(audioContext.destination)

  if (Number.isFinite(duration) && duration > 0) source.start(0, Math.max(0, offset), duration)
  else source.start(0, Math.max(0, offset))
}

export async function playKeySound(id, browserCode, volume = 0.35) {
  const scanCode = scanCodes[browserCode]
  if (!scanCode) return false

  try {
    const loaded = await preloadSoundPack(id)
    const audioContext = getContext()
    if (!audioContext) return false
    if (audioContext.state === 'suspended') await audioContext.resume()

    const definition = loaded.config?.defines?.[String(scanCode)]
    if (!definition) return false

    if (loaded.pack.type === 'single') {
      if (!Array.isArray(definition) || definition.length < 2) return false
      const [offsetMs, durationMs] = definition.map(Number)
      startBuffer(audioContext, loaded.buffer, volume, offsetMs / 1000, durationMs / 1000)
      return true
    }

    const buffer = loaded.buffers?.get(definition)
    if (!buffer) return false
    startBuffer(audioContext, buffer, volume)
    return true
  } catch {
    return false
  }
}
