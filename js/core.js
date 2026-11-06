/* Core: storage, spaced repetition, speech + recorded audio. Needs content (js/content.js) loaded first. */
const BR={core:'--btn',food:'--br-food',travel:'--br-travel',people:'--br-people',life:'--br-life',words:'--br-words'};
const uTxt=(u,k)=>{const v=UNITS[u][k];return typeof v==='object'?v[st.lang]:v};
const tgt=(id,l=st.lang)=>S[id][l];
const allIds=(l=st.lang)=>S.map((_,i)=>i).filter(i=>S[i][l]);
const gistsFor=(u,l=st.lang)=>GIST.map((g,i)=>({...g,id:'g'+i})).filter(g=>g.u===u&&g.l===l);
const gistById=id=>GIST[+String(id).slice(1)];
const textOf=id=>typeof id==='string'&&id[0]==='g'?gistById(id).t:tgt(id);
const DAY=864e5, MIN=6e4;
let session=null,sheetOpen=false,confirmReset=false; // UI state shared by core.js and ui.js

/* ---------- storage ---------- */
const KEY=APP.storageKey;
const LANG_IDS=Object.keys(LANGS);
const perLang=mk=>Object.fromEntries(LANG_IDS.map(l=>[l,mk()]));
let st={lang:LANG_IDS[0],theme:'auto',recVoice:perLang(()=>'mix'),cards:perLang(()=>({})),slow:false,sfx:true,xp:perLang(()=>0),voice:perLang(()=>''),streak:{last:'',n:0}};
try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);st={...st,...p,cards:{...st.cards,...(p.cards||{})},voice:{...st.voice,...(p.voice||{})},recVoice:{...st.recVoice,...(p.recVoice||{})},xp:{...st.xp,...(p.xp||{})}};if(!LANGS[st.lang])st.lang=LANG_IDS[0]}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function applyTheme(){const r=document.documentElement;if(st.theme==='light'||st.theme==='dark')r.dataset.theme=st.theme;else delete r.dataset.theme}
applyTheme();
const THEMES=['auto','light','dark'];
const cards=()=>st.cards[st.lang];
const pick=a=>a[Math.random()*a.length|0];

/* ---------- SM-2 scheduler ---------- */
function nextState(c,g){ // g: 0 again,1 hard,2 good,3 easy
  c={ef:2.5,iv:0,reps:0,lapses:0,...c};
  const now=Date.now();
  if(g===0)return {...c,reps:0,iv:0,lapses:c.lapses+1,ef:Math.max(1.3,c.ef-.2),due:now+MIN};
  let iv,ef=c.ef;
  if(g===1){iv=c.reps===0?1:Math.max(c.iv+1,Math.round(c.iv*1.2));ef=Math.max(1.3,ef-.15)}
  else if(g===2){iv=c.reps===0?1:c.reps===1?3:Math.round(c.iv*ef)}
  else{iv=c.reps===0?4:Math.round(Math.max(c.iv,1)*ef*1.3);ef+=.15}
  return {...c,ef,reps:c.reps+1,iv,due:now+iv*DAY};
}
const fmtIv=d=>d<30?d+'d':d<365?Math.round(d/30)+'mo':(d/365).toFixed(1)+'y';
const dueList=()=>Object.entries(cards()).filter(([,c])=>c.due<=Date.now()).map(([id])=>+id);

/* ---------- XP / level ---------- */
const lvlOf=xp=>Math.floor(Math.sqrt(xp/40))+1;
const xpFor=l=>40*(l-1)*(l-1);

/* ---------- speech + sfx ---------- */
const hasTTS='speechSynthesis' in window;
let voices=[];
function loadVoices(){if(!hasTTS)return;try{voices=speechSynthesis.getVoices()}catch(e){voices=[]}}
if(hasTTS){loadVoices();try{speechSynthesis.onvoiceschanged=()=>{loadVoices();if(sheetOpen)renderSheet()}}catch(e){}}
const langVoices=(l=st.lang)=>voices.filter(v=>v.lang.toLowerCase().replace('_','-').startsWith(l));
function pickVoice(l=st.lang){
  const vs=langVoices(l),code=LANGS[l].code.toLowerCase();
  return vs.find(v=>v.name===st.voice[l])||vs.find(v=>v.lang.toLowerCase().replace('_','-')===code)||vs[0]||null;
}
let ttsUnlocked=false,lastUtter=null,ttsLog='not tried yet';
function unlockTTS(){
  if(ttsUnlocked||!hasTTS)return;ttsUnlocked=true;
  try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);loadVoices()}catch(e){ttsLog='unlock failed: '+e.message}
}
document.addEventListener('pointerdown',unlockTTS,{capture:true});
document.addEventListener('keydown',unlockTTS,{capture:true});
function toast(msg){
  let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}
  t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,4500);
}
function ttsSpeak(text,slow=st.slow){
  if(!hasTTS){ttsLog='speechSynthesis missing';return}
  try{
    if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();
    speechSynthesis.resume();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=LANGS[st.lang].code;const v=pickVoice();if(v)u.voice=v;
    u.rate=slow?.62:.95;u.volume=1;
    lastUtter=u; // keep a reference, some browsers drop it otherwise
    const bp=document.querySelector('.big-play');
    u.onstart=()=>{ttsLog='playing ('+(v?v.name:'default voice')+')';bp&&bp.classList.add('talking')};
    u.onend=()=>{bp&&bp.classList.remove('talking')};
    u.onerror=e=>{bp&&bp.classList.remove('talking');
      if(e.error==='interrupted'||e.error==='canceled')return;
      ttsLog='error: '+e.error;toast('Device speech unavailable here ('+e.error+'). Recorded voices fix this: see Settings.')};
    speechSynthesis.speak(u);
    ttsLog='queued, '+voices.length+' voices on device';
  }catch(e){ttsLog='exception: '+e.message;toast('Audio failed: '+e.message)}
}
/* recorded audio, described by audio/manifest.json
   v2 (several voices): {"ext":"m4a","voices":{"es":{"female":["0","1","g0"],"male":[...]},"pt":{...}}}
                        -> audio/<lang>/<voice>/<id>.<ext>
   v1 (one voice):      {"ext":"m4a","es":["0","1"],"pt":[...]} -> audio/<lang>/<id>.<ext> */
let manifest=null,curAudio=null,warnedTTS=false;
function parseManifest(m){
  const out={ext:/^[a-z0-9]{2,4}$/.test(m.ext||'')?m.ext:'m4a',voices:perLang(()=>({}))};
  for(const l of LANG_IDS){
    if(m.voices&&m.voices[l])for(const [v,ids] of Object.entries(m.voices[l])){if(/^[a-z0-9_-]{1,24}$/i.test(v)&&Array.isArray(ids))out.voices[l][v]=new Set(ids.map(String))}
    else if(Array.isArray(m[l]))out.voices[l]['']=new Set(m[l].map(String));
  }
  return out;
}
fetch('audio/manifest.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(m=>{if(m){manifest=parseManifest(m);if(!session&&!sheetOpen&&typeof renderHome==='function')renderHome()}}).catch(()=>{});
const recVoices=(l=st.lang)=>manifest?Object.keys(manifest.voices[l]).filter(v=>manifest.voices[l][v].size):[];
const recorded=(l=st.lang)=>Math.max(0,...recVoices(l).map(v=>manifest.voices[l][v].size));
function clipFor(id){
  const l=st.lang,key=String(id),has=recVoices(l).filter(v=>manifest.voices[l][v].has(key));
  if(!has.length)return null;
  const pref=st.recVoice[l]||'mix';
  const v=pref==='mix'?has[[...key].reduce((a,c)=>a+c.charCodeAt(0),0)%has.length]:has.includes(pref)?pref:has[0];
  return `audio/${l}/${v?v+'/':''}${encodeURIComponent(key)}.${manifest.ext}`;
}
const audioLabel=()=>{const v=recVoices();return v.length?`recorded ${v.filter(Boolean).length>1?v.length+' voices':'voice'} · ${recorded()} clips`:'device speech'};
function speak(id,slow=st.slow){
  const bp=document.querySelector('.big-play');
  if(curAudio){try{curAudio.pause()}catch(e){}curAudio=null}
  const clip=manifest&&clipFor(id);
  if(clip){
    try{
      if(hasTTS)speechSynthesis.cancel();
      const a=new Audio(clip);
      a.preservesPitch=true;a.playbackRate=slow?.72:1;curAudio=a;
      a.onplay=()=>bp&&bp.classList.add('talking');
      a.onended=a.onpause=()=>bp&&bp.classList.remove('talking');
      a.play().then(()=>{ttsLog='recorded clip playing'}).catch(e=>{ttsLog='clip failed: '+e.name;ttsSpeak(textOf(id),slow)});
      return;
    }catch(e){ttsLog='clip error: '+e.message}
  }
  ttsSpeak(textOf(id),slow);
  if(hasTTS&&!warnedTTS){
    setTimeout(()=>{if(!/^playing/.test(ttsLog)&&!warnedTTS){warnedTTS=true;toast('Device speech is silent here. Recorded voices fix this: see Settings.')}},2500);
  }
}
let actx=null;
function sfx(kind){
  if(!st.sfx)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const notes=kind==='ok'?[660,880]:kind==='bad'?[220,165]:kind==='tap'?[520]:[523,659,784,1046];
    notes.forEach((f,i)=>{
      const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+i*.09;
      o.type=kind==='bad'?'triangle':'sine';o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='tap'?.05:.12,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.22);
      o.connect(g).connect(actx.destination);o.start(t);o.stop(t+.25);
    });
  }catch(e){}
}

