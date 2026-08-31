import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE='wordspace_settings_v5'

export const themes={
 wordspace:{name:'WORDSPACE',bg:'#0b0d12',surface:'#10131a',text:'#f0f2f5',muted:'#737b89',faint:'#252b36',error:'#e66b70',caret:'#f7f9fc',accent:'#4d7cff'},
 mono:{name:'MONO',bg:'#090908',surface:'#10100f',text:'#e9e9e2',muted:'#50504b',faint:'#252522',error:'#b65d56',caret:'#f4f4ed',accent:'#e9e9e2'},
 paper:{name:'PAPER',bg:'#e8e4d8',surface:'#ded9cc',text:'#1b1b18',muted:'#858077',faint:'#c8c2b5',error:'#9d463d',caret:'#171714',accent:'#6d675d'},
 ink:{name:'INK',bg:'#111319',surface:'#161922',text:'#dfe3ea',muted:'#626a78',faint:'#272c38',error:'#be6d71',caret:'#f1f4fa',accent:'#8ea4c8'},
 void:{name:'VOID',bg:'#000000',surface:'#080808',text:'#ffffff',muted:'#3d3d3d',faint:'#181818',error:'#d45f5f',caret:'#ffffff',accent:'#ffffff'},
 warm:{name:'WARM',bg:'#17130f',surface:'#201a15',text:'#eadfce',muted:'#75695a',faint:'#322a22',error:'#c46b59',caret:'#f4e7d2',accent:'#d8aa72'},
 terminal:{name:'TERMINAL',bg:'#07100b',surface:'#0b1710',text:'#a8d8b1',muted:'#42634a',faint:'#17301f',error:'#d36b6b',caret:'#baf9c6',accent:'#72e08c'},
 arctic:{name:'ARCTIC',bg:'#eef3f7',surface:'#e4ebf1',text:'#19212a',muted:'#71808d',faint:'#ccd7df',error:'#b9515d',caret:'#111a22',accent:'#4a789f'},
 graphite:{name:'GRAPHITE',bg:'#17181a',surface:'#202225',text:'#d9d9d6',muted:'#666a70',faint:'#303338',error:'#cf6767',caret:'#f0f0ec',accent:'#9fa6ae'},
 sakura:{name:'SAKURA',bg:'#f8eeee',surface:'#f2e1e4',text:'#3a292f',muted:'#9a737f',faint:'#dfcbd0',error:'#ba5268',caret:'#6f3446',accent:'#d78399'},
 lavender:{name:'LAVENDER',bg:'#16141e',surface:'#211e2c',text:'#e5def2',muted:'#7c718e',faint:'#332d42',error:'#d36f82',caret:'#f2eaff',accent:'#a88bd4'},
 ocean:{name:'OCEAN',bg:'#07141b',surface:'#0b202a',text:'#d6eef5',muted:'#50717d',faint:'#153641',error:'#d36a6a',caret:'#e7fbff',accent:'#49abc4'},
 forest:{name:'FOREST',bg:'#0d1510',surface:'#152019',text:'#dce9de',muted:'#607465',faint:'#28372c',error:'#c96c63',caret:'#eef7ef',accent:'#7baa84'},
 coffee:{name:'COFFEE',bg:'#1b1512',surface:'#251d18',text:'#eadfd6',muted:'#806f63',faint:'#3a2e27',error:'#c9675c',caret:'#fff2e6',accent:'#b78665'},
 sand:{name:'SAND',bg:'#e9e0cf',surface:'#ddd1bc',text:'#29231b',muted:'#8b7d69',faint:'#c7baa3',error:'#a95247',caret:'#31271d',accent:'#9f7952'},
 dusk:{name:'DUSK',bg:'#171722',surface:'#222232',text:'#e5e1eb',muted:'#777286',faint:'#343247',error:'#d46e78',caret:'#f3eef8',accent:'#8d83b9'},
 coral:{name:'CORAL',bg:'#211414',surface:'#2d1b1b',text:'#f1ded7',muted:'#8f6b64',faint:'#472b29',error:'#f06f68',caret:'#fff0e8',accent:'#e67d68'},
 cobalt:{name:'COBALT',bg:'#0b1020',surface:'#111a31',text:'#dce7ff',muted:'#637397',faint:'#1f2b49',error:'#d66574',caret:'#eef4ff',accent:'#7197e8'},
 mint:{name:'MINT',bg:'#e9f2ec',surface:'#dceae1',text:'#1e2d24',muted:'#6b8272',faint:'#c4d6ca',error:'#b65358',caret:'#223229',accent:'#6e9f80'},
 ember:{name:'EMBER',bg:'#160d0a',surface:'#25140e',text:'#f0ddd1',muted:'#805f51',faint:'#3c2119',error:'#e05555',caret:'#fff0e6',accent:'#db6d3e'},
 plum:{name:'PLUM',bg:'#190f19',surface:'#271727',text:'#eadcea',muted:'#806980',faint:'#3c263c',error:'#d46b78',caret:'#fff0ff',accent:'#b777b7'},
 solar:{name:'SOLAR',bg:'#181713',surface:'#24221a',text:'#eee8c8',muted:'#7d775d',faint:'#373328',error:'#cf625b',caret:'#fff7cf',accent:'#d8b84e'},
 ice:{name:'ICE',bg:'#0b1116',surface:'#101b23',text:'#deeff7',muted:'#58717e',faint:'#1c303b',error:'#d26772',caret:'#ecfbff',accent:'#73c8e6'},
 wine:{name:'WINE',bg:'#180d10',surface:'#261319',text:'#f0dfe3',muted:'#80636b',faint:'#3d2028',error:'#e46e77',caret:'#fff0f3',accent:'#b96a80'},
 moss:{name:'MOSS',bg:'#13150d',surface:'#1d2113',text:'#e4ead4',muted:'#6d7755',faint:'#2e3620',error:'#c66a5d',caret:'#f5f8e9',accent:'#91a968'}
}

export const fontOptions=[
 ['inter','INTER'],['mono','IBM PLEX MONO'],['roboto-mono','ROBOTO MONO'],['jetbrains-mono','JETBRAINS MONO'],['ibm-plex-mono','IBM PLEX MONO'],['fira-code','FIRA CODE'],['space-mono','SPACE MONO'],['inconsolata','INCONSOLATA'],['source-code-pro','SOURCE CODE PRO'],['ubuntu-mono','UBUNTU MONO'],['manrope','MANROPE'],['literata','LITERATA'],['lora','LORA'],['merriweather','MERRIWEATHER'],['playfair','PLAYFAIR DISPLAY'],['serif','GEORGIA'],['system','SYSTEM']
]

const customDefault={name:'CUSTOM',bg:'#0d0d0c',surface:'#161614',text:'#efefe8',muted:'#64645d',faint:'#2b2b27',error:'#cf625c',caret:'#ffffff',accent:'#4d7cff'}

export const defaults={
 theme:'wordspace',
 customTheme:customDefault,
 test:{mode:'time',time:30,words:25,punctuation:false,numbers:false,language:'english',difficulty:'normal',quoteLength:'medium',customText:'',quickRestart:'tab'},
 behavior:{stopOnError:'off',confidence:false,strictSpace:false,typedText:'keep',lineScroll:'smooth',capsLockWarning:true,focusWarning:true,minWpm:0,minAccuracy:0},
 caret:{style:'beam',speed:'medium',blink:true,width:2,paceEnabled:false,paceWpm:80},
 typography:{font:'roboto-mono',size:40,lineHeight:1.5,letterSpacing:-0.03,width:1000},
 sound:{enabled:false,volume:0.22,profile:'soft',error:true},
 appearance:{liveWpm:true,liveAccuracy:true,timer:'minimal',controls:'hide',lines:3,motion:'full',keymap:false,keymapLayout:'qwerty',showPb:true}
}

const Ctx=createContext(null)
const merge=(a,b)=>({
 ...a,
 ...b,
 customTheme:{...a.customTheme,...b?.customTheme},
 test:{...a.test,...b?.test},
 behavior:{...a.behavior,...b?.behavior},
 caret:{...a.caret,...b?.caret},
 typography:{...a.typography,...b?.typography},
 sound:{...a.sound,...b?.sound},
 appearance:{...a.appearance,...b?.appearance}
})

export function SettingsProvider({children}){
 const[settings,setSettings]=useState(()=>{
  try{
   const saved=localStorage.getItem(STORAGE)||localStorage.getItem('wordspace_settings_v4')||localStorage.getItem('wordspace_settings_v3')||localStorage.getItem('wordspace_settings_v2')||'{}'
   return merge(defaults,JSON.parse(saved))
  }catch{return defaults}
 })
 const[panel,setPanel]=useState({open:false,section:'test'})

 useEffect(()=>{localStorage.setItem(STORAGE,JSON.stringify(settings))},[settings])
 useEffect(()=>{
  const t=settings.theme==='custom'?settings.customTheme:(themes[settings.theme]||themes.wordspace)
  const root=document.documentElement
  Object.entries({
   '--bg':t.bg,'--surface':t.surface,'--text':t.text,'--muted':t.muted,'--faint':t.faint,'--error':t.error,'--caret':t.caret,'--accent':t.accent,
   '--typing-size':`${settings.typography.size}px`,'--typing-line':settings.typography.lineHeight,'--typing-spacing':`${settings.typography.letterSpacing}em`,'--typing-width':`${settings.typography.width}px`
  }).forEach(([key,value])=>root.style.setProperty(key,value))
  root.dataset.theme=settings.theme
  root.dataset.motion=settings.appearance.motion
 },[settings])
 useEffect(()=>{
  const key=event=>{
   if((event.ctrlKey||event.metaKey)&&event.key===','){
    event.preventDefault()
    setPanel(current=>({...current,open:!current.open}))
   }
   if(event.key==='Escape')setPanel(current=>({...current,open:false}))
  }
  window.addEventListener('keydown',key)
  return()=>window.removeEventListener('keydown',key)
 },[])

 const api=useMemo(()=>({
  settings,panel,
  update(section,patch){setSettings(current=>section?({...current,[section]:{...current[section],...patch}}):({...current,...patch}))},
  setTheme(theme){setSettings(current=>({...current,theme}))},
  updateCustomTheme(patch){setSettings(current=>({...current,theme:'custom',customTheme:{...current.customTheme,...patch}}))},
  reset(){setSettings(defaults)},
  openSettings(section='test'){setPanel({open:true,section})},
  closeSettings(){setPanel(current=>({...current,open:false}))},
  setSection(section){setPanel(current=>({...current,section}))}
 }),[settings,panel])

 return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useSettings=()=>useContext(Ctx)
