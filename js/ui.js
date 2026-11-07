/* UI: home, sessions, settings. */
/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const unitIds=(u,k)=>allIds().filter(i=>S[i].u===u&&(k==null||S[i].st===k));
const stageTxt=(u,k,key)=>{const v=UNITS[u].stages[k-1][key];return v&&typeof v==='object'?v[st.lang]:v||''};
const ICON={
 play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>',
 slow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 fire:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.3-4 2.5-5 .2 1.8 1 2.7 2 3-.5-3 .2-6 .5-9z"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
 moon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
 auto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};
const unitIcon=u=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${UNITS[u].ic}"/></svg>`;

/* ---------- unit progress ---------- */
/* A unit has stages (usually 4 x 6 sentences). Stage 1 done = "passed": unlocks the children in the tree.
   Stage k opens when stage k-1 is done (or once you've started it). All stages done = "done". */
function unitInfo(u){
  const ids=unitIds(u),cs=cards();
  const seen=ids.filter(i=>cs[i]).length;
  const strength=ids.length?ids.reduce((a,i)=>a+(cs[i]?Math.min((cs[i].iv||0)/21,1):0),0)/ids.length:0;
  const stages=[];
  UNITS[u].stages.forEach((_,j)=>{
    const k=j+1,sid=ids.filter(i=>S[i].st===k),sseen=sid.filter(i=>cs[i]).length;
    const done=sid.length>0&&sseen===sid.length,open=k===1||stages[j-1].done||sseen>0;
    stages.push({k,ids:sid,seen:sseen,total:sid.length,done,open});
  });
  const real=stages.filter(s=>s.total);
  const cur=real.find(s=>!s.done&&s.open)||null;
  return {ids,seen,total:ids.length,strength,stages:real,cur,nDone:real.filter(s=>s.done).length,
    passed:!!(real[0]&&real[0].done),done:real.length>0&&real.every(s=>s.done)};
}
const unlocked=u=>UNITS[u].parents.every(p=>unitInfo(p).passed)||unitInfo(u).seen>0;

/* ---------- home ---------- */
function streakNow(){
  const today=new Date().toISOString().slice(0,10),yest=new Date(Date.now()-DAY).toISOString().slice(0,10);
  return (st.streak.last===today||st.streak.last===yest)?st.streak.n:0;
}
const openUnits=()=>UNITS.map((_,u)=>u).filter(u=>unlocked(u)&&!unitInfo(u).done).sort((a,b)=>(unitInfo(a).passed-unitInfo(b).passed)||UNITS[a].row-UNITS[b].row||UNITS[a].col-UNITS[b].col);
const ROW=138, TOP=22;
function renderHome(){
  session=null;
  const due=dueList().length,learned=Object.keys(cards()).length,total=allIds().length;
  const open=openUnits();
  const L=LANGS[st.lang],xp=st.xp[st.lang],lv=lvlOf(xp),lo=xpFor(lv),hi=xpFor(lv+1);
  const headline=due?`${due} sentence${due>1?'s':''} ready to review`
    :open.length>1?`${open.length} paths open. Pick one below.`
    :open.length?`Next: ${esc(uTxt(open[0],'sh'))}, stage ${unitInfo(open[0]).cur?unitInfo(open[0]).cur.k:1}`:'Tree complete. Keep your streak alive.';
  $('#app').innerHTML=`
  ${headerHTML()}
  <section class="hero">
    <div>${mascot(st.lang,'idle')}</div>
    <div>
      <div class="bubble">${esc(pick(LINES[st.lang].idle))}</div>
      <h2>${headline}</h2>
      <div class="chips">
        <span class="chip fire">${ICON.fire}${streakNow()} day${streakNow()===1?'':'s'}</span>
        <span class="chip star">${ICON.star}${learned}/${total}</span>
        <span class="chip due">${ICON.clock}${due} due</span>
      </div>
      ${due?'<button class="chunky gold" id="go">Review</button>':''}
    </div>
    <div class="lvl"><span class="badge">Lv ${lv}</span><div class="xpbar"><i style="width:${Math.round((xp-lo)/(hi-lo)*100)}%"></i></div><span>${xp} XP</span></div>
  </section>
  ${pickHTML(open)}
  <div class="map-head" id="treeHead"><h3>${L.native} skill tree</h3><small>${audioLabel()}</small></div>
  <div class="legend"><span><i style="background:var(--br-food)"></i>Food</span><span><i style="background:var(--br-travel)"></i>Travel</span><span><i style="background:var(--br-people)"></i>People</span><span><i style="background:var(--br-life)"></i>Everyday</span><span><i style="background:var(--br-words)"></i>Words</span><span><i style="background:var(--gold)"></i>${L.city} scenario</span></div>
  ${treeHTML('main',open)}
  <div class="map-head"><h3>Word packs</h3><small>Everyday nouns, verbs and times</small></div>
  ${treeHTML('words',open)}`;
  bindHeader();
  if($('#go'))$('#go').onclick=()=>{sfx('tap');startReview()};
  bindPick();
  document.querySelectorAll('.coin').forEach(b=>b.onclick=()=>{
    const u=+b.dataset.unit;
    if(!unlocked(u)){const s=b.closest('.node');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');sfx('bad')}
    else sfx('tap');
    openUnitSheet(u);
  });
}
// "Where to next?" carousel: one swipeable card per open branch
const BR_NAME={core:'Basics',food:'Food',travel:'Travel',people:'People',life:'Everyday',words:'Words'};
let pickIdx=0;
function pickHTML(open){
  if(!open.length)return'';
  const cardsH=open.map(u=>{
    const U=UNITS[u],inf=unitInfo(u),k=inf.cur?inf.cur.k:1,n=inf.stages.length||U.stages.length;
    const tag=U.scen?LANGS[st.lang].city:(BR_NAME[U.br]||U.br);
    return `<article class="pcard" data-unit="${u}" style="--c:var(${U.scen?'--gold':BR_NAME[U.br]&&U.br!=='core'?'--br-'+U.br:'--btn'})">
      <div class="pc-art">${sceneSVG(u,'idle',stageScene(u,k))}</div>
      <div class="pc-body"><span class="pc-tag">${esc(tag)} · Stage ${k}/${n}</span>
        <h4>${esc(stageTxt(u,k,'title')||uTxt(u,'t'))}</h4>
        <p>${esc(stageTxt(u,k,'summary')||uTxt(u,'s'))}</p>
        <div class="pc-row"><span class="pc-pips" aria-label="${inf.nDone} of ${n} stages done">${inf.stages.map(x=>`<i class="${x.done?'on':''}"></i>`).join('')}</span>
        <button class="chunky gold pc-go" data-unit="${u}" data-k="${k}">Let's go!</button></div></div>
    </article>`}).join('');
  return `<section class="pick"><div class="pick-head"><h3>Where to next?</h3>${open.length>1?'<small>swipe ‹ ›</small>':''}</div>
    <div class="pick-rail${open.length===1?' solo':''}">${cardsH}</div>
    ${open.length>1&&open.length<=9?`<div class="pick-dots">${open.map((_,i)=>`<i data-i="${i}"></i>`).join('')}</div>`
      :open.length>9?`<div class="pick-dots count"><b id="pickN">1</b>&nbsp;/ ${open.length}</div>`:''}</section>`;
}
function bindPick(){
  const rail=$('.pick-rail');if(!rail)return;
  const cs=[...rail.children],dots=[...document.querySelectorAll('.pick-dots i')];
  const step=()=>cs.length>1?cs[1].offsetLeft-cs[0].offsetLeft:1;
  const mark=()=>{const i=Math.max(0,Math.min(cs.length-1,Math.round(rail.scrollLeft/step())));pickIdx=i;dots.forEach((d,j)=>d.classList.toggle('on',j===i));if($('#pickN'))$('#pickN').textContent=i+1};
  pickIdx=Math.min(pickIdx,cs.length-1);rail.scrollLeft=pickIdx*step();mark();
  rail.addEventListener('scroll',mark,{passive:true});
  dots.forEach(d=>d.onclick=()=>rail.scrollTo({left:+d.dataset.i*step(),behavior:'smooth'}));
  rail.querySelectorAll('.pc-go').forEach(b=>b.onclick=e=>{e.stopPropagation();sfx('tap');startUnit(+b.dataset.unit,+b.dataset.k)});
  cs.forEach(c=>c.onclick=()=>{sfx('tap');openUnitSheet(+c.dataset.unit)});
}
function treeHTML(kind,open){
  const ids=UNITS.map((_,i)=>i).filter(i=>(UNITS[i].tree||'main')===kind);
  const rows=Math.max(...ids.map(i=>UNITS[i].row))+1,H=TOP+(rows-1)*ROW+112;
  const X=u=>(UNITS[u].col+.5)/4*100, Y=u=>TOP+UNITS[u].row*ROW;
  const L=LANGS[st.lang];
  const links=ids.flatMap(c=>UNITS[c].parents.filter(p=>ids.includes(p)).map(p=>{
    const x1=X(p),y1=Y(p)+30,x2=X(c),y2=Y(c)+30,m=(y1+y2)/2;
    const cls=unitInfo(c).passed?'done':unlocked(c)?'open':'';
    return `<path class="${cls}" d="M${x1} ${y1} C${x1} ${m} ${x2} ${m} ${x2} ${y2}"/>`;
  })).join('');
  const firstOpen=open.find(u=>ids.includes(u));
  return `<div class="tree" style="height:${H}px">
    <svg class="links" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${links}</svg>
    ${ids.map(i=>{
      const u=UNITS[i],inf=unitInfo(i),lock=!unlocked(i),isOpen=!lock&&!inf.passed;
      const cls=lock?'locked':inf.done?'done':inf.passed?'passed':'open';
      const n=inf.stages.length||1,p=lock?0:Math.round(inf.done?100:(inf.nDone+(inf.cur?inf.cur.seen/inf.cur.total:0))/n*100);
      const icon=lock?ICON.lock:inf.done?ICON.check:unitIcon(i);
      const pips=lock?'':`<span class="pips" aria-label="${inf.nDone} of ${n} stages done">${inf.stages.map(s=>`<i class="${s.done?'on':s.seen?'half':''}"></i>`).join('')}</span>`;
      return `<div class="node ${cls}" style="left:${X(i)}%;top:${Y(i)}px;--br:var(${BR[u.br]})">
        <div class="coin-wrap">
          ${u.scen?`<span class="scen">${esc(L.city.toUpperCase())}</span>`:''}
          ${isOpen&&i===firstOpen&&kind==='main'?mascot(st.lang,'idle','side-mascot '+(u.col<2?'r':'l')):''}
          <div class="ring" style="--p:${p}"><button class="coin" data-unit="${i}" aria-label="${esc(uTxt(i,'t'))}${lock?' (locked)':''}">${icon}</button></div>
        </div>
        <div class="label"><b>${esc(uTxt(i,'sh'))}</b><span>${lock?u.lv+' · locked':inf.done?'All '+n+' stages · '+Math.round(inf.strength*100)+'% strong':pips+(inf.cur?' '+inf.cur.seen+'/'+inf.cur.total:'')}</span></div>
      </div>`}).join('')}
  </div>`;
}
function openUnitSheet(u){
  sheetOpen=true;$('#sheet').hidden=false;$('#scrim').hidden=false;
  const inf=unitInfo(u),lock=!unlocked(u),U=UNITS[u];
  const focus=inf.cur?inf.cur.k:1;
  const needs=U.parents.filter(p=>!unitInfo(p).passed).map(p=>uTxt(p,'sh'));
  const coldPool=gistsFor(u).filter(g=>(inf.stages[g.st-1]||{}).open);
  const go=()=>{sfx('tap');sheetOpen=false;$('#sheet').hidden=true;$('#scrim').hidden=true};
  $('#sheet').innerHTML=`<div class="sheet-in unit-sheet">
    <div class="scene sheet-scene">${sceneSVG(u,'idle',stageScene(u,focus))}</div>
    <div><span class="lv">${U.lv}${U.scen?' · '+esc(LANGS[st.lang].city)+' scenario':''}</span><h3>${esc(uTxt(u,'t'))}</h3></div>
    <ol class="stages">${inf.stages.map(s=>{
      const state=lock||!s.open?'locked':s.done?'done':'open';
      const right=state==='locked'?ICON.lock:s.done?ICON.check:s.seen+'/'+s.total;
      return `<li><button class="stg ${state}${inf.cur&&inf.cur.k===s.k&&!lock?' cur':''}" data-stage="${s.k}" ${state==='locked'?'aria-disabled="true"':''}>
        <span class="no">${s.k}</span><span class="tx"><b>${esc(stageTxt(u,s.k,'title'))}</b><small>${esc(stageTxt(u,s.k,'summary'))}</small></span><span class="st">${right}</span></button></li>`}).join('')}</ol>
    ${lock?`<p class="needs">Finish stage 1 of ${needs.map(esc).join(' and ')} to unlock this.</p><button class="chunky" id="uClose">OK</button>`
      :`<button class="chunky ${inf.done?'':'gold'}" id="uStart">${inf.done?'Practise all stages':(inf.cur.seen?'Continue':'Start')+' stage '+inf.cur.k}</button>${coldPool.length?`<button class="chunky cold-btn" id="uCold">Jump in: cold water</button><p class="needs" style="margin-top:-6px">Real-life passages at natural speed, one per open stage. Get the gist, not every word.</p>`:''}<button class="ghost" id="uClose">Not now</button>`}
  </div>`;
  document.querySelectorAll('.stg').forEach(b=>b.onclick=()=>{
    const k=+b.dataset.stage;
    if(b.classList.contains('locked')){sfx('bad');toast(lock?'Unlock this unit first.':'Finish stage '+(k-1)+' first.');return}
    go();startUnit(u,k);
  });
  const s=$('#uStart');if(s)s.onclick=()=>{go();startUnit(u,inf.done?'all':inf.cur.k)};
  const c=$('#uCold');if(c)c.onclick=()=>{go();newSession('cold',shuffle(coldPool).slice(0,4).map(g=>({id:g.id,type:'cold'})),u);renderItem()};
  $('#uClose').onclick=closeSheet;
}
function headerHTML(){
  return `<header><div class="brand">Frase <em>a</em> Frase</div>
  <div class="hright"><div class="seg" role="group" aria-label="Language">
   ${Object.keys(LANGS).map(l=>`<button data-lang="${l}" aria-pressed="${st.lang===l}">${l.toUpperCase()}</button>`).join('')}</div>
   <button class="icon-btn" id="themeBtn" aria-label="Theme: ${st.theme}" title="Theme: ${st.theme}">${ICON[st.theme==='auto'?'auto':st.theme==='light'?'sun':'moon']}</button>
   <button class="icon-btn" id="gear" aria-label="Settings">${ICON.gear}</button></div></header>`;
}
function bindHeader(){
  document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{st.lang=b.dataset.lang;save();sfx('tap');renderHome()});
  $('#gear').onclick=openSheet;
  $('#themeBtn').onclick=()=>{st.theme=THEMES[(THEMES.indexOf(st.theme)+1)%3];applyTheme();save();sfx('tap');toast('Theme: '+({auto:'follows your phone',light:'light',dark:'dark'})[st.theme]);renderHome()};
}

/* ---------- sessions ---------- */

const LESSON_TYPES=['meaning','listen','build','translate','gap','build'];
function typeFor(c){
  if(!c||c.reps<=1)return shuffle(['meaning','listen','build'])[0];
  if(c.reps===2)return shuffle(['translate','build'])[0];
  return shuffle(['listen','translate','gap','build','build'])[0];
}
function newSession(mode,items,unit,stage){session={mode,unit,stage,items,i:0,right:0,asked:0,combo:0,best:0,xp:0,before:unit!=null?unitInfo(unit):null}}
function startUnit(u,k){
  const inf=unitInfo(u),cs=cards();
  if(k==null)k=inf.cur?inf.cur.k:'all';
  if(k==='all'){ // everything done: a mixed workout across all stages
    const pick12=shuffle(inf.ids).slice(0,12),cold=shuffle(gistsFor(u)).slice(0,1).map(g=>({id:g.id,type:'cold'}));
    newSession('practice',[...pick12.map(id=>({id,type:typeFor(cs[id])})),...cold],u);
    return renderItem();
  }
  const ids=unitIds(u,k),fresh=ids.filter(i=>!cs[i]);
  const cold=gistsFor(u).filter(g=>g.st===k).map(g=>({id:g.id,type:'cold'}));
  if(fresh.length)newSession('lesson',[...fresh.map(id=>({id,type:'intro'})),...shuffle(fresh).map((id,i)=>({id,type:LESSON_TYPES[i%6]})),...cold],u,k);
  else newSession('practice',[...shuffle(ids).map(id=>({id,type:typeFor(cs[id])})),...cold],u,k);
  renderItem();
}
function startReview(){
  const items=shuffle(dueList()).slice(0,20).map(id=>({id,type:typeFor(cards()[id])}));
  const pool=UNITS.map((_,u)=>u).filter(u=>unitInfo(u).seen).flatMap(u=>gistsFor(u).filter(g=>unitIds(u,g.st).some(i=>cards()[i])));
  if(pool.length)items.splice(Math.min(items.length,4+Math.floor(Math.random()*4)),0,{id:pick(pool).id,type:'cold'});
  newSession('review',items);
  renderItem();
}
function distractSentences(id,field){
  const u=S[id].u,get=i=>field==='en'?S[i].en:tgt(i);
  const same=shuffle(unitIds(u).filter(i=>i!==id)),other=shuffle(allIds().filter(i=>S[i].u!==u));
  const out=[],seen=new Set([get(id)]);
  for(const i of [...same.slice(0,2),...other,...same.slice(2)]){if(out.length>=3)break;const t=get(i);if(!seen.has(t)){seen.add(t);out.push(t)}}
  return out;
}
const clean=w=>w.replace(/[¡!¿?.,]/g,'');
function gapFor(id){
  const toks=tgt(id).split(/\s+/);
  let best=-1;
  toks.forEach((t,i)=>{const c=clean(t);if(c.length<3)return;if(i>0&&/^[A-ZÁÉÍÓÚ]/.test(c))return;if(best<0||c.length>clean(toks[best]).length)best=i});
  if(best<0)best=0;
  const ans=clean(toks[best]);
  const pool=[...new Set(allIds().flatMap(i=>tgt(i).split(/\s+/).map(clean)).filter(w=>w.length>=3&&w.toLowerCase()!==ans.toLowerCase()&&!/^[A-ZÁÉÍÓÚ]/.test(w)))];
  const near=shuffle(pool.filter(w=>Math.abs(w.length-ans.length)<=3));
  const opts=shuffle([ans,...(near.length>=3?near:shuffle(pool)).slice(0,3)]);
  const html=toks.map((t,i)=>i===best?esc(t.replace(ans,'\u0000')).replace('\u0000','<span class="gap"></span>'):esc(t)).join(' ');
  return {ans,opts,html};
}
function sessionTop(){
  const pct=Math.round(session.i/session.items.length*100);
  return `<div class="s-top"><button class="close" id="quit" aria-label="Quit session">✕</button>
    <div class="pbar"><i style="width:${Math.max(pct,4)}%"></i></div>
    <span class="combo" id="combo" ${session.combo>1?'':'style="visibility:hidden"'}>${ICON.fire}${session.combo}</span></div>${session.items[session.i]?sceneStrip(session.items[session.i]):''}`;
}
function qHead(kind,prompt,mood='idle'){
  return `<div class="q-head"><div class="qt"><div class="kind">${kind}</div><p class="prompt">${prompt}</p></div></div>`;
}
const audioRow=()=>`<div class="audio-row"><button class="play" data-say="0">${ICON.play}Play</button><button class="play" data-say="1">${ICON.slow}Slow</button></div>`;
function bindAudio(id){document.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speak(id,b.dataset.say==='1'))}
function renderItem(){
  if(session.i>=session.items.length)return renderDone();
  if(session.items[session.i].type==='cold')return renderCold(session.items[session.i]);
  const it=session.items[session.i],id=it.id,T=tgt(id),EN=S[id].en;
  const app=$('#app');let body='',opts=[],answer='',optCls='';
  window.scrollTo(0,0);
  if(it.type==='intro'){
    app.innerHTML=`<div class="session">${sessionTop()}
      ${qHead('New sentence',`${LANGS[st.lang].buddy} teaches you a phrase`,'happy')}
      <div class="stage"><span class="intro-tag">New</span>
        <p class="phrase">${esc(T)}</p><div class="en">${esc(EN)}</div>${audioRow()}</div>
      <p class="note">Listen, repeat it out loud once, then continue.</p>
      <div class="feedback"><button class="chunky full" id="next">Got it</button></div></div>`;
    $('#quit').onclick=renderHome;bindAudio(id);speak(id);
    $('#next').onclick=()=>{sfx('tap');cards()[id]={ef:2.5,iv:0,reps:0,lapses:0,due:Date.now()};save();session.i++;renderItem()};
    return;
  }
  if(it.type==='build')return renderBuild(it);
  if(it.type==='meaning'){
    body=`${qHead('Read &amp; listen','What does this mean?')}<div class="stage"><p class="phrase">${esc(T)}</p>${audioRow()}</div>`;
    answer=EN;opts=shuffle([EN,...distractSentences(id,'en')]);
  }else if(it.type==='listen'){
    body=`${qHead('Listening','What did you hear?')}
      <div class="stage center"><button class="big-play" data-say="0" aria-label="Play">${ICON.play}</button>
      <div class="audio-row" style="justify-content:center"><button class="play" data-say="1">${ICON.slow}Slow</button></div>
      ${hasTTS?'':'<p class="note">Audio is not available here. Read instead:</p><p class="phrase">'+esc(T)+'</p>'}</div>`;
    answer=EN;opts=shuffle([EN,...distractSentences(id,'en')]);
  }else if(it.type==='translate'){
    body=`${qHead('Say it in '+LANGS[st.lang].name,esc(EN))}`;
    answer=T;opts=shuffle([T,...distractSentences(id,'tgt')]);optCls='tgt';
  }else{
    const g=gapFor(id);
    body=`${qHead('Fill the gap','Pick the missing word')}<div class="stage"><p class="phrase">${g.html}</p><div class="en">${esc(EN)}</div></div>`;
    answer=g.ans;opts=g.opts;
  }
  app.innerHTML=`<div class="session">${sessionTop()}${body}
    <div class="opts ${it.type==='gap'?'words':''}">${opts.map((o,k)=>`<button class="opt ${optCls}" data-o="${esc(o)}"><span class="k">${k+1}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div class="feedback" id="fb"></div></div>`;
  $('#quit').onclick=renderHome;bindAudio(id);
  if(it.type==='listen')speak(id);
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>answerWith(b,answer,it));
}
function answerWith(btn,answer,it){
  const ok=btn.dataset.o===answer;
  document.querySelectorAll('.opt').forEach(b=>{b.disabled=true;if(b.dataset.o===answer)b.classList.add('right')});
  if(!ok)btn.classList.add('wrong');
  finish(ok,it);
}
function renderBuild(it){
  const id=it.id,T=tgt(id),EN=S[id].en;
  const words=T.split(/\s+/).map(clean).filter(Boolean);
  const pool=[...new Set(allIds().flatMap(i=>i===id?[]:tgt(i).split(/\s+/).map(clean)))].filter(w=>w.length>=2&&!words.some(x=>x.toLowerCase()===w.toLowerCase()));
  const extra=shuffle(pool).slice(0,words.length<4?2:3);
  const bank=shuffle([...words,...extra]).map((w,k)=>({w,k}));
  let picked=[];
  $('#app').innerHTML=`<div class="session">${sessionTop()}
    ${qHead('Listen &amp; build','Tap the words in the order you hear them')}
    <div class="stage center"><button class="big-play" data-say="0" aria-label="Play">${ICON.play}</button>
      <div class="audio-row" style="justify-content:center"><button class="play" data-say="1">${ICON.slow}Slow</button><button class="play" id="hint">Show meaning</button></div>
      <div class="en" id="hintTxt" hidden>${esc(EN)}</div>
      ${hasTTS?'':'<p class="note">Audio is not available here. Build this: '+esc(EN)+'</p>'}</div>
    <div class="answer-line" id="line" aria-live="polite"></div>
    <div class="bank" id="bank"></div>
    <div class="feedback" id="fb"><button class="chunky full" id="check" disabled>Check</button></div></div>`;
  $('#quit').onclick=renderHome;bindAudio(id);speak(id);
  $('#hint').onclick=()=>{$('#hintTxt').hidden=false;$('#hint').hidden=true};
  const draw=()=>{
    $('#line').innerHTML=picked.length?picked.map(p=>`<button class="tile-w" data-k="${p.k}">${esc(p.w)}</button>`).join(''):'<span class="placeholder">Your sentence appears here</span>';
    $('#bank').innerHTML=bank.map(p=>`<button class="tile-w" data-b="${p.k}" ${picked.includes(p)?'disabled':''}>${esc(p.w)}</button>`).join('');
    $('#line').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{sfx('tap');picked=picked.filter(p=>p.k!==+b.dataset.k);draw()});
    $('#bank').querySelectorAll('[data-b]:not(:disabled)').forEach(b=>b.onclick=()=>{sfx('tap');picked.push(bank.find(p=>p.k===+b.dataset.b));draw()});
    $('#check').disabled=!picked.length;
  };
  draw();
  $('#check').onclick=()=>{
    const ok=picked.map(p=>p.w.toLowerCase()).join(' ')===words.map(w=>w.toLowerCase()).join(' ');
    document.querySelectorAll('.tile-w').forEach(b=>b.disabled=true);
    $('#line').classList.add(ok?'right':'wrong');
    finish(ok,it);
  };
}
function renderCold(it){
  const g=gistById(it.id),id=it.id,opts=shuffle([g.a,...g.d]);
  let peeked=false;
  $('#app').innerHTML=`<div class="session">${sessionTop()}
    ${qHead('Cold water','Listen to the whole thing. Get the gist.')}
    <div class="stage center cold-stage"><span class="intro-tag cold-tag">Natural speed · new words</span>
      <button class="big-play" data-say="0" aria-label="Play">${ICON.play}</button>
      <div class="audio-row" style="justify-content:center"><button class="play" data-say="1">${ICON.slow}Slow</button><button class="play" id="peek">Show transcript</button></div>
      <p class="transcript" id="tx" hidden>${esc(g.t)}</p>
      <p class="note" id="peekNote" hidden>Transcript shown: half XP for this one.</p></div>
    <p class="prompt cold-q">${esc(g.q)}</p>
    <div class="opts">${opts.map((o,k)=>`<button class="opt" data-o="${esc(o)}"><span class="k">${k+1}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div class="feedback" id="fb"></div></div>`;
  $('#quit').onclick=renderHome;bindAudio(id);speak(id,false);
  $('#peek').onclick=()=>{peeked=true;$('#tx').hidden=false;$('#peekNote').hidden=false;$('#peek').hidden=true};
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    const ok=b.dataset.o===g.a;
    document.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.o===g.a)x.classList.add('right')});
    if(!ok)b.classList.add('wrong');
    session.asked++;let gain=0;
    if(ok){session.right++;session.combo++;session.best=Math.max(session.best,session.combo);gain=peeked?12:25;session.xp+=gain;st.xp[st.lang]+=gain;save()}
    else session.combo=0;
    sfx(ok?'ok':'bad');
    const cb=$('#combo');if(cb){cb.style.visibility=session.combo>1?'visible':'hidden';cb.innerHTML=ICON.fire+session.combo}
    setSceneMood(ok?'happy':'sad');
    $('#fb').innerHTML=`<div class="fb ${ok?'ok':'no'}">
      <div class="fb-top">${mascot(st.lang,ok?'happy':'sad','mini')}<div><strong>${ok?'You got the gist!':'Not quite. Read along and listen again.'}</strong><small>${esc(LANGS[st.lang].buddy)}: ${esc(pick(LINES[st.lang][ok?'happy':'sad']))}</small></div>${ok?`<span class="xp-pop">+${gain} XP</span>`:''}</div>
      <p class="transcript" style="margin:0">${esc(g.t)}</p><div class="en" style="margin:0">${esc(g.en)}</div>
      <div class="audio-row" style="margin-top:4px"><button class="play" data-say="0">${ICON.play}Play</button><button class="play" data-say="1">${ICON.slow}Slow</button></div>
      <button class="chunky ${ok?'ok':'bad'} full" id="next">Continue</button></div>`;
    bindAudio(id);
    $('#next').onclick=()=>{sfx('tap');session.i++;renderItem()};
  });
}
function finish(ok,it){
  const id=it.id,T=tgt(id);
  session.asked++;
  let gain=0;
  if(ok){session.right++;session.combo++;session.best=Math.max(session.best,session.combo);gain=10+Math.min(session.combo-1,5)*2;session.xp+=gain;st.xp[st.lang]+=gain;save()}
  else session.combo=0;
  sfx(ok?'ok':'bad');
  const cb=$('#combo');if(cb){cb.style.visibility=session.combo>1?'visible':'hidden';cb.innerHTML=ICON.fire+session.combo;if(ok){cb.classList.remove('pop');void cb.offsetWidth;cb.classList.add('pop')}}
  setSceneMood(ok?'happy':'sad');
  speak(id);
  const graded=session.mode!=='practice',c=cards()[id];
  let actions='';
  if(!ok){
    if(graded){cards()[id]=nextState(c,0);save()}
    if(!it.retry)session.items.push({id,type:it.type==='listen'?'meaning':it.type==='build'?'translate':it.type,retry:true});
    actions=`<button class="chunky bad full" id="next">Continue</button>`;
  }else if(graded){
    const pv=[1,2,3].map(g=>nextState(c,g).iv);
    actions=`<div class="grades">
      <button class="chunky grade" data-g="1" style="--f:var(--surface);--h:var(--surface);--d:var(--line);color:var(--ink)">Hard<small>${fmtIv(pv[0])}</small></button>
      <button class="chunky grade ok" data-g="2">Good<small>${fmtIv(pv[1])}</small></button>
      <button class="chunky grade" data-g="3" style="--f:var(--surface);--h:var(--surface);--d:var(--line);color:var(--ink)">Easy<small>${fmtIv(pv[2])}</small></button></div>`;
  }else actions=`<button class="chunky ok full" id="next">Continue</button>`;
  $('#fb').innerHTML=`<div class="fb ${ok?'ok':'no'}">
    <div class="fb-top">${mascot(st.lang,ok?'happy':'sad','mini')}<div><strong>${ok?(session.combo>2?session.combo+' in a row!':'Correct'):'Not quite'}</strong><small>${esc(LANGS[st.lang].buddy)}: ${esc(pick(LINES[st.lang][ok?'happy':'sad']))}</small></div>${ok?`<span class="xp-pop">+${gain} XP</span>`:''}</div>
    <p class="phrase">${esc(T)}</p><div class="en" style="margin:0">${esc(S[id].en)}</div>
    <div class="audio-row" style="margin-top:4px">${audioRow().replace(/^<div class="audio-row">|<\/div>$/g,'')}</div>${actions}</div>`;
  bindAudio(id);
  const adv=()=>{sfx('tap');session.i++;renderItem()};
  const n=$('#next');if(n)n.onclick=adv;
  document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{cards()[id]=nextState(cards()[id],+b.dataset.g);save();adv()});
}
function renderDone(){
  const today=new Date().toISOString().slice(0,10),yest=new Date(Date.now()-DAY).toISOString().slice(0,10);
  if(st.streak.last!==today){st.streak={last:today,n:st.streak.last===yest?st.streak.n+1:1};save()}
  const pct=session.asked?Math.round(session.right/session.asked*100):100;
  const next=Object.values(cards()).map(c=>c.due).filter(d=>d>Date.now()).sort((a,b)=>a-b)[0];
  const nextTxt=next?(next-Date.now()<DAY?'later today':new Date(next).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'})):'';
  const title=session.mode==='cold'?'Out of the cold water!':session.mode==='lesson'?`${esc(uTxt(session.unit,'sh'))} · stage ${session.stage} cleared!`:session.mode==='review'?'Review done!':'Practice done!';
  let unlockNote='';
  if(session.mode==='lesson'&&session.before){
    const now=unitInfo(session.unit),u=session.unit;
    const kids=UNITS.map((_,c)=>c).filter(c=>UNITS[c].parents.includes(u));
    if(!session.before.passed&&now.passed&&kids.length)unlockNote=`New ${kids.length>1?'paths':'path'} open: ${kids.map(c=>esc(uTxt(c,'sh'))).join(', ')}`;
    if(now.cur&&now.cur.k!==session.stage)unlockNote+=(unlockNote?' · ':'')+`Next here: stage ${now.cur.k}, ${esc(stageTxt(u,now.cur.k,'title'))}`;
    else if(now.done&&!session.before.done)unlockNote+=(unlockNote?' · ':'')+'All stages of this unit done!';
  }
  $('#app').innerHTML=`<div class="done-wrap">
    ${mascot(st.lang,'cheer','big')}
    <div class="bubble" style="margin:0">${esc(pick(LINES[st.lang].done))}</div>
    <h2>${title}</h2>
    <div class="done-stats">
      <div class="dstat g"><b>+${session.xp}</b><span>XP</span></div>
      <div class="dstat o"><b>${pct}%</b><span>Accuracy</span></div>
      <div class="dstat"><b>${session.best}</b><span>Best combo</span></div>
    </div>
    ${unlockNote?`<p class="unlock-note">${unlockNote}</p>`:''}
    ${nextTxt?`<p class="note" style="margin:0 0 14px">Next review ${nextTxt}</p>`:''}
    <button class="chunky" id="home">Back to the path</button></div>`;
  $('#home').onclick=()=>{sfx('tap');renderHome()};
  sfx('done',{perfect:pct===100&&session.asked>0});confetti();
}

/* ---------- confetti ---------- */
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cv=$('#confetti'),ctx=cv.getContext('2d');cv.hidden=false;
  const W=cv.width=innerWidth*devicePixelRatio,H=cv.height=innerHeight*devicePixelRatio;
  const css=getComputedStyle(document.documentElement);
  const cols=['--gold','--coral','--btn','--ok','--c-fish'].map(v=>css.getPropertyValue(v).trim());
  const ps=Array.from({length:120},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*16*devicePixelRatio,vy:(-Math.random()*16-6)*devicePixelRatio,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,s:(6+Math.random()*6)*devicePixelRatio,c:pick(cols)}));
  let t=0;
  (function loop(){
    ctx.clearRect(0,0,W,H);t++;
    ps.forEach(p=>{p.vy+=.45*devicePixelRatio;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore()});
    if(t<160)requestAnimationFrame(loop);else{ctx.clearRect(0,0,W,H);cv.hidden=true}
  })();
}

/* ---------- keyboard ---------- */
document.addEventListener('keydown',e=>{
  if(!session||e.target.tagName==='SELECT')return;
  const n=+e.key;
  if(n>=1&&n<=4){const o=document.querySelectorAll('.opt:not(:disabled)')[n-1];if(o)o.click()}
  if(e.key===' '){const p=document.querySelector('[data-say="0"]');if(p){e.preventDefault();p.click()}}
  if(e.key==='Enter'){const nx=$('#next')||document.querySelector('[data-g="2"]')||$('#check');if(nx&&!nx.disabled)nx.click()}
});

/* ---------- settings ---------- */
function openSheet(){sheetOpen=true;confirmReset=false;$('#sheet').hidden=false;$('#scrim').hidden=false;renderSheet()}
function closeSheet(){sheetOpen=false;$('#sheet').hidden=true;$('#scrim').hidden=true;if(!session)renderHome()}
$('#scrim').onclick=closeSheet;
function renderSheet(){
  const vs=langVoices(),cur=pickVoice();
  $('#sheet').innerHTML=`<div class="sheet-in"><h3>Settings · ${LANGS[st.lang].native}</h3>
   <div class="row"><label for="voice">Device voice (fallback)</label>
    ${vs.length?`<select id="voice">${vs.map(v=>`<option ${cur&&v.name===cur.name?'selected':''}>${esc(v.name)}</option>`).join('')}</select>`
      :`<p class="note" style="margin:0">${hasTTS?'No '+LANGS[st.lang].name+' voice found. Install one in your phone’s text-to-speech settings for natural audio.':'This browser has no speech output.'}</p>`}</div>
   ${recVoices().length>1?`<div class="row"><label for="recSel">Recorded voice</label>
    <select id="recSel"><option value="mix" ${st.recVoice[st.lang]==='mix'?'selected':''}>Mix (alternate per sentence)</option>${recVoices().map(v=>`<option value="${esc(v)}" ${st.recVoice[st.lang]===v?'selected':''}>${esc(v.charAt(0).toUpperCase()+v.slice(1))}</option>`).join('')}</select></div>`:''}
   <div class="row"><label for="speed">Default speed</label>
    <select id="speed"><option value="n" ${!st.slow?'selected':''}>Natural</option><option value="s" ${st.slow?'selected':''}>Slow</option></select></div>
   <div class="row"><label for="themeSel">Theme</label>
    <select id="themeSel">${THEMES.map(x=>`<option value="${x}" ${st.theme===x?'selected':''}>${({auto:'Follow my phone',light:'Light',dark:'Dark'})[x]}</option>`).join('')}</select></div>
   <div class="row"><label for="splashSel">Start-up animation</label>
    <select id="splashSel"><option value="1" ${st.splash!==false?'selected':''}>On</option><option value="0" ${st.splash===false?'selected':''}>Off</option></select></div>
   <div class="row"><label for="sfxSel">Game sounds</label>
    <select id="sfxSel"><option value="1" ${st.sfx?'selected':''}>On</option><option value="0" ${!st.sfx?'selected':''}>Off</option></select></div>
   <button class="ghost" id="test">Test voice</button>
   <p class="note" id="diag" style="margin:0">Audio check: ${recorded()?recorded()+' recorded clips':'no recorded clips yet'} · ${hasTTS?'device speech supported':'device speech not supported'} · ${voices.length} voices · ${vs.length} ${LANGS[st.lang].name} · ${esc(ttsLog)}</p>
   <button class="ghost danger" id="reset">${confirmReset?'Tap again to erase '+LANGS[st.lang].name+' progress':'Reset '+LANGS[st.lang].name+' progress'}</button>
   <button class="chunky" id="closeS">Done</button></div>`;
  const vSel=$('#voice');if(vSel)vSel.onchange=()=>{st.voice[st.lang]=vSel.value;save()};
  $('#speed').onchange=e=>{st.slow=e.target.value==='s';save()};
  $('#sfxSel').onchange=e=>{st.sfx=e.target.value==='1';save()};
  $('#splashSel').onchange=e=>{st.splash=e.target.value==='1';save()};
  const rs=$('#recSel');if(rs)rs.onchange=e=>{st.recVoice[st.lang]=e.target.value;save();speak(0)};
  $('#themeSel').onchange=e=>{st.theme=e.target.value;applyTheme();save()};
  $('#test').onclick=()=>{loadVoices();speak(0);setTimeout(()=>{if(sheetOpen)renderSheet()},1200)};
  $('#reset').onclick=()=>{if(confirmReset){st.cards[st.lang]={};st.xp[st.lang]=0;save();closeSheet()}else{confirmReset=true;renderSheet()}};
  $('#closeS').onclick=closeSheet;
}

