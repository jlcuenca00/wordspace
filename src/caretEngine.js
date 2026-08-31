const caretAnimations = new WeakMap()
const lineAnimations = new WeakMap()
const lineOffsets = new WeakMap()

const DURATIONS = { off: 0, slow: 150, medium: 100, fast: 85 }
const EASING = 'cubic-bezier(.45,0,.55,1)'

function currentPosition(el, parent) {
  const a = el.getBoundingClientRect()
  const p = parent.getBoundingClientRect()
  return { left: a.left - p.left, top: a.top - p.top, width: a.width, height: a.height }
}

export function cancelCaretAnimation(caret) {
  const animation = caret && caretAnimations.get(caret)
  if (animation) animation.cancel()
  if (caret) caretAnimations.delete(caret)
}

export function moveCaret({ caret, text, target, speed = 'medium', style = 'beam', width = 2, animate = true }) {
  if (!caret || !text || !target) return

  const from = currentPosition(caret, text)
  const targetWidth = Math.max(1, target.getBoundingClientRect().width)
  const targetHeight = Math.max(1, target.getBoundingClientRect().height)
  const to = {
    left: target.offsetLeft,
    top: target.offsetTop,
    width: style === 'block' || style === 'outline' || style === 'underscore' ? targetWidth : width,
    height: style === 'underscore' ? 2 : targetHeight * 1.02,
  }

  cancelCaretAnimation(caret)

  caret.style.left = `${to.left}px`
  caret.style.top = `${to.top}px`
  caret.style.width = `${to.width}px`
  caret.style.height = `${to.height}px`

  const duration = animate ? (DURATIONS[speed] ?? DURATIONS.medium) : 0
  if (!duration || !caret.animate) return

  const animation = caret.animate([
    { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
    { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` },
  ], { duration, easing: EASING, fill: 'none' })

  caretAnimations.set(caret, animation)
  animation.onfinish = () => caretAnimations.delete(caret)
  animation.oncancel = () => caretAnimations.delete(caret)
}

export function moveLineWindow({ text, target, smooth = true }) {
  if (!text || !target) return
  const lineHeight = parseFloat(getComputedStyle(text).lineHeight) || 60
  const line = Math.round(target.offsetTop / lineHeight)
  const next = line > 1 ? -(line - 1) * lineHeight : 0
  const previous = lineOffsets.get(text) ?? 0
  if (previous === next) return

  const old = lineAnimations.get(text)
  if (old) old.cancel()
  lineOffsets.set(text, next)
  text.style.transform = `translateY(${next}px)`

  if (!smooth || !text.animate) return
  const animation = text.animate([
    { transform: `translateY(${previous}px)` },
    { transform: `translateY(${next}px)` },
  ], { duration: 125, easing: EASING, fill: 'none' })
  lineAnimations.set(text, animation)
  animation.onfinish = () => lineAnimations.delete(text)
  animation.oncancel = () => lineAnimations.delete(text)
}

export function resetLineWindow(text) {
  if (!text) return
  const old = lineAnimations.get(text)
  if (old) old.cancel()
  lineAnimations.delete(text)
  lineOffsets.set(text, 0)
  text.style.transform = 'translateY(0px)'
}

export function paceIndex(elapsedSeconds, wpm, maxIndex) {
  const cps = (Math.max(1, wpm) * 5) / 60
  return Math.min(maxIndex, Math.floor(elapsedSeconds * cps))
}
