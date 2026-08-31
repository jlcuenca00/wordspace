import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../settings'

const KEY='wordspace_documents'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
const makeDoc=()=>({id:crypto.randomUUID(),title:'',content:'',createdAt:Date.now(),updatedAt:Date.now()})

export default function Write(){
 const {settings,openSettings}=useSettings()
 const initial=useMemo(()=>{if(localStorage.getItem('wordspace_new_document')==='1'){localStorage.removeItem('wordspace_new_document');return makeDoc()}const docs=load(),active=localStorage.getItem('wordspace_active_document');return docs.find(d=>d.id===active)||docs[0]||makeDoc()},[])
 const timer=useRef(null),dirty=useRef(false)
 const[id,setId]=useState(initial.id),[title,setTitle]=useState(initial.title),[text,setText]=useState(initial.content),[status,setStatus]=useState(load().some(d=>d.id===initial.id)?'SAVED':'UNSAVED'),[lastSaved,setLastSaved]=useState(initial.updatedAt||null),[focused,setFocused]=useState(false)
 const words=text.trim()?text.trim().split(/\s+/).length:0
 const chars=text.length
 const save=()=>{clearTimeout(timer.current);const docs=load(),now=Date.now(),doc={id,title:title.trim()||'Untitled',content:text,createdAt:docs.find(d=>d.id===id)?.createdAt||now,updatedAt:now,wordCount:words};localStorage.setItem(KEY,JSON.stringify([doc,...docs.filter(d=>d.id!==id)]));localStorage.setItem('wordspace_active_document',id);setLastSaved(now);setStatus('SAVED');dirty.current=false}
 const fresh=()=>{if((title||text)&&status!=='SAVED'&&!confirm('Start a new document without saving these changes?'))return;clearTimeout(timer.current);const d=makeDoc();setId(d.id);setTitle('');setText('');setLastSaved(null);setStatus('UNSAVED');dirty.current=false;localStorage.setItem('wordspace_active_document',d.id)}
 const changed=(kind,v)=>{dirty.current=true;kind==='title'?setTitle(v):setText(v);setStatus(settings.writing.autosave?'SAVING':'UNSAVED')}
 const download=()=>{const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${(title.trim()||'untitled').replace(/[^a-z0-9-_ ]/gi,'').trim()||'untitled'}.txt`;a.click();URL.revokeObjectURL(url)}
 useEffect(()=>{if(!settings.writing.autosave||!dirty.current)return;clearTimeout(timer.current);timer.current=setTimeout(save,settings.writing.autosaveDelay);return()=>clearTimeout(timer.current)},[title,text,settings.writing.autosave,settings.writing.autosaveDelay])
 useEffect(()=>{document.body.classList.toggle('writingActive',focused);return()=>document.body.classList.remove('writingActive')},[focused])
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='n'){e.preventDefault();fresh()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)})
 const fontClass=`font-${settings.writing.font}`
 return <main className={`writeRoomV6 ${focused?'isWriting':''} ${settings.writing.typewriter?'typewriterMode':''}`}>
  <section className="writeHeaderV6"><div><span>02 / WRITE</span><h1>Stay with the thought.</h1></div><nav><Link to="/library">Library</Link><button onClick={()=>openSettings('writing')}>Writing settings</button></nav></section>
  <section className="writerChromeV6"><div className="writerActionsV6"><button onClick={fresh}>New</button><button className="saveWriterButton" onClick={save}>Save <kbd>Ctrl S</kbd></button><button onClick={download}>Export .txt</button></div><div className="writerStatusV6"><span className={status.toLowerCase()}>{status==='SAVING'?'Saving…':status==='SAVED'?'Saved':'Unsaved'}</span><span>{words.toLocaleString()} words</span><span>{chars.toLocaleString()} characters</span></div></section>
  <article className="writerCanvasV6"><input className="documentTitleV6" placeholder="Untitled" value={title} onChange={e=>changed('title',e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/><textarea className={`writerEditorV6 ${fontClass}`} autoFocus placeholder="Begin writing…" value={text} onChange={e=>changed('text',e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/></article>
  <div className="writerFooterV6"><span>{settings.writing.autosave?`Autosave ${settings.writing.autosaveDelay/1000}s`:'Manual save'}</span>{lastSaved&&<span>Last saved {new Date(lastSaved).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>}<span>{settings.writing.typewriter?'Typewriter mode':'Focus ready'}</span></div>
 </main>
}
