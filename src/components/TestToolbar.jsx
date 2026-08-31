import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '../settings'
import { wordLibraries } from '../wordLibrary'

const modes=[['time','TIME'],['words','WORDS'],['quote','QUOTE'],['custom','CUSTOM'],['practice','PRACTICE']]
const quoteLengths=[['short','SHORT'],['medium','MEDIUM'],['long','LONG'],['all','ALL']]

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
  <section className={`testToolbar ${locked?'isLocked':''}`} onClick={e=>e.stopPropagation()} aria-label="Test configuration">
   <div className="toolbarGroup modifiers" aria-label="Modifiers">
    <button disabled={!showWordTools} className={cfg.punctuation?'active':''} onClick={()=>patch({punctuation:!cfg.punctuation})}><i>;</i><span>PUNC</span></button>
    <button disabled={!showWordTools} className={cfg.numbers?'active':''} onClick={()=>patch({numbers:!cfg.numbers})}><i>123</i><span>NUM</span></button>
   </div>

   <div className="toolbarGroup modes" aria-label="Mode">
    {modes.map(([id,label])=><button key={id} className={cfg.mode===id?'active':''} onClick={()=>chooseMode(id)}>{label}</button>)}
   </div>

   <div className="toolbarGroup secondary" data-mode={cfg.mode} aria-label="Mode options">
    {cfg.mode==='time'&&[15,30,60,120].map(v=><button key={v} className={cfg.time===v?'active':''} onClick={()=>patch({time:v})}>{v}</button>)}
    {cfg.mode==='words'&&[10,25,50,100].map(v=><button key={v} className={cfg.words===v?'active':''} onClick={()=>patch({words:v})}>{v}</button>)}
    {cfg.mode==='quote'&&quoteLengths.map(([v,label])=><button key={v} className={cfg.quoteLength===v?'active':''} onClick={()=>patch({quoteLength:v})}>{label}</button>)}
    {cfg.mode==='custom'&&<button className="active editorialAction" onClick={()=>setCustomOpen(true)}>CHANGE TEXT ↗</button>}
    {cfg.mode==='practice'&&<><span className="practiceNote">PERSONAL WEAK KEYS</span><button className="editorialAction" onClick={()=>openSettings('behavior')}>TUNE ↗</button></>}
   </div>

   <div className="toolbarGroup testDetails">
    {showWordTools&&<label><span>WORDSET</span><select value={cfg.language} onChange={e=>patch({language:e.target.value})}>{wordLibraries.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>}
    <label><span>DIFFICULTY</span><select value={cfg.difficulty} onChange={e=>patch({difficulty:e.target.value})}><option value="normal">NORMAL</option><option value="expert">EXPERT</option><option value="master">MASTER</option></select></label>
   </div>
  </section>

  {customOpen&&<div className="inlineCustomLayer" onClick={e=>e.stopPropagation()}>
   <button className="inlineCustomScrim" aria-label="Close custom text" onClick={()=>setCustomOpen(false)}/>
   <section className="inlineCustomEditor">
    <header><span>TYPE / CUSTOM INPUT</span><button onClick={()=>setCustomOpen(false)}>ESC ×</button></header>
    <div className="inlineCustomCount"><i>05</i><b>PUT ANYTHING<br/>IN THE ROOM.</b><span>{draft.length.toLocaleString()} CHAR</span></div>
    <textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Paste text, code, notes, lyrics you own, or anything you want to practice…"/>
    <footer><button onClick={()=>setDraft('')}>CLEAR</button><button className="apply" disabled={!draft.trim()} onClick={applyCustom}>USE THIS TEXT ↗</button></footer>
   </section>
  </div>}
 </>
}
