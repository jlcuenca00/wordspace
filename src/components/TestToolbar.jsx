import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../settings'
import { wordLibraries } from '../wordLibrary'

const MODES = [
  ['time', 'time'],
  ['words', 'words'],
  ['quote', 'quote'],
  ['custom', 'custom'],
  ['practice', 'weakness']
]

const TIME_VALUES = [15, 30, 60, 120]
const WORD_VALUES = [10, 25, 50, 100]
const QUOTE_VALUES = [
  ['short', 'short'],
  ['medium', 'medium'],
  ['long', 'long'],
  ['all', 'all']
]

export default function TestToolbar({ locked = false }) {
  const { settings, update, openSettings } = useSettings()
  const cfg = settings.test
  const [customOpen, setCustomOpen] = useState(false)
  const [amountOpen, setAmountOpen] = useState(false)
  const [draft, setDraft] = useState(cfg.customText || '')
  const [amountDraft, setAmountDraft] = useState(cfg.mode === 'words' ? cfg.words : cfg.time)
  const library = useMemo(
    () => wordLibraries.find(item => item.id === cfg.language) || wordLibraries[0],
    [cfg.language]
  )

  useEffect(() => setDraft(cfg.customText || ''), [cfg.customText])
  useEffect(() => setAmountDraft(cfg.mode === 'words' ? cfg.words : cfg.time), [cfg.mode, cfg.time, cfg.words])

  const patch = value => update('test', value)
  const chooseMode = mode => {
    patch({ mode })
    setAmountOpen(false)
    if (mode === 'custom' && !cfg.customText.trim()) setCustomOpen(true)
  }
  const applyCustom = () => {
    if (!draft.trim()) return
    patch({ mode: 'custom', customText: draft.trim() })
    setCustomOpen(false)
  }
  const applyAmount = () => {
    const value = Math.max(1, Math.min(cfg.mode === 'words' ? 1000 : 3600, Number(amountDraft) || 1))
    patch(cfg.mode === 'words' ? { words: value } : { time: value })
    setAmountOpen(false)
  }

  const wordBased = !['quote', 'custom'].includes(cfg.mode)
  const currentValues = cfg.mode === 'time' ? TIME_VALUES : cfg.mode === 'words' ? WORD_VALUES : []
  const currentAmount = cfg.mode === 'time' ? cfg.time : cfg.words
  const isCustomAmount = currentValues.length > 0 && !currentValues.includes(currentAmount)

  return (
    <>
      <section className={`testToolbar ${locked ? 'locked' : ''}`} onClick={event => event.stopPropagation()}>
        <div className="toolbarPrimary">
          <div className="toolbarModifiers" aria-label="Test modifiers">
            <button
              disabled={!wordBased}
              className={cfg.punctuation ? 'active' : ''}
              onClick={() => patch({ punctuation: !cfg.punctuation })}
            >
              <span>@</span> punctuation
            </button>
            <button
              disabled={!wordBased}
              className={cfg.numbers ? 'active' : ''}
              onClick={() => patch({ numbers: !cfg.numbers })}
            >
              <span>#</span> numbers
            </button>
          </div>

          <span className="toolbarDivider" />

          <div className="toolbarModes" aria-label="Test mode">
            {MODES.map(([id, label]) => (
              <button key={id} className={cfg.mode === id ? 'active' : ''} onClick={() => chooseMode(id)}>
                {label}
              </button>
            ))}
          </div>

          <span className="toolbarDivider" />

          <div className="toolbarValues" aria-label="Mode options">
            {cfg.mode === 'time' && TIME_VALUES.map(value => (
              <button key={value} className={cfg.time === value ? 'active' : ''} onClick={() => patch({ time: value })}>{value}</button>
            ))}
            {cfg.mode === 'words' && WORD_VALUES.map(value => (
              <button key={value} className={cfg.words === value ? 'active' : ''} onClick={() => patch({ words: value })}>{value}</button>
            ))}
            {(cfg.mode === 'time' || cfg.mode === 'words') && (
              <button className={isCustomAmount ? 'active' : ''} onClick={() => setAmountOpen(value => !value)}>
                {isCustomAmount ? currentAmount : 'custom'}
              </button>
            )}
            {cfg.mode === 'quote' && QUOTE_VALUES.map(([value, label]) => (
              <button key={value} className={cfg.quoteLength === value ? 'active' : ''} onClick={() => patch({ quoteLength: value })}>{label}</button>
            ))}
            {cfg.mode === 'custom' && <button className="active" onClick={() => setCustomOpen(true)}>edit text</button>}
            {cfg.mode === 'practice' && <span className="toolbarNote">generated from your mistakes</span>}
          </div>
        </div>

        <div className="toolbarSecondary">
          {wordBased && (
            <label>
              <span>language</span>
              <select value={cfg.language} onChange={event => patch({ language: event.target.value })}>
                {wordLibraries.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          )}
          <label>
            <span>difficulty</span>
            <select value={cfg.difficulty} onChange={event => patch({ difficulty: event.target.value })}>
              <option value="normal">normal</option>
              <option value="expert">expert</option>
              <option value="master">master</option>
            </select>
          </label>
          <span className="wordsetDetail">{wordBased ? library.detail : cfg.mode === 'quote' ? 'curated quotes' : cfg.mode === 'custom' ? 'your text' : 'adaptive practice'}</span>
          <button className="advancedButton" onClick={() => openSettings('test')}>advanced settings</button>
        </div>

        {amountOpen && (cfg.mode === 'time' || cfg.mode === 'words') && (
          <div className="amountPopover">
            <label>
              <span>{cfg.mode === 'words' ? 'word count' : 'seconds'}</span>
              <input
                autoFocus
                type="number"
                min="1"
                max={cfg.mode === 'words' ? 1000 : 3600}
                value={amountDraft}
                onChange={event => setAmountDraft(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && applyAmount()}
              />
            </label>
            <button onClick={applyAmount}>apply</button>
          </div>
        )}
      </section>

      {customOpen && (
        <div className="modalLayer" onClick={event => event.stopPropagation()}>
          <button className="modalScrim" aria-label="Close custom text editor" onClick={() => setCustomOpen(false)} />
          <section className="customTextModal">
            <header>
              <div><span>custom test</span><h2>Use your own text.</h2></div>
              <button onClick={() => setCustomOpen(false)}>×</button>
            </header>
            <textarea
              autoFocus
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder="Paste text, code, notes, or anything you want to practice."
            />
            <footer>
              <span>{draft.length.toLocaleString()} characters</span>
              <div>
                <button onClick={() => setDraft('')}>clear</button>
                <button className="primary" disabled={!draft.trim()} onClick={applyCustom}>use text</button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
