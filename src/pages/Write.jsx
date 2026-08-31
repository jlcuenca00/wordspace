import { useEffect, useMemo, useState } from 'react'

const KEY='wordspace_documents'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
const makeDoc=()=>({id:crypto.randomUUID(),title:'',content:'',createdAt:Date.now(),updatedAt:Date.now()})

export default function Write(){
 const initial=useMemo(()=>{const docs=load();const active=localStorage.getItem('wordspace_active_document');return docs.find(d=>d.id===active)||docs[0]||makeDoc()},[])
 const[id,setId]=useState(initial.id),[title,setTitle]=useState(initial.title),[text,setText]=useState(initial.content),[status,setStatus]=useState(load().length?'SAVED':'UNSAVED'),[lastSaved,setLastSaved]=useState(initial.updatedAt||null)
 const words=text.trim()?text.trim().split(/\s+/).length:0
 const save=()=>{const docs=load(),now=Date.now(),doc={id,title:title.trim()||'Untitled',content:text,createdAt:docs.find(d=>d.id===id)?.createdAt||now,updatedAt:now,wordCount:words};const next=[doc,...docs.filter(d=>d.id!==id)];localStorage.setItem(KEY,JSON.stringify(next));localStorage.setItem('wordspace_active_document',id);setLastSaved(now);setStatus('SAVED')}
 const fresh=()=>{if((title||text)&&status==='UNSAVED'&&!confirm('Start a new document without saving these changes?'))return;const doc=makeDoc();setId(doc.id);setTitle('');setText('');setLastSaved(null);setStatus('UNSAVED');localStorage.setItem('wordspace_active_document',doc.id)}
 const download=()=>{const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${(title.trim()||'untitled').replace(/[^a-z0-9-_ ]/gi,'').trim()||'untitled'}.txt`;a.click();URL.revokeObjectURL(url)}
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='n'){e.preventDefault();fresh()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)})
 const changedTitle=v=>{setTitle(v);setStatus('UNSAVED')},changedText=v=>{setText(v);setStatus('UNSAVED')}
 return <main className="write">
  <div className="writeMeta"><span>WRITE / {title.trim().toUpperCase()||'UNTITLED'}</span><span>{words.toLocaleString()} WORDS · {text.length.toLocaleString()} CHARACTERS</span></div>
  <div className="writeToolbar"><button onClick={fresh}>＋ NEW</button><button className="primary" onClick={save}>SAVE <kbd>CTRL S</kbd></button><button onClick={download}>EXPORT .TXT</button><span className={status==='SAVED'?'saved':'unsaved'}>{status}{lastSaved&&status==='SAVED'?` · ${new Date(lastSaved).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:''}</span></div>
  <article><input className="title" placeholder="UNTITLED" value={title} onChange={e=>changedTitle(e.target.value)}/><textarea autoFocus placeholder="Begin." value={text} onChange={e=>changedText(e.target.value)}/></article>
 </main>
}
