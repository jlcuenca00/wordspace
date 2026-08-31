import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../settings'
import { moveCaret, moveLineWindow, paceIndex, resetLineWindow, cancelCaretAnimation } from '../caretEngine'
import { createTestText, loadWordLibrary, wordLibraries } from '../wordLibrary'
import { buildPracticeText, consistencyScore, pickQuote } from '../typingData'
import { getPersonalBest, saveSession, weaknessReport } from '../sessionStore'
import KeyboardGuide from '../components/KeyboardGuide'

const sound=(settings,error=false)=>{if(!settings.sound.enabled||(error&&!settings.sound.error))return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();const base=settings.sound.profile==='mechanical'?180:settings.sound.profile==='typewriter'?120:settings.sound.profile==='minimal'?360:260;o.frequency.value=error?110:base+Math.random()*35;g.gain.value=settings.sound.volume*.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.025);o.onended=()=>c.close()}catch{}}

function ResultGraph({samples}){
 if(!samples?.length)return <div className="resultGraph empty"><span>NO LIVE SAMPLES</span></div>
 const values=samples.map(x=>x.wpm),max=Math.max(10,...values),points=samples.map((x,i)=>`${samples.length===1?0:(i/(samples.length-1))*100},${46-(x.wpm/max)*42}`).join(' ')
 return <div className="resultGraph"><div><span>WPM / SESSION</span><b>{max} PEAK</b></div><svg viewBox="0 0 100 50" preserveAspectRatio="none"><polyline points={points}/></svg></div>
}

export default function Type(){
 const {settings,openSettings,update}=useSettings(),cfg=settings.test,navigate=useNavigate()
 const[seed,setSeed]=useState(0),[input,setInput]=useState(''),[startedAt,setStartedAt]=useState(null),[elapsed,setElapsed]=useState(0),[finished,setFinished]=useState(false),[failure,setFailure]=useState(''),[focused,setFocused]=useState(true),[capsLock,setCapsLock]=useState(false),[wordPool,setWordPool]=useState([]),[libraryStatus,setLibraryStatus]=useState('loading'),[samples,setSamples]=useState([]),[mistakeCounts,setMistakeCounts]=useState({}),[isPb,setIsPb]=useState(false)
 const inputRef=useRef(null),textRef=useRef(null),caretRef=useRef(null),paceCaretRef=useRef(null),lastPaceIndex=useRef(-1),lastSampleSecond=useRef(-1),mistakesRef=useRef([]),savedRef=useRef(false)
 const library=wordLibraries.find(x=>x.id===cfg.language)||wordLibraries[0],weakness=useMemo(()=>weaknessReport(),[seed])
 const text=useMemo(()=>{
  if(cfg.mode==='quote')return pickQuote(cfg.quoteLength,seed)
  if(cfg.mode==='custom')return cfg.customText.trim()||'Paste custom text in Settings → Test to practice anything you want.'
  if(cfg.mode==='practice')return buildPracticeText(wordPool,weakness.chars,80)
  return createTestText(wordPool,cfg.mode==='words'?cfg.words:260,{punctuation:cfg.punctuation,numbers:cfg.numbers})
 },[wordPool,cfg.mode,cfg.words,cfg.punctuation,cfg.numbers,cfg.quoteLength,cfg.customText,seed,weakness])
 const amount=cfg.mode==='time'?cfg.time:cfg.mode==='words'?cfg.words:cfg.mode==='quote'?cfg.quoteLength:cfg.mode==='practice'?'adaptive':'custom'
 const correct=[...input].filter((c,i)=>c===text[i]).length,incorrect=input.length-correct,minutes=Math.max(elapsed/60,1/600),wpm=Math.max(0,Math.round(correct/5/minutes)),raw=Math.max(0,Math.round(input.length/5/minutes)),accuracy=input.length?Math.round(correct/input.length*1000)/10:100,remaining=cfg.mode==='time'?Math.max(0,Math.ceil(cfg.time-elapsed)):Math.max(0,text.length-input.length),consistency=consistencyScore(samples),fontClass=`font-${settings.typography.font}`

 const finish=reason=>{if(finished)return;setFailure(reason||'');setFinished(true)}
 const restart=()=>{setInput('');setStartedAt(null);setElapsed(0);setFinished(false);setFailure('');setSamples([]);setMistakeCounts({});setIsPb(false);setCapsLock(false);setSeed(v=>v+1);lastPaceIndex.current=-1;lastSampleSecond.current=-1;mistakesRef.current=[];savedRef.current=false;cancelCaretAnimation(caretRef.current);cancelCaretAnimation(paceCaretRef.current);resetLineWindow(textRef.current);requestAnimationFrame(()=>inputRef.current?.focus({preventScroll:true}))}

 useEffect(()=>{let alive=true;if(cfg.mode==='quote'||cfg.mode==='custom'){setLibraryStatus('ready');setWordPool([]);restart();return()=>{alive=false}}setLibraryStatus('loading');loadWordLibrary(cfg.language).then(words=>{if(!alive)return;setWordPool(words);setLibraryStatus('ready');restart()});return()=>{alive=false}},[cfg.language,cfg.mode])
 useEffect(()=>restart(),[cfg.time,cfg.words,cfg.punctuation,cfg.numbers,cfg.difficulty,cfg.quoteLength,cfg.customText])
 useEffect(()=>{document.body.classList.toggle('typingActive',!!startedAt&&!finished);return()=>document.body.classList.remove('typingActive')},[startedAt,finished])
 useEffect(()=>{if(!startedAt||finished)return;const tick=()=>{const s=(Date.now()-startedAt)/1000;setElapsed(s);if(cfg.mode==='time'&&s>=cfg.time)finish('')};tick();const t=setInterval(tick,50);return()=>clearInterval(t)},[startedAt,finished,cfg.mode,cfg.time])
 useEffect(()=>{const sec=Math.floor(elapsed);if(!startedAt||finished||sec<1||sec===lastSampleSecond.current)return;lastSampleSecond.current=sec;setSamples(s=>[...s,{second:sec,wpm,accuracy}])},[elapsed,startedAt,finished,wpm,accuracy])
 useEffect(()=>{if(!startedAt||finished||elapsed<5)return;if(settings.behavior.minWpm>0&&wpm<settings.behavior.minWpm)finish(`MINIMUM WPM / ${settings.behavior.minWpm}`);else if(settings.behavior.minAccuracy>0&&accuracy<settings.behavior.minAccuracy)finish(`MINIMUM ACCURACY / ${settings.behavior.minAccuracy}%`)},[elapsed,wpm,accuracy,startedAt,finished,settings.behavior.minWpm,settings.behavior.minAccuracy])

 useEffect(()=>{const frame=requestAnimationFrame(()=>{const index=Math.min(input.length,Math.max(0,text.length-1)),active=textRef.current?.querySelector(`[data-index="${index}"]`);if(!active||!caretRef.current||!textRef.current)return;moveCaret({caret:caretRef.current,text:textRef.current,target:active,speed:settings.caret.speed,style:settings.caret.style,width:settings.caret.width,animate:input.length>0});moveLineWindow({text:textRef.current,target:active,smooth:settings.behavior.lineScroll==='smooth'})});return()=>cancelAnimationFrame(frame)},[input,text,settings.caret.speed,settings.caret.style,settings.caret.width,settings.behavior.lineScroll,settings.typography,settings.appearance.lines])
 useEffect(()=>{if(!settings.caret.paceEnabled||!paceCaretRef.current||!textRef.current)return;const index=paceIndex(startedAt?elapsed:0,settings.caret.paceWpm,Math.max(0,text.length-1));if(index===lastPaceIndex.current)return;lastPaceIndex.current=index;const target=textRef.current.querySelector(`[data-index="${index}"]`);if(target)moveCaret({caret:paceCaretRef.current,text:textRef.current,target,speed:'fast',style:'beam',width:2,animate:startedAt&&index>0})},[elapsed,startedAt,text,settings.caret.paceEnabled,settings.caret.paceWpm])

 useEffect(()=>{const key=e=>{setCapsLock(!!e.getModifierState?.('CapsLock'));const quick=(cfg.quickRestart==='tab'&&e.key==='Tab')||(cfg.quickRestart==='escape'&&e.key==='Escape')||(cfg.quickRestart==='enter'&&e.key==='Enter');if(quick){e.preventDefault();restart();return}if(e.key==='Tab')e.preventDefault();if(e.key==='Escape')inputRef.current?.blur();if(settings.behavior.confidence&&e.key==='Backspace')e.preventDefault()};const up=e=>setCapsLock(!!e.getModifierState?.('CapsLock'));window.addEventListener('keydown',key);window.addEventListener('keyup',up);const custom=()=>restart();window.addEventListener('wordspace:restart',custom);return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',up);window.removeEventListener('wordspace:restart',custom)}},[settings.behavior.confidence,cfg.quickRestart])

 useEffect(()=>{if(!finished||savedRef.current||!startedAt)return;savedRef.current=true;const session={id:crypto.randomUUID(),date:Date.now(),mode:cfg.mode,time:cfg.time,words:cfg.words,quoteLength:cfg.quoteLength,language:cfg.language,punctuation:cfg.punctuation,numbers:cfg.numbers,difficulty:cfg.difficulty,wpm,raw,accuracy,consistency,errors:incorrect,typedChars:input.length,duration:Math.round(elapsed),mistakes:mistakesRef.current,samples,failed:!!failure,failure};const previous=getPersonalBest(session);const pb=!failure&&wpm>previous;setIsPb(pb);saveSession({...session,pb})},[finished])

 const handleInput=e=>{if(finished||libraryStatus!=='ready')return;let value=e.target.value.slice(0,text.length),old=input;const effectiveStop=cfg.difficulty==='master'?'letter':cfg.difficulty==='expert'?'word':settings.behavior.stopOnError;if(value.length>old.length){const idx=value.length-1,bad=value[idx]!==text[idx];if(effectiveStop==='word'&&value[idx]===' '){const start=old.lastIndexOf(' ')+1;if(value.slice(start,idx)!==text.slice(start,idx)){sound(settings,true);return}}if(bad){const expected=text[idx]||'',typed=value[idx]||'';mistakesRef.current.push({expected,typed,index:idx});if(expected&&expected!==' ')setMistakeCounts(m=>({...m,[expected.toLowerCase()]:(m[expected.toLowerCase()]||0)+1}));if(effectiveStop==='letter'){sound(settings,true);return}}sound(settings,bad)}if(settings.behavior.strictSpace&&value.length>old.length&&value.at(-1)===' '&&text[value.length-1]!==' ')return;if(!startedAt&&value.length)setStartedAt(Date.now());setInput(value);if(cfg.mode!=='time'&&value.length>=text.length)finish('')}
 const focusTest=()=>inputRef.current?.focus({preventScroll:true})
 const practiceWeak=()=>{update('test',{mode:'practice'});restart()}

 return <main className={`typePage typeMode-${cfg.mode} controls-${settings.appearance.controls} typed-${settings.behavior.typedText}`} onClick={focusTest}>
  {!finished?<>
   <div className="typeContext"><button onClick={e=>{e.stopPropagation();openSettings('test')}}>01 / TYPE</button><button onClick={e=>{e.stopPropagation();openSettings('test')}}>{cfg.mode.toUpperCase()} / {String(amount).toUpperCase()}</button>{cfg.mode!=='quote'&&cfg.mode!=='custom'&&<button onClick={e=>{e.stopPropagation();openSettings('test')}}>{library.label}</button>}<button onClick={e=>{e.stopPropagation();openSettings('test')}}>{cfg.difficulty.toUpperCase()}</button>{settings.caret.paceEnabled&&<button onClick={e=>{e.stopPropagation();openSettings('caret')}}>PACE / {settings.caret.paceWpm} WPM</button>}</div>
   {settings.appearance.timer==='bar'&&cfg.mode==='time'&&<div className="timerBar"><i style={{width:`${Math.min(100,elapsed/cfg.time*100)}%`}}/></div>}
   <div className="typeViewport" style={{'--lines':settings.appearance.lines}}>
    <div className={`typingText ${fontClass}`} ref={textRef}>{settings.caret.paceEnabled&&<span className="paceCaret" ref={paceCaretRef}/>}<span className={`smoothCaret caret-${settings.caret.style} ${settings.caret.blink?'blink':''}`} ref={caretRef}/>{[...text].map((c,i)=><span data-index={i} key={`${seed}-${i}`} className={i<input.length?(input[i]===c?'ok':'bad'):''}>{c}</span>)}</div>
    <textarea className="ghostInput" ref={inputRef} value={input} onChange={handleInput} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} autoComplete="off" autoCapitalize="off" spellCheck="false"/>
    {libraryStatus==='loading'&&<div className="wordsetNotice"><span>LOADING WORDSET</span><b>{library.label}</b></div>}
    {!focused&&settings.behavior.focusWarning&&libraryStatus==='ready'&&<button className="focusNotice" onMouseDown={e=>{e.preventDefault();focusTest()}}><span>INPUT PAUSED</span><b>CLICK TO FOCUS</b></button>}
   </div>
   {settings.appearance.keymap&&<KeyboardGuide layout={settings.appearance.keymapLayout} current={text[input.length]} mistakes={mistakeCounts}/>} 
   <div className="typeStatus"><span>{startedAt&&settings.appearance.liveWpm?`${wpm} WPM`:startedAt?'TYPING':'BEGIN'}</span>{startedAt&&settings.appearance.liveAccuracy&&<span>{accuracy}%</span>}{settings.appearance.timer!=='hidden'&&<span>{cfg.mode==='time'?`${remaining} SEC`:`${Math.max(0,text.length-input.length)} CHARS`}</span>}{cfg.mode!=='quote'&&cfg.mode!=='custom'&&<span className="wordSource">MT WORDSET / {wordPool.length||'—'}</span>}{capsLock&&settings.behavior.capsLockWarning&&<span className="capsWarning">CAPS LOCK</span>}<span>{cfg.quickRestart.toUpperCase()} / RESTART</span></div>
  </>:<div className={`result ${failure?'failedResult':''}`}><div className="resultKicker"><p>{failure?'SESSION / FAILED':isPb?'SESSION / NEW PERSONAL BEST':'SESSION / COMPLETE'}</p>{failure&&<b>{failure}</b>}</div><strong>{wpm}</strong><h3>WORDS / MINUTE</h3><div className="resultGrid"><span><b>{accuracy}%</b>ACCURACY</span><span><b>{raw}</b>RAW</span><span><b>{consistency}%</b>CONSISTENCY</span><span><b>{incorrect}</b>ERRORS</span></div><ResultGraph samples={samples}/><div className="resultActions"><button onClick={restart}>AGAIN ↗</button><button onClick={practiceWeak}>PRACTICE WEAK KEYS ↗</button><button onClick={()=>navigate('/stats')}>HISTORY ↗</button></div></div>}
 </main>
}
