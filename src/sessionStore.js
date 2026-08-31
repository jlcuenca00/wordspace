const KEY='wordspace_typing_sessions_v1'
const MAX=300

export function loadSessions(){
 try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(data)?data:[]}catch{return[]}
}

export function saveSession(session){
 const next=[session,...loadSessions()].slice(0,MAX)
 localStorage.setItem(KEY,JSON.stringify(next))
 return next
}

export function clearSessions(){localStorage.removeItem(KEY)}

export function sessionSignature(s){
 const amount=s.mode==='time'?s.time:s.mode==='words'?s.words:s.mode==='quote'?s.quoteLength||'mixed':s.mode
 return `${s.mode}:${amount}:${s.language||'english'}:${s.punctuation?'p':'-'}:${s.numbers?'n':'-'}`
}

export function getPersonalBest(session,sessions=loadSessions()){
 const sig=sessionSignature(session)
 return sessions.filter(s=>sessionSignature(s)===sig).reduce((best,s)=>Math.max(best,Number(s.wpm)||0),0)
}

export function summarizeSessions(sessions=loadSessions()){
 if(!sessions.length)return{tests:0,pb:0,avgWpm:0,avgAccuracy:0,time:0,chars:0}
 const valid=sessions.filter(s=>!s.failed)
 const base=valid.length?valid:sessions
 return{
  tests:sessions.length,
  pb:base.reduce((m,s)=>Math.max(m,Number(s.wpm)||0),0),
  avgWpm:Math.round(base.reduce((a,s)=>a+(Number(s.wpm)||0),0)/base.length),
  avgAccuracy:Math.round(base.reduce((a,s)=>a+(Number(s.accuracy)||0),0)/base.length*10)/10,
  time:Math.round(sessions.reduce((a,s)=>a+(Number(s.duration)||0),0)),
  chars:sessions.reduce((a,s)=>a+(Number(s.typedChars)||0),0)
 }
}

export function weaknessReport(sessions=loadSessions()){
 const chars={},pairs={}
 sessions.slice(0,100).forEach(s=>(s.mistakes||[]).forEach(m=>{
  const expected=(m.expected||'').toLowerCase()
  if(expected&&expected!==' ')chars[expected]=(chars[expected]||0)+1
  const pair=`${m.expected||'∅'}→${m.typed||'∅'}`
  pairs[pair]=(pairs[pair]||0)+1
 }))
 return{
  chars:Object.entries(chars).sort((a,b)=>b[1]-a[1]).slice(0,10),
  pairs:Object.entries(pairs).sort((a,b)=>b[1]-a[1]).slice(0,8)
 }
}

export function activityByDay(sessions=loadSessions(),days=28){
 const out=[];const now=new Date();now.setHours(0,0,0,0)
 for(let i=days-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);out.push({key,label:d.toLocaleDateString([],{month:'short',day:'numeric'}),count:0})}
 const map=new Map(out.map(x=>[x.key,x]));sessions.forEach(s=>{const key=new Date(s.date||0).toISOString().slice(0,10);if(map.has(key))map.get(key).count++})
 return out
}

export function exportSessions(){return JSON.stringify({exportedAt:new Date().toISOString(),sessions:loadSessions()},null,2)}
