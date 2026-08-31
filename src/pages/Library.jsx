import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const KEY='wordspace_documents'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}

export default function Library(){
 const[docs,setDocs]=useState(load),[query,setQuery]=useState(''),[sort,setSort]=useState('recent'),navigate=useNavigate()
 const visible=useMemo(()=>docs.filter(d=>(d.title||'Untitled').toLowerCase().includes(query.toLowerCase())||(d.content||'').toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='oldest'?(a.updatedAt||0)-(b.updatedAt||0):(b.updatedAt||0)-(a.updatedAt||0)),[docs,query,sort])
 const open=d=>{localStorage.setItem('wordspace_active_document',d.id);navigate('/write')}
 const create=()=>{localStorage.setItem('wordspace_new_document','1');localStorage.removeItem('wordspace_active_document');navigate('/write')}
 const remove=(e,d)=>{e.stopPropagation();if(!confirm(`Delete “${d.title||'Untitled'}”?`))return;const next=docs.filter(x=>x.id!==d.id);localStorage.setItem(KEY,JSON.stringify(next));if(localStorage.getItem('wordspace_active_document')===d.id)localStorage.removeItem('wordspace_active_document');setDocs(next)}
 return <main className="libraryPageV5">
  <section className="libraryHeroV5"><div><span>Your writing</span><h1>Everything you<br/>decided to keep.</h1></div><button className="newDocumentButton" onClick={create}>New document <span>＋</span></button></section>
  <section className="libraryControlsV5"><label><span>Search</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Titles or text…"/></label><label><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Recently edited</option><option value="oldest">Oldest first</option></select></label><div><strong>{visible.length}</strong><span>{visible.length===1?'document':'documents'}</span></div></section>
  {visible.length?<section className="documentGridV5">{visible.map((d,index)=><button className="documentCardV5" key={d.id} onClick={()=>open(d)}><div className="documentCardTop"><span>{String(index+1).padStart(2,'0')}</span><i>{new Date(d.updatedAt).toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}</i></div><div className="documentCardBody"><h2>{d.title||'Untitled'}</h2><p>{(d.content||'').trim().slice(0,150)||'An empty page waiting for its first line.'}</p></div><div className="documentCardBottom"><span>{d.wordCount||0} words</span><span className="openDoc">Open ↗</span><span className="deleteDoc" role="button" tabIndex="0" onClick={e=>remove(e,d)}>Delete</span></div></button>)}</section>:<section className="emptyLibraryV5"><div>W</div><h2>{query?'Nothing matched your search.':'No documents yet.'}</h2><p>{query?'Try another title or phrase.':'Open the writing room and save your first page.'}</p>{!query&&<button onClick={create}>Start writing</button>}</section>}
 </main>
}
