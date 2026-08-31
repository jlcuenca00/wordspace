export const originalQuotes={
 short:[
  'Clarity arrives when the noise finally leaves the room.',
  'Speed is useful, but rhythm is what makes typing feel effortless.',
  'A quiet interface can still carry a very strong point of view.',
  'The best tools disappear the moment the work begins.',
  'Practice becomes satisfying when progress is visible.'
 ],
 medium:[
  'There is a point in every long session where conscious effort gives way to rhythm, and the keyboard begins to feel less like an object and more like an extension of thought.',
  'Good typing is not simply a contest of speed. Accuracy, consistency, recovery, and comfort matter because the goal is to make language move with as little friction as possible.',
  'A well designed workspace does not demand attention from the person using it. It creates enough structure to feel intentional, then gets out of the way when focus arrives.',
  'The fastest way to improve is often to stop practicing what already feels easy and spend more time with the awkward letters, transitions, and words that interrupt your flow.'
 ],
 long:[
  'Touch typing becomes most interesting when you stop thinking about individual keys and start noticing the larger rhythm of phrases. At first the improvement is mechanical: fewer glances at the keyboard, fewer pauses, cleaner corrections. Later it becomes perceptual. You begin to feel where a sentence is going before your fingers finish the current word, and the distance between thought and text becomes smaller.',
  'A useful typing tool should make repetition feel purposeful rather than empty. It should remember what you struggle with, show whether your consistency is improving, let you shape the test around your habits, and still remain calm enough that the interface never becomes the hardest part of the exercise.'
 ]
}

export const testPresets=[
 {id:'sprint',name:'SPRINT',detail:'15 SEC / SPEED',patch:{mode:'time',time:15,punctuation:false,numbers:false}},
 {id:'standard',name:'STANDARD',detail:'30 SEC / BALANCED',patch:{mode:'time',time:30,punctuation:false,numbers:false}},
 {id:'endurance',name:'ENDURANCE',detail:'120 SEC / STAMINA',patch:{mode:'time',time:120,punctuation:true,numbers:false}},
 {id:'precision',name:'PRECISION',detail:'50 WORDS / CLEAN',patch:{mode:'words',words:50,punctuation:true,numbers:true}},
 {id:'quote',name:'QUOTE',detail:'MEDIUM / NATURAL',patch:{mode:'quote',quoteLength:'medium',punctuation:true,numbers:false}},
 {id:'weakness',name:'WEAKNESS',detail:'PERSONAL / ADAPTIVE',patch:{mode:'practice',punctuation:false,numbers:false}}
]

export const keyboardLayouts={
 qwerty:[['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['z','x','c','v','b','n','m']],
 colemak:[['q','w','f','p','g','j','l','u','y',';'],['a','r','s','t','d','h','n','e','i','o'],['z','x','c','v','b','k','m']],
 dvorak:[["'",',','.','p','y','f','g','c','r','l'],['a','o','e','u','i','d','h','t','n','s'],[';','q','j','k','x','b','m','w','v','z']]
}

export function pickQuote(length='medium',seed=0){
 const list=length==='all'?[...originalQuotes.short,...originalQuotes.medium,...originalQuotes.long]:(originalQuotes[length]||originalQuotes.medium)
 return list[Math.abs(seed)%list.length]
}

export function buildPracticeText(pool,weakChars,count=60){
 const source=pool?.length?pool:[]
 if(!source.length)return 'practice the keys that interrupt your rhythm until each transition begins to feel natural'
 const chars=(weakChars||[]).map(x=>x[0]).filter(Boolean)
 const weighted=source.filter(w=>!chars.length||chars.some(c=>String(w).toLowerCase().includes(c)))
 const usable=weighted.length>=12?weighted:source
 return Array.from({length:count},()=>String(usable[Math.floor(Math.random()*usable.length)])).join(' ')
}

export function consistencyScore(samples){
 const values=(samples||[]).map(x=>Number(x.wpm)||0).filter(x=>x>0)
 if(values.length<2)return 100
 const mean=values.reduce((a,b)=>a+b,0)/values.length
 const variance=values.reduce((a,b)=>a+Math.pow(b-mean,2),0)/values.length
 const cv=Math.sqrt(variance)/Math.max(mean,1)
 return Math.max(0,Math.min(100,Math.round((1-cv)*100)))
}
