import { keyboardLayouts } from '../typingData'

export default function KeyboardGuide({layout='qwerty',current='',mistakes={}}){
 const rows=keyboardLayouts[layout]||keyboardLayouts.qwerty
 const target=String(current||'').toLowerCase()
 return <div className="keymap" aria-label={`${layout} keyboard guide`}>
  <div className="keymapMeta"><span>KEYMAP / {layout.toUpperCase()}</span><span>NEXT / {target===' '?'SPACE':target||'—'}</span></div>
  <div className="keyRows">{rows.map((row,r)=><div className="keyRow" key={r}>{row.map(k=>{
   const errors=mistakes[k]||0
   return <span key={k} className={`${target===k?'next':''} ${errors?'errorKey':''}`} title={errors?`${errors} mistake${errors===1?'':'s'}`:''}><b>{k}</b>{errors>0&&<i>{errors}</i>}</span>
  })}</div>)}</div>
  <div className={`spaceKey ${target===' '?'next':''}`}><span>SPACE</span></div>
 </div>
}
