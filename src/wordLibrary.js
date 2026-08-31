const BASE='https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/languages/'

export const wordLibraries=[
 {id:'english',label:'ENGLISH',detail:'200 MOST COMMON'},
 {id:'english_1k',label:'ENGLISH 1K',detail:'1,000 WORDS'},
 {id:'english_5k',label:'ENGLISH 5K',detail:'5,000 WORDS'},
 {id:'english_10k',label:'ENGLISH 10K',detail:'10,000 WORDS'},
 {id:'english_commonly_misspelled',label:'MISSPELLED',detail:'COMMONLY MISSPELLED'},
 {id:'english_legal',label:'LEGAL',detail:'LEGAL ENGLISH'}
]

const fallback='the be of and a to in he have it that for they I with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold govern around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line'.split(' ')
const cache=new Map([['english',fallback]])

export async function loadWordLibrary(id='english'){
 if(cache.has(id))return cache.get(id)
 try{
  const res=await fetch(`${BASE}${id}.json`,{cache:'force-cache'})
  if(!res.ok)throw new Error(`Word library ${res.status}`)
  const data=await res.json()
  const words=Array.isArray(data.words)?data.words.filter(Boolean):fallback
  if(words.length<20)throw new Error('Word library is empty')
  cache.set(id,words)
  return words
 }catch(error){
  console.warn('Wordspace: falling back to the built-in English list.',error)
  return fallback
 }
}

const punctuationMarks=[',','.','?','!',';',':']
export function createTestText(pool,count,{punctuation=false,numbers=false}={}){
 const source=pool?.length?pool:fallback
 const words=Array.from({length:count},()=>String(source[Math.floor(Math.random()*source.length)]))
 if(punctuation){
  for(let i=0;i<words.length;i++){
   if(i===0||/[.!?]$/.test(words[i-1]))words[i]=words[i].charAt(0).toUpperCase()+words[i].slice(1)
   if(i>4&&i%7===0)words[i]+=punctuationMarks[Math.floor(Math.random()*punctuationMarks.length)]
  }
  if(words.length)words[words.length-1]=words[words.length-1].replace(/[,:;]$/, '')+'.'
 }
 if(numbers){for(let i=5;i<words.length;i+=17)words[i]+=` ${Math.floor(Math.random()*900+100)}`}
 return words.join(' ')
}

export const monkeytypeWordSource='Monkeytype official language assets'
