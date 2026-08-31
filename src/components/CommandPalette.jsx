import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { themes, useSettings } from '../settings'

export default function CommandPalette(){
 const navigate=useNavigate(),{openSettings,setTheme,update}=useSettings(),[open,setOpen]=useState(false),[q,setQ]=useState(''),inputRef=useRef(null)
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(v=>!v)}if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[])
 useEffect(()=>{if(open)requestAnimationFrame(()=>inputRef.current?.focus())},[open])
 const actions=useMemo(()=>[
  ['TYPE / START TEST','Go to the typing room',()=>navigate('/type')],
  ['TYPE / RESTART','Restart the current test',()=>window.dispatchEvent(new CustomEvent('wordspace:restart'))],
  ['WRITE / NEW THOUGHT','Open the writing room',()=>navigate('/write')],
  ['LIBRARY / DOCUMENTS','Open saved writing',()=>navigate('/library')],
  ['HISTORY / ANALYTICS','Open typing history',()=>navigate('/stats')],
  ['SETTINGS / TEST','Test modes and wordsets',()=>openSettings('test')],
  ['SETTINGS / CARET','Caret motion and pace',()=>openSettings('caret')],
  ['SETTINGS / TYPOGRAPHY','Fonts, size and spacing',()=>openSettings('typography')],
  ['SETTINGS / THEME','Change the visual system',()=>openSettings('theme')],
  ['KEYMAP / TOGGLE','Show or hide the live keyboard',()=>update('appearance',{keymap:undefined})],
  ['THEME / RANDOM','Apply a random curated theme',()=>{const ids=Object.keys(themes);setTheme(ids[Math.floor(Math.random()*ids.length)])}}]
 ],[navigate,openSettings,setTheme,update])
 const filtered=actions.filter(a=>(a[0]+' '+a[1]).toLowerCase().includes(q.toLowerCase())).slice(0,9)
 const run=fn=>{fn();setOpen(false);setQ('')}
 useEffect(()=>{const direct=()=>setOpen(true);window.addEventListener('wordspace:command',direct);return()=>window.removeEventListener('wordspace:command',direct)},[])
 if(!open)return null
 return <div className="commandLayer" role="dialog" aria-modal="true" aria-label="Wordspace commands"><button className="commandScrim" onClick={()=>setOpen(false)}/><section className="commandPalette"><div className="commandTop"><span>WORDSPACE / COMMAND</span><kbd>ESC</kbd></div><label><i>⌘</i><input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a command…"/></label><div className="commandResults">{filtered.map(([name,detail,fn],i)=><button key={name} onClick={()=>run(fn)}><i>{String(i+1).padStart(2,'0')}</i><span><b>{name}</b><small>{detail}</small></span><em>↗</em></button>)}{!filtered.length&&<p>NO MATCHING COMMANDS</p>}</div><footer><span>CTRL K / OPEN ANYWHERE</span><span>WORDSPACE / 2026</span></footer></section></div>
}
