import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../settings'
import { moveCaret, moveLineWindow, paceIndex, resetLineWindow, cancelCaretAnimation } from '../caretEngine'
import { createTestText, loadWordLibrary, wordLibraries } from '../wordLibrary'

const sound=(settings,error=false)=>{if(!settings.sound.enabled||(error&&!settings.sound.error))return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();const base=settings.sound.profile==='mechanical'?180:settings.sound.profile==='typewriter'?120:settings.sound.profile==='minimal'?360:260;o.frequency.value=error?110:base+Math.random()*35;g.gain.value=settings.sound.volume*.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.025);o.onended=()=>c.close()}catch{}}

export default function Type(){
 const {settings,openSettings}=useSettings(),cfg=settings.test
 const[seed,setSeed]=useState(0),[input,setInput]=useState(''),[startedAt,setStartedAt]=useState(null),[elapsed,setElapsed]=useState(0),[finished,setFinished]=useState(false),[focused,setFocused]=useState(true),[capsLock,setCapsLock]=useState(false),[wordPool,setWordPool]=useState([]),[libraryStatus,setLibraryStatus]=useState('loading')
 const inputRef=useRef(null),textRef=useRef(null),caretRef=useRef(null),paceCaretRef=useRef(null),lastPaceIndex=useRef(-1)
 const amount=cfg.mode==='time'?cfg.time:cfg.words
 const text=useMemo(()=>createTestText(wordPool,cfg.mode==='words'?cfg.words:180,{punctuation:cfg.punctuation,numbers:cfg.numbers}),[wordPool,cfg.mode,cfg.words,cfg.punctuation,cfg.numbers,seed])
 const library=wordLibraries.find(x=>x.id===cfg.language)||wordLibraries[0]

 const restart=()=>{setInput('');setStartedAt(null);setElapsed(0);setFinished(false);setCapsLock(false);setSeed(v=>v+1);lastPaceIndex.current=-1;cancelCaretAnimation(caretRef.current);cancelCaretAnimation(paceCaretRef.current);resetLineWindow(textRef.current);requestAnimationFrame(()=>inputRef.current?.focus({preventScroll:true}))}

 useEffect(()=>{let alive=true;setLibraryStatus('loading');loadWordLibrary(cfg.language).then(words=>{if(!alive)return;setWordPool(words);setLibraryStatus('ready');restart()});return()=>{alive=false}},[cfg.language])
 useEffect(()=>restart(),[cfg.mode,cfg.time,cfg.words,cfg.punctuation,cfg.numbers,cfg.difficulty])
 useEffect(()=>{document.body.classList.toggle('typingActive',!!startedAt&&!finished);return()=>document.body.classList.remove('typingActive')},[startedAt,finished])
 useEffect(()=>{if(!startedAt||finished)return;const tick=()=>{const s=(Date.now()-startedAt)/1000;setElapsed(s);if(cfg.mode==='time'&&s>=cfg.time)setFinished(true)};tick();const t=setInterval(tick,50);return()=>clearInterval(t)},[startedAt,finished,cfg.mode,cfg.time])

 useEffect(()=>{const frame=requestAnimationFrame(()=>{const index=Math.min(input.length,text.length-1),active=textRef.current?.querySelector(`[data-index="${index}"]`);if(!active||!caretRef.current||!textRef.current)return;moveCaret({caret:caretRef.current,text:textRef.current,target:active,speed:settings.caret.speed,style:settings.caret.style,width:settings.caret.width,animate:input.length>0});moveLineWindow({text:textRef.current,target:active,smooth:settings.behavior.lineScroll==='smooth'})});return()=>cancelAnimationFrame(frame)},[input,text,settings.caret.speed,settings.caret.style,settings.caret.width,settings.behavior.lineScroll,settings.typography,settings.appearance.lines])

 useEffect(()=>{if(!settings.caret.paceEnabled||!paceCaretRef.current||!textRef.current)return;const index=paceIndex(startedAt?elapsed:0,settings.caret.paceWpm,text.length-1);if(index===lastPaceIndex.current)return;lastPaceIndex.current=index;const target=textRef.current.querySelector(`[data-index="${index}"]`);if(target)moveCaret({caret:paceCaretRef.current,text:textRef.current,target,speed:'fast',style:'beam',width:2,animate:startedAt&&index>0})},[elapsed,startedAt,text,settings.caret.paceEnabled,settings.caret.paceWpm])

 useEffect(()=>{const key=e=>{setCapsLock(!!e.getModifierState?.('CapsLock'));if(e.key==='Tab'){e.preventDefault();restart()}if(e.key==='Escape')inputRef.current?.blur();if(settings.behavior.confidence&&e.key==='Backspace')e.preventDefault()};const up=e=>setCapsLock(!!e.getModifierState?.('CapsLock'));window.addEventListener('keydown',key);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',up)}},[settings.behavior.confidence])

 const handleInput=e=>{if(finished||libraryStatus!=='ready')return;let value=e.target.value.slice(0,text.length),old=input;const effectiveStop=cfg.difficulty==='master'?'letter':cfg.difficulty==='expert'?'word':settings.behavior.stopOnError;if(value.length>old.length){const idx=value.length-1,bad=value[idx]!==text[idx];if(effectiveStop==='word'&&value[idx]===' '){const start=old.lastIndexOf(' ')+1;if(value.slice(start,idx)!==text.slice(start,idx)){sound(settings,true);return}}if(bad&&effectiveStop==='letter'){sound(settings,true);return}else sound(settings,bad)}if(settings.behavior.strictSpace&&value.length>old.length&&value.at(-1)===' '&&text[value.length-1]!==' ')return;if(!startedAt&&value.length)setStartedAt(Date.now());setInput(value);if(cfg.mode==='words'&&value.length>=text.length)setFinished(true)}

 const correct=[...input].filter((c,i)=>c===text[i]).length,incorrect=input.length-correct,min=Math.max(elapsed/60,1/600),wpm=Math.max(0,Math.round(correct/5/min)),raw=Math.max(0,Math.round(input.length/5/min)),accuracy=input.length?Math.round(correct/input.length*1000)/10:100,remaining=cfg.mode==='time'?Math.max(0,Math.ceil(cfg.time-elapsed)):Math.max(0,cfg.words-input.trim().split(/\s+/).filter(Boolean).length),fontClass=`font-${settings.typography.font}`
 const focusTest=()=>inputRef.current?.focus({preventScroll:true})

 return <main className={`typePage controls-${settings.appearance.controls} typed-${settings.behavior.typedText}`} onClick={focusTest}>
  {!finished?<>
   <div className="typeContext"><button onClick={e=>{e.stopPropagation();openSettings('test')}}>01 / TYPE</button><button onClick={e=>{e.stopPropagation();openSettings('test')}}>{cfg.mode.toUpperCase()} / {amount}</button><button onClick={e=>{e.stopPropagation();openSettings('test')}}>{library.label}</button><button onClick={e=>{e.stopPropagation();openSettings('test')}}>{cfg.difficulty.toUpperCase()}</button>{settings.caret.paceEnabled&&<button onClick={e=>{e.stopPropagation();openSettings('caret')}}>PACE / {settings.caret.paceWpm} WPM</button>}</div>
   {settings.appearance.timer==='bar'&&cfg.mode==='time'&&<div className="timerBar"><i style={{width:`${Math.min(100,elapsed/cfg.time*100)}%`}}/></div>}
   <div className="typeViewport" style={{'--lines':settings.appearance.lines}}>
    <div className={`typingText ${fontClass}`} ref={textRef}>{settings.caret.paceEnabled&&<span className="paceCaret" ref={paceCaretRef}/>}<span className={`smoothCaret caret-${settings.caret.style} ${settings.caret.blink?'blink':''}`} ref={caretRef}/>{[...text].map((c,i)=><span data-index={i} key={`${seed}-${i}`} className={i<input.length?(input[i]===c?'ok':'bad'):''}>{c}</span>)}</div>
    <input className="ghostInput" ref={inputRef} value={input} onChange={handleInput} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} autoComplete="off" autoCapitalize="off" spellCheck="false"/>
    {libraryStatus==='loading'&&<div className="wordsetNotice"><span>LOADING WORDSET</span><b>{library.label}</b></div>}
    {!focused&&settings.behavior.focusWarning&&libraryStatus==='ready'&&<button className="focusNotice" onMouseDown={e=>{e.preventDefault();focusTest()}}><span>INPUT PAUSED</span><b>CLICK TO FOCUS</b></button>}
   </div>
   <div className="typeStatus"><span>{startedAt&&settings.appearance.liveWpm?`${wpm} WPM`:startedAt?'TYPING':'BEGIN'}</span>{startedAt&&settings.appearance.liveAccuracy&&<span>{accuracy}%</span>}{settings.appearance.timer!=='hidden'&&<span>{remaining} {cfg.mode==='time'?'SEC':'WORDS'}</span>}<span className="wordSource">MT WORDSET / {wordPool.length||'—'}</span>{capsLock&&settings.behavior.capsLockWarning&&<span className="capsWarning">CAPS LOCK</span>}<span>TAB / RESTART</span></div>
  </>:<div className="result"><p>SESSION / {cfg.mode.toUpperCase()} {amount} / {library.label}</p><strong>{wpm}</strong><h3>WORDS / MINUTE</h3><div className="resultGrid"><span><b>{accuracy}%</b>ACCURACY</span><span><b>{raw}</b>RAW</span><span><b>{incorrect}</b>ERRORS</span><span><b>{Math.round(elapsed)}s</b>TIME</span></div><button onClick={restart}>AGAIN ↗</button></div>}
 </main>
}
