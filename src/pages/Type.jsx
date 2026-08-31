import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../settings'
import { moveCaret, moveLineWindow, paceIndex, resetLineWindow, cancelCaretAnimation } from '../caretEngine'
import { createTestText, loadWordLibrary, wordLibraries } from '../wordLibrary'
import { buildPracticeText, consistencyScore, pickQuote } from '../typingData'
import { getPersonalBest, saveSession, weaknessReport } from '../sessionStore'
import KeyboardGuide from '../components/KeyboardGuide'
import TestToolbar from '../components/TestToolbar'

function playKeySound(settings, error = false) {
  if (!settings.sound.enabled || (error && !settings.sound.error)) return
  try {
    const Audio = window.AudioContext || window.webkitAudioContext
    const context = new Audio()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const base = settings.sound.profile === 'mechanical' ? 180 : settings.sound.profile === 'typewriter' ? 120 : settings.sound.profile === 'minimal' ? 360 : 260
    oscillator.frequency.value = error ? 110 : base + Math.random() * 35
    gain.gain.value = settings.sound.volume * 0.035
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.025)
    oscillator.onended = () => context.close()
  } catch {}
}

function ResultGraph({ samples }) {
  if (!samples?.length) return <div className="resultGraph empty">No live samples</div>
  const values = samples.map(sample => sample.wpm)
  const max = Math.max(10, ...values)
  const points = samples.map((sample, index) => {
    const x = samples.length === 1 ? 0 : (index / (samples.length - 1)) * 100
    const y = 46 - (sample.wpm / max) * 42
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="resultGraph">
      <div><span>wpm over time</span><b>{max} peak</b></div>
      <svg viewBox="0 0 100 50" preserveAspectRatio="none"><polyline points={points}/></svg>
    </div>
  )
}

export default function Type() {
  const { settings, openSettings, update } = useSettings()
  const cfg = settings.test
  const navigate = useNavigate()

  const [seed, setSeed] = useState(0)
  const [input, setInput] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [failure, setFailure] = useState('')
  const [focused, setFocused] = useState(true)
  const [capsLock, setCapsLock] = useState(false)
  const [wordPool, setWordPool] = useState([])
  const [libraryStatus, setLibraryStatus] = useState('loading')
  const [samples, setSamples] = useState([])
  const [mistakeCounts, setMistakeCounts] = useState({})
  const [isPb, setIsPb] = useState(false)

  const inputRef = useRef(null)
  const textRef = useRef(null)
  const caretRef = useRef(null)
  const paceCaretRef = useRef(null)
  const lastPaceIndex = useRef(-1)
  const lastSampleSecond = useRef(-1)
  const mistakesRef = useRef([])
  const savedRef = useRef(false)

  const library = wordLibraries.find(item => item.id === cfg.language) || wordLibraries[0]
  const weakness = useMemo(() => weaknessReport(), [seed])

  const text = useMemo(() => {
    if (cfg.mode === 'quote') return pickQuote(cfg.quoteLength, seed)
    if (cfg.mode === 'custom') return cfg.customText.trim() || 'Paste your own text from the custom test controls above.'
    if (cfg.mode === 'practice') return buildPracticeText(wordPool, weakness.chars, 80)
    return createTestText(wordPool, cfg.mode === 'words' ? cfg.words : 280, {
      punctuation: cfg.punctuation,
      numbers: cfg.numbers
    })
  }, [wordPool, cfg.mode, cfg.words, cfg.punctuation, cfg.numbers, cfg.quoteLength, cfg.customText, seed, weakness])

  const correct = [...input].filter((char, index) => char === text[index]).length
  const incorrect = input.length - correct
  const minutes = Math.max(elapsed / 60, 1 / 600)
  const wpm = Math.max(0, Math.round((correct / 5) / minutes))
  const raw = Math.max(0, Math.round((input.length / 5) / minutes))
  const accuracy = input.length ? Math.round((correct / input.length) * 1000) / 10 : 100
  const consistency = consistencyScore(samples)
  const typedWords = input.trim() ? input.trim().split(/\s+/).length : 0
  const fontClass = `font-${settings.typography.font}`
  const isTyping = Boolean(startedAt) && !finished

  const remainingValue = cfg.mode === 'time'
    ? Math.max(0, Math.ceil(cfg.time - elapsed))
    : cfg.mode === 'words'
      ? Math.max(0, cfg.words - typedWords)
      : Math.max(0, text.length - input.length)
  const remainingUnit = cfg.mode === 'time' ? 'sec' : cfg.mode === 'words' ? 'words' : 'chars'

  const progress = cfg.mode === 'time'
    ? Math.min(1, elapsed / Math.max(1, cfg.time))
    : cfg.mode === 'words'
      ? Math.min(1, typedWords / Math.max(1, cfg.words))
      : Math.min(1, input.length / Math.max(1, text.length))

  const currentPb = getPersonalBest({
    mode: cfg.mode,
    time: cfg.time,
    words: cfg.words,
    quoteLength: cfg.quoteLength,
    language: cfg.language,
    punctuation: cfg.punctuation,
    numbers: cfg.numbers
  })

  const finish = reason => {
    if (finished) return
    setFailure(reason || '')
    setFinished(true)
  }

  const resetTest = (newText = true) => {
    setInput('')
    setStartedAt(null)
    setElapsed(0)
    setFinished(false)
    setFailure('')
    setSamples([])
    setMistakeCounts({})
    setIsPb(false)
    setCapsLock(false)
    if (newText) setSeed(value => value + 1)
    lastPaceIndex.current = -1
    lastSampleSecond.current = -1
    mistakesRef.current = []
    savedRef.current = false
    cancelCaretAnimation(caretRef.current)
    cancelCaretAnimation(paceCaretRef.current)
    resetLineWindow(textRef.current)
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
  }

  useEffect(() => {
    document.body.classList.add('typeRoute')
    return () => document.body.classList.remove('typeRoute')
  }, [])

  useEffect(() => {
    let alive = true
    if (cfg.mode === 'quote' || cfg.mode === 'custom') {
      setLibraryStatus('ready')
      setWordPool([])
      resetTest(true)
      return () => { alive = false }
    }
    setLibraryStatus('loading')
    loadWordLibrary(cfg.language).then(words => {
      if (!alive) return
      setWordPool(words)
      setLibraryStatus('ready')
      resetTest(true)
    })
    return () => { alive = false }
  }, [cfg.language, cfg.mode])

  useEffect(() => resetTest(true), [cfg.time, cfg.words, cfg.punctuation, cfg.numbers, cfg.difficulty, cfg.quoteLength, cfg.customText])

  useEffect(() => {
    document.body.classList.toggle('typingActive', isTyping)
    return () => document.body.classList.remove('typingActive')
  }, [isTyping])

  useEffect(() => {
    if (!startedAt || finished) return
    const tick = () => {
      const seconds = (Date.now() - startedAt) / 1000
      setElapsed(seconds)
      if (cfg.mode === 'time' && seconds >= cfg.time) finish('')
    }
    tick()
    const timer = setInterval(tick, 50)
    return () => clearInterval(timer)
  }, [startedAt, finished, cfg.mode, cfg.time])

  useEffect(() => {
    const second = Math.floor(elapsed)
    if (!startedAt || finished || second < 1 || second === lastSampleSecond.current) return
    lastSampleSecond.current = second
    setSamples(current => [...current, { second, wpm, accuracy }])
  }, [elapsed, startedAt, finished, wpm, accuracy])

  useEffect(() => {
    if (!startedAt || finished || elapsed < 5) return
    if (settings.behavior.minWpm > 0 && wpm < settings.behavior.minWpm) finish(`Minimum WPM: ${settings.behavior.minWpm}`)
    else if (settings.behavior.minAccuracy > 0 && accuracy < settings.behavior.minAccuracy) finish(`Minimum accuracy: ${settings.behavior.minAccuracy}%`)
  }, [elapsed, wpm, accuracy, startedAt, finished, settings.behavior.minWpm, settings.behavior.minAccuracy])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const index = Math.min(input.length, Math.max(0, text.length - 1))
      const active = textRef.current?.querySelector(`[data-index="${index}"]`)
      if (!active || !caretRef.current || !textRef.current) return
      moveCaret({
        caret: caretRef.current,
        text: textRef.current,
        target: active,
        speed: settings.caret.speed,
        style: settings.caret.style,
        width: settings.caret.width,
        animate: input.length > 0
      })
      moveLineWindow({
        text: textRef.current,
        target: active,
        smooth: settings.behavior.lineScroll === 'smooth'
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [input, text, settings.caret.speed, settings.caret.style, settings.caret.width, settings.behavior.lineScroll, settings.typography, settings.appearance.lines])

  useEffect(() => {
    if (!settings.caret.paceEnabled || !paceCaretRef.current || !textRef.current) return
    const index = paceIndex(startedAt ? elapsed : 0, settings.caret.paceWpm, Math.max(0, text.length - 1))
    if (index === lastPaceIndex.current) return
    lastPaceIndex.current = index
    const target = textRef.current.querySelector(`[data-index="${index}"]`)
    if (target) moveCaret({
      caret: paceCaretRef.current,
      text: textRef.current,
      target,
      speed: 'fast',
      style: 'beam',
      width: 2,
      animate: Boolean(startedAt) && index > 0
    })
  }, [elapsed, startedAt, text, settings.caret.paceEnabled, settings.caret.paceWpm])

  useEffect(() => {
    const onKeyDown = event => {
      setCapsLock(Boolean(event.getModifierState?.('CapsLock')))
      const configuredRestart =
        (cfg.quickRestart === 'tab' && event.key === 'Tab') ||
        (cfg.quickRestart === 'escape' && event.key === 'Escape') ||
        (cfg.quickRestart === 'enter' && event.key === 'Enter')

      if (configuredRestart) {
        event.preventDefault()
        resetTest(!event.shiftKey)
        return
      }
      if (event.key === 'Tab') event.preventDefault()
      if (event.key === 'Escape') inputRef.current?.blur()
      if (settings.behavior.confidence && event.key === 'Backspace') event.preventDefault()
    }
    const onKeyUp = event => setCapsLock(Boolean(event.getModifierState?.('CapsLock')))
    const onRestart = () => resetTest(true)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('wordspace:restart', onRestart)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('wordspace:restart', onRestart)
    }
  }, [settings.behavior.confidence, cfg.quickRestart])

  useEffect(() => {
    if (!finished || savedRef.current || !startedAt) return
    savedRef.current = true
    const session = {
      id: crypto.randomUUID(),
      date: Date.now(),
      mode: cfg.mode,
      time: cfg.time,
      words: cfg.words,
      quoteLength: cfg.quoteLength,
      language: cfg.language,
      punctuation: cfg.punctuation,
      numbers: cfg.numbers,
      difficulty: cfg.difficulty,
      wpm,
      raw,
      accuracy,
      consistency,
      errors: incorrect,
      typedChars: input.length,
      duration: Math.round(elapsed),
      mistakes: mistakesRef.current,
      samples,
      failed: Boolean(failure),
      failure
    }
    const previous = getPersonalBest(session)
    const personalBest = !failure && wpm > previous
    setIsPb(personalBest)
    saveSession({ ...session, pb: personalBest })
  }, [finished])

  const handleInput = event => {
    if (finished || libraryStatus !== 'ready') return
    const old = input
    const value = event.target.value.slice(0, text.length)
    const effectiveStop = cfg.difficulty === 'master' ? 'letter' : cfg.difficulty === 'expert' ? 'word' : settings.behavior.stopOnError

    if (value.length > old.length) {
      const index = value.length - 1
      const bad = value[index] !== text[index]

      if (effectiveStop === 'word' && value[index] === ' ') {
        const start = old.lastIndexOf(' ') + 1
        if (value.slice(start, index) !== text.slice(start, index)) {
          playKeySound(settings, true)
          return
        }
      }

      if (bad) {
        const expected = text[index] || ''
        const typed = value[index] || ''
        mistakesRef.current.push({ expected, typed, index })
        if (expected && expected !== ' ') {
          setMistakeCounts(current => ({
            ...current,
            [expected.toLowerCase()]: (current[expected.toLowerCase()] || 0) + 1
          }))
        }
        if (effectiveStop === 'letter') {
          playKeySound(settings, true)
          return
        }
      }
      playKeySound(settings, bad)
    }

    if (settings.behavior.strictSpace && value.length > old.length && value.at(-1) === ' ' && text[value.length - 1] !== ' ') return
    if (!startedAt && value.length) setStartedAt(Date.now())
    setInput(value)
    if (cfg.mode !== 'time' && value.length >= text.length) finish('')
  }

  const focusTest = () => inputRef.current?.focus({ preventScroll: true })
  const practiceWeak = () => {
    update('test', { mode: 'practice' })
    resetTest(true)
  }

  return (
    <main className={`typePage controls-${settings.appearance.controls} typed-${settings.behavior.typedText} ${isTyping ? 'isTyping' : ''}`} onClick={focusTest}>
      {!finished && <TestToolbar locked={isTyping} />}

      {!finished ? (
        <section className="testArea">
          <div className="testMeta">
            <span>{cfg.mode === 'practice' ? 'weakness practice' : `${cfg.mode} test`}</span>
            <span>{libraryStatus === 'loading' ? 'loading wordset…' : library.label.toLowerCase()}</span>
            <span>{cfg.difficulty}</span>
          </div>

          {settings.appearance.timer === 'bar' && (
            <div className="progressBar"><i style={{ width: `${progress * 100}%` }} /></div>
          )}

          <div className="typeViewport" style={{ '--lines': settings.appearance.lines }}>
            <div className={`typingText ${fontClass}`} ref={textRef}>
              {settings.caret.paceEnabled && <span className="paceCaret" ref={paceCaretRef} />}
              <span className={`smoothCaret caret-${settings.caret.style} ${settings.caret.blink ? 'blink' : ''}`} ref={caretRef} />
              {[...text].map((char, index) => (
                <span
                  data-index={index}
                  key={`${seed}-${index}`}
                  className={index < input.length ? (input[index] === char ? 'ok' : 'bad') : ''}
                >
                  {char}
                </span>
              ))}
            </div>

            <textarea
              className="ghostInput"
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Typing input"
            />

            {libraryStatus === 'loading' && <div className="centerNotice">Loading {library.label}…</div>}
            {!focused && settings.behavior.focusWarning && libraryStatus === 'ready' && (
              <button className="focusNotice" onMouseDown={event => { event.preventDefault(); focusTest() }}>
                <b>Click to focus</b><span>typing is paused</span>
              </button>
            )}
          </div>

          {settings.appearance.keymap && (
            <KeyboardGuide
              layout={settings.appearance.keymapLayout}
              current={text[input.length]}
              mistakes={mistakeCounts}
            />
          )}

          <div className="liveMetrics">
            {settings.appearance.timer !== 'hidden' && <div className="timerMetric"><strong>{remainingValue}</strong><span>{remainingUnit}</span></div>}
            {settings.appearance.liveWpm && <div><strong>{startedAt ? wpm : '—'}</strong><span>wpm</span></div>}
            {settings.appearance.liveAccuracy && <div><strong>{startedAt ? `${accuracy}%` : '—'}</strong><span>accuracy</span></div>}
            {settings.appearance.showPb && currentPb > 0 && <div className="pbMetric"><strong>{currentPb}</strong><span>pb</span></div>}
            {settings.caret.paceEnabled && <div><strong>{settings.caret.paceWpm}</strong><span>pace</span></div>}
            {capsLock && settings.behavior.capsLockWarning && <div className="warningMetric"><strong>caps</strong><span>lock</span></div>}
          </div>

          <div className="testHints">
            <span><kbd>{cfg.quickRestart === 'tab' ? 'Tab' : cfg.quickRestart === 'escape' ? 'Esc' : 'Enter'}</kbd> new test</span>
            <span><kbd>Shift + {cfg.quickRestart === 'tab' ? 'Tab' : cfg.quickRestart === 'escape' ? 'Esc' : 'Enter'}</kbd> repeat</span>
            <button onClick={event => { event.stopPropagation(); openSettings('caret') }}>caret: {settings.caret.speed}</button>
          </div>
        </section>
      ) : (
        <section className="resultsPage">
          <div className="resultLead">
            <span>{failure ? 'test failed' : isPb ? 'new personal best' : 'test complete'}</span>
            <strong>{wpm}</strong>
            <p>wpm</p>
            {failure && <em>{failure}</em>}
          </div>

          <div className="resultStats">
            <div><strong>{accuracy}%</strong><span>accuracy</span></div>
            <div><strong>{raw}</strong><span>raw wpm</span></div>
            <div><strong>{consistency}%</strong><span>consistency</span></div>
            <div><strong>{incorrect}</strong><span>errors</span></div>
            <div><strong>{Math.round(elapsed)}s</strong><span>time</span></div>
          </div>

          <ResultGraph samples={samples} />

          <div className="resultActions">
            <button className="primary" onClick={() => resetTest(true)}>next test</button>
            <button onClick={() => resetTest(false)}>repeat text</button>
            <button onClick={practiceWeak}>practice weak keys</button>
            <button onClick={() => navigate('/history')}>history</button>
          </div>
        </section>
      )}
    </main>
  )
}
