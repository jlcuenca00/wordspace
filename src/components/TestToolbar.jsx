import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../settings'
import { wordLibraries } from '../wordLibrary'

const modes=[['time','Time'],['words','Words'],['quote','Quote'],['custom','Custom'],['practice','Practice']]
const quoteLengths=[['short','Short'],['medium','Medium'],['long','Long'],['all','All']]

export default function TestToolbar({locked=false}){
 const {settings,update,openSettings}=useSettings(),cfg=settings.test
 const [customOpen,setCustomOpen]=useState(false),[draft,setDraft]=useState(cfg.customText||'')
 const library=useMemo(()=>wordLibraries.find(x=>x.id===cfg.language)||wordLibraries[0],[cfg.language])
 useEffect(()=>setDraft(cfg.customText||''),[cfg.customText])
 const patch=p=>update('test',p)
 const chooseMode=mode=>{patch({mode});if(mode==='custom'&&!cfg.customText.trim())setCustomOpen(true)}
 const applyCustom=()=>{patch({mode:'custom',customText:draft.trim()});setCustomOpen(false)}
 const showWordTools=!['quote','custom'].includes(cfg.mode)
 return <>
  <section className={`testToolbarV5 ${locked?'isLocked':''}`} onClick={e=>e.stopPropagation()} aria-label="Test configuration">
   <div className="configPill mainConfigPill">
    <div className="modifierButtons">
     <button disabled={!showWordTools} className={cfg.punctuation?'active':''} onClick={()=>patch({punctuation:!cfg.punctuation})}><span>@</span> punctuation</button>
     <button disabled={!showWordTools} className={cfg.numbers?'active':''} onClick={()=>patch({numbers:!cfg.numbers})}><span>#</span> numbers</button>
    </div>
    <i className="configDivider"/>
    <div className="modeButtons">{modes.map(([id,label])=><button key={id} className={cfg.mode===id?'active':''} onClick={()=>chooseMode(id)}>{label}</button>)}</div>
    <i className="configDivider"/>
    <div className="modeValues">
     {cfg.mode==='time'&&[15,30,60,120].map(v=><button key={v} className={cfg.time===v?'active':''} onClick={()=>patch({time:v})}>{v}</button>)}
     {cfg.mode==='words'&&[10,25,50,100].map(v=><button key={v} className={cfg.words===v?'active':''} onClick={()=>patch({words:v})}>{v}</button>)}
     {cfg.mode==='quote'&&quoteLengths.map(([v,label])=><button key={v} className={cfg.quoteLength===v?'active':''} onClick={()=>patch({quoteLength:v})}>{label}</button>)}
     {cfg.mode==='custom'&&<button className="active changeText" onClick={()=>setCustomOpen(true)}>Change text</button>}
     {cfg.mode==='practice'&&<button className="active practiceMode" onClick={()=>openSettings('behavior')}>Personal weak keys</button>}
    </div>
   </div>
   <div className="quickConfig">
    {showWordTools&&<label><span>Wordset</span><select value={cfg.language} onChange={e=>patch({language:e.target.value})}>{wordLibraries.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select><small>{library.detail}</small></label>}
    <label><span>Difficulty</span><select value={cfg.difficulty} onChange={e=>patch({difficulty:e.target.value})}><option value="normal">Normal</option><option value="expert">Expert</option><option value="master">Master</option></select></label>
    <button className="moreTestSettings" onClick={()=>openSettings('test')}>More test settings <span>→</span></button>
   </div>
  </section>

  {customOpen&&<div className="inlineCustomLayer customLayerV5" onClick={e=>e.stopPropagation()}>
   <button className="inlineCustomScrim" aria-label="Close custom text" onClick={()=>setCustomOpen(false)}/>
   <section className="inlineCustomEditor customEditorV5">
    <header><div><span>CUSTOM TEST</span><h2>Type anything.</h2></div><button onClick={()=>setCustomOpen(false)}>×</button></header>
    <p>Paste your own practice text. It stays in this browser.</p>
    <textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Paste text, code, notes, or anything you want to practice…"/>
    <footer><span>{draft.length.toLocaleString()} characters</span><div><button onClick={()=>setDraft('')}>Clear</button><button className="apply" disabled={!draft.trim()} onClick={applyCustom}>Use this text</button></div></footer>
   </section>
  </div>}
 </>
}
