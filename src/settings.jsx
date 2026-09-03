import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE='wordspace_settings_v6'
const SOUND_PACK_IDS=['eg-oreo','box-jade','nk-cream']

export const themes={
 wordspace:{name:'WORDSPACE',bg:'#0b0d12',surface:'#10131a',text:'#f0f2f5',muted:'#737b89',faint:'#252b36',error:'#e66b70',caret:'#f7f9fc',accent:'#4d7cff'},
 cobalt:{name:'COBALT',bg:'#0b1020',surface:'#111a31',text:'#dce7ff',muted:'#637397',faint:'#1f2b49',error:'#d66574',caret:'#eef4ff',accent:'#7197e8'},
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
 mint:{name:'MINT',bg:'#e9f2ec',surface:'#dceae1',text:'#1e2d24',muted:'#6b8272',faint:'#c4d6ca',error:'#b65358',caret:'#223229',accent:'#6e9f80'},
 ember:{name:'EMBER',bg:'#160d0a',surface:'#25140e',text:'#f0ddd1',muted:'#805f51',faint:'#3c2119',error:'#e05555',caret:'#fff0e6',accent:'#db6d3e'},
 plum:{name:'PLUM',bg:'#190f19',surface:'#271727',text:'#eadcea',muted:'#806980',faint:'#3c263c',error:'#d46b78',caret:'#fff0ff',accent:'#b777b7'},
 solar:{name:'SOLAR',bg:'#181713',surface:'#24221a',text:'#eee8c8',muted:'#7d775d',faint:'#373328',error:'#cf625b',caret:'#fff7cf',accent:'#d8b84e'},
 ice:{name:'ICE',bg:'#0b1116',surface:'#101b23',text:'#deeff7',muted:'#58717e',faint:'#1c303b',error:'#d26772',caret:'#ecfbff',accent:'#73c8e6'},
 wine:{name:'WINE',bg:'#180d10',surface:'#261319',text:'#f0dfe3',muted:'#80636b',faint:'#3d2028',error:'#e46e77',caret:'#fff0f3',accent:'#b96a80'},
 moss:{name:'MOSS',bg:'#13150d',surface:'#1d2113',text:'#e4ead4',muted:'#6d7755',faint:'#2e3620',error:'#c66a5d',caret:'#f5f8e9',accent:'#91a968'},

 mt8008:{name:'8008',bg:'#333a45',surface:'#2e343d',text:'#e9ecf0',muted:'#939eae',faint:'#596271',error:'#da3333',caret:'#f44c7f',accent:'#f44c7f'},
 mt9009:{name:'9009',bg:'#eeebe2',surface:'#d3cfc1',text:'#080909',muted:'#99947f',faint:'#bbb5a4',error:'#c87e74',caret:'#7fa480',accent:'#080909'},
 afterdark:{name:'80S AFTER DARK',bg:'#1b1d36',surface:'#17182c',text:'#e1e7ec',muted:'#99d6ea',faint:'#313552',error:'#fffb85',caret:'#99d6ea',accent:'#fca6d1'},
 aether:{name:'AETHER',bg:'#101820',surface:'#292136',text:'#eedaea',muted:'#cf6bdd',faint:'#3d3150',error:'#ff5253',caret:'#eedaea',accent:'#eedaea'},
 alduin:{name:'ALDUIN',bg:'#1c1c1c',surface:'#242424',text:'#f5f3ed',muted:'#444444',faint:'#333333',error:'#af5f5f',caret:'#e3e3e3',accent:'#dfd7af'},
 alpine:{name:'ALPINE',bg:'#6c687f',surface:'#77738c',text:'#ffffff',muted:'#9994b8',faint:'#85809b',error:'#e32b2b',caret:'#585568',accent:'#ffffff'},
 antihero:{name:'ANTI HERO',bg:'#00002e',surface:'#060548',text:'#f1deef',muted:'#ff3d8b',faint:'#2b2865',error:'#8fecff',caret:'#ffffff',accent:'#ffadad'},
 arch:{name:'ARCH',bg:'#0c0d11',surface:'#171a25',text:'#f6f5f5',muted:'#454864',faint:'#292c3d',error:'#ff4754',caret:'#7ebab5',accent:'#7ebab5'},
 aurora:{name:'AURORA',bg:'#011926',surface:'#000c13',text:'#ffffff',muted:'#245c69',faint:'#163b46',error:'#b94da1',caret:'#00e980',accent:'#00e980'},
 beach:{name:'BEACH',bg:'#ffeead',surface:'#f7dc8f',text:'#5b7869',muted:'#ffcc5c',faint:'#d8be72',error:'#ff6f69',caret:'#ffcc5c',accent:'#96ceb4'},
 bento:{name:'BENTO',bg:'#2d394d',surface:'#263041',text:'#fffaf8',muted:'#4a768d',faint:'#38556b',error:'#ee2a3a',caret:'#ff7a90',accent:'#ff7a90'},
 bingsu:{name:'BINGSU',bg:'#b8a7aa',surface:'#ab989e',text:'#ebe6ea',muted:'#48373d',faint:'#8d7a81',error:'#921341',caret:'#ebe6ea',accent:'#83616e'},
 bliss:{name:'BLISS',bg:'#262727',surface:'#343231',text:'#ffffff',muted:'#665957',faint:'#4e4745',error:'#bd4141',caret:'#f0d3c9',accent:'#f0d3c9'},
 bluedolphin:{name:'BLUE DOLPHIN',bg:'#003950',surface:'#014961',text:'#82eaff',muted:'#00e4ff',faint:'#006c87',error:'#ffbde6',caret:'#00bcd4',accent:'#ffcefb'},
 blueberrydark:{name:'BLUEBERRY DARK',bg:'#212b42',surface:'#1b2334',text:'#91b4d5',muted:'#5c7da5',faint:'#344765',error:'#df4576',caret:'#962f7e',accent:'#add7ff'},
 blueberrylight:{name:'BLUEBERRY LIGHT',bg:'#dae0f5',surface:'#c1c7df',text:'#678198',muted:'#92a4be',faint:'#aeb8cf',error:'#df4576',caret:'#df4576',accent:'#506477'},
 botanical:{name:'BOTANICAL',bg:'#7b9c98',surface:'#72908d',text:'#eaf1f3',muted:'#495755',faint:'#617572',error:'#f6c9b4',caret:'#abc6c4',accent:'#eaf1f3'},
 bouquet:{name:'BOUQUET',bg:'#173f35',surface:'#1f4e43',text:'#e9e0d2',muted:'#408e7b',faint:'#316f61',error:'#d44729',caret:'#eaa09c',accent:'#eaa09c'},
 breeze:{name:'BREEZE',bg:'#e8d5c4',surface:'#f6e6da',text:'#1b4c5e',muted:'#3a98b9',faint:'#cbb6ab',error:'#7d67a9',caret:'#7d67a9',accent:'#7d67a9'},
 bushido:{name:'BUSHIDO',bg:'#242933',surface:'#1c222d',text:'#f6f0e9',muted:'#596172',faint:'#3b4351',error:'#ec4c56',caret:'#ec4c56',accent:'#ec4c56'},
 cafe:{name:'CAFE',bg:'#ceb18d',surface:'#bba180',text:'#14120f',muted:'#d4d2d1',faint:'#a58c70',error:'#c82931',caret:'#14120f',accent:'#14120f'},
 camping:{name:'CAMPING',bg:'#faf1e4',surface:'#e7dccb',text:'#3c403b',muted:'#c2b8aa',faint:'#d2c7b6',error:'#ad4f4e',caret:'#618c56',accent:'#618c56'},
 carbon:{name:'CARBON',bg:'#313131',surface:'#2b2b2b',text:'#f5e6c8',muted:'#616161',faint:'#444444',error:'#e72d2d',caret:'#f66e0d',accent:'#f66e0d'},
 catppuccin:{name:'CATPPUCCIN',bg:'#1e1e2e',surface:'#181825',text:'#cdd6f4',muted:'#7f849c',faint:'#45475a',error:'#f38ba8',caret:'#f2cdcd',accent:'#cba6f7'},
 chaos:{name:'CHAOS THEORY',bg:'#141221',surface:'#1e1d2f',text:'#dde5ed',muted:'#676e8a',faint:'#34364d',error:'#fd77d7',caret:'#dde5ed',accent:'#fd77d7'},
 cheesecake:{name:'CHEESECAKE',bg:'#fdf0d5',surface:'#f3e2bf',text:'#3a3335',muted:'#d91c81',faint:'#ddc9ac',error:'#5cf074',caret:'#892948',accent:'#8e2949'},
 cherryblossom:{name:'CHERRY BLOSSOM',bg:'#323437',surface:'#2d2f31',text:'#d1d0c5',muted:'#787d82',faint:'#484b4f',error:'#ca4754',caret:'#ffffff',accent:'#d65ccc'},
 comfy:{name:'COMFY',bg:'#4a5b6e',surface:'#425366',text:'#f5efee',muted:'#9ec1cc',faint:'#65778b',error:'#c9465e',caret:'#9ec1cc',accent:'#f8cdc6'},
 copper:{name:'COPPER',bg:'#442f29',surface:'#50362e',text:'#e7e0de',muted:'#7ebab5',faint:'#6b4b41',error:'#a32424',caret:'#c25c42',accent:'#b46a55'},
 creamsicle:{name:'CREAMSICLE',bg:'#ff9869',surface:'#fe8954',text:'#fcfcf8',muted:'#ff661f',faint:'#e37448',error:'#6a0dad',caret:'#fcfcf8',accent:'#fcfcf8'}
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
 sound:{enabled:false,volume:0.35,profile:'eg-oreo'},
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

const normalizeSettings=value=>{
 const rawSound=value?.sound||{}
 const numericVolume=Number(rawSound.volume)
 return {
  ...value,
  sound:{
   enabled:Boolean(rawSound.enabled),
   volume:Number.isFinite(numericVolume)?Math.max(0,Math.min(1,numericVolume)):defaults.sound.volume,
   profile:SOUND_PACK_IDS.includes(rawSound.profile)?rawSound.profile:defaults.sound.profile
  }
 }
}

export function SettingsProvider({children}){
 const[settings,setSettings]=useState(()=>{
  try{
   const saved=localStorage.getItem(STORAGE)||localStorage.getItem('wordspace_settings_v5')||localStorage.getItem('wordspace_settings_v4')||localStorage.getItem('wordspace_settings_v3')||localStorage.getItem('wordspace_settings_v2')||'{}'
   return normalizeSettings(merge(defaults,JSON.parse(saved)))
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
