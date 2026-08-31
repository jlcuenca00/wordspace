import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../settings'
const KEY='wordspace_documents',load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}},makeDoc=()=>({id:crypto.randomUUID(),title:'',content:'',createdAt:Date.now(),updatedAt:Date.now()})
export default function Write(){
 const {settings,openSettings}=useSettings(),initial=useMemo(()=>{const docs=load(),active=localStorage.getItem('wordspace_active_document');return docs.find(d=>d.id===active)||docs[0]||makeDoc()},[]),timer=useRef(null)
 const[id,setId]=useState(initial.id),[title,setTitle]=useState(initial.title),[text,setText]=useState(initial.content),[status,setStatus]=useState(load().length?'SAVED':'UNSAVED'),[lastSaved,setLastSaved]=useState(initial.updatedAt||null),[focused,setFocused]=useState(false)
 const words=text.trim()?text.trim().split(/\s+/).length:0
 const save=()=>{clearTimeout(timer.current);const docs=load(),now=Date.now(),doc={id,title:title.trim()||'Untitled',content:text,createdAt:docs.find(d=>d.id===id)?.createdAt||now,updatedAt:now,wordCount:words};localStorage.setItem(KEY,JSON.stringify([doc,...docs.filter(d=>d.id!==id)]));localStorage.setItem('wordspace_active_document',id);setLastSaved(now);setStatus('SAVED')}
 const fresh=()=>{if((title||text)&&status==='UNSAVED'&&!confirm('Start a new document without saving these changes?'))return;const d=makeDoc();setId(d.id);setTitle('');setText('');setLastSaved(null);setStatus('UNSAVED');localStorage.setItem('wordspace_active_document',d.id)}
 const changed=(kind,v)=>{kind==='title'?setTitle(v):setText(v);setStatus(settings.writing.autosave?'SAVING':'UNSAVED');if(settings.writing.autosave){clearTimeout(timer.current);timer.current=setTimeout(save,settings.writing.autosaveDelay)}}
 const download=()=>{const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${(title.trim()||'untitled').replace(/[^a-z0-9-_ ]/gi,'').trim()||'untitled'}.txt`;a.click();URL.revokeObjectURL(url)}
 useEffect(()=>{document.body.classList.toggle('writingActive',focused);return()=>document.body.classList.remove('writingActive')},[focused])
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='n'){e.preventDefault();fresh()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)})
 const fontClass=`font-${settings.writing.font}`
 return <main className={`writePage ${focused?'isWriting':''} ${settings.writing.typewriter?'typewriterMode':''}`}>
  <div className="writeContext"><button>02 / WRITE</button><span>{words.toLocaleString()} WORDS</span><button onClick={()=>openSettings('writing')}>WRITING / SETTINGS</button></div>
  <div className="writeToolbar"><button onClick={fresh}>＋ NEW</button><button className="primary" onClick={save}>SAVE <kbd>CTRL S</kbd></button><button onClick={download}>EXPORT .TXT</button><span className={status.toLowerCase()}>{status}{lastSaved&&status==='SAVED'?` · ${new Date(lastSaved).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:''}</span></div>
  <article><input className="documentTitle" placeholder="UNTITLED" value={title} onChange={e=>changed('title',e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/><textarea className={fontClass} autoFocus placeholder="Begin." value={text} onChange={e=>changed('text',e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/></article>
 </main>
}
