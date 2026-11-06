/* Art: mascots and animated scenes. */
/* ---------- mascots ---------- */
function mascot(lang=st.lang,mood='idle',cls=''){
  const shadow='<ellipse class="shadow" cx="60" cy="110" rx="28" ry="5" fill="var(--c-ink)" opacity=".2"/>';
  if(lang==='es'){
    const mouth=mood==='happy'||mood==='cheer'
      ?'<path d="M47 70 Q60 90 73 70 Z" fill="var(--c-ink)"/><path d="M53 79 Q60 84 67 79 Q60 76 53 79Z" fill="var(--c-cheek)"/>'
      :mood==='sad'?'<path d="M50 80 Q60 71 70 80" stroke="var(--c-ink)" stroke-width="4" fill="none" stroke-linecap="round"/>'
      :'<path d="M49 72 Q60 82 71 72" stroke="var(--c-ink)" stroke-width="4" fill="none" stroke-linecap="round"/>';
    const brows=mood==='sad'?'<path d="M41 45 L52 48 M79 45 L68 48" stroke="var(--c-ink)" stroke-width="3" stroke-linecap="round"/>':'';
    const rays=Array.from({length:12},(_,i)=>`<rect x="57" y="12" width="6" height="14" rx="3" fill="var(--c-sun-deep)" transform="rotate(${i*30} 60 62)"/>`).join('');
    return `<svg class="mascot ${mood} ${cls}" viewBox="0 0 120 120" aria-label="Sol, the Spanish buddy" role="img">${shadow}
      <g class="whole"><g class="rays">${rays}</g>
      <circle cx="60" cy="62" r="33" fill="var(--c-sun)"/><path d="M33 52 A33 33 0 0 1 80 34" stroke="var(--c-white)" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
      <circle cx="42" cy="70" r="6" fill="var(--c-cheek)" opacity=".55"/><circle cx="78" cy="70" r="6" fill="var(--c-cheek)" opacity=".55"/>
      ${brows}<g class="eyes"><ellipse cx="49" cy="56" rx="4.5" ry="6" fill="var(--c-ink)"/><ellipse cx="71" cy="56" rx="4.5" ry="6" fill="var(--c-ink)"/>
      <circle cx="50.5" cy="53.5" r="1.6" fill="var(--c-white)"/><circle cx="72.5" cy="53.5" r="1.6" fill="var(--c-white)"/></g>${mouth}</g></svg>`;
  }
  const mouth=mood==='happy'||mood==='cheer'
    ?'<path d="M22 66 Q28 78 37 68 Z" fill="var(--c-ink)"/>'
    :mood==='sad'?'<path d="M23 72 Q29 66 35 71" stroke="var(--c-ink)" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M23 67 Q29 74 35 68" stroke="var(--c-ink)" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  const brow=mood==='sad'?'<path d="M30 44 L44 47" stroke="var(--c-ink)" stroke-width="3" stroke-linecap="round"/>':'';
  return `<svg class="mascot ${mood} ${cls}" viewBox="0 0 120 120" aria-label="Sardi, the Portuguese buddy" role="img">${shadow}
    <g class="whole">
    <g class="tail"><path d="M92 62 L116 44 Q110 62 116 80 Z" fill="var(--c-fish-deep)"/></g>
    <path d="M58 38 Q68 26 80 40" fill="var(--c-fish-deep)"/>
    <ellipse cx="57" cy="62" rx="40" ry="24" fill="var(--c-fish)"/>
    <path d="M22 68 Q57 92 94 66 Q60 78 22 68Z" fill="var(--c-belly)"/>
    <path d="M66 46 Q70 62 66 78 M76 48 Q80 62 76 76 M85 52 Q88 62 85 72" stroke="var(--c-fish-deep)" stroke-width="2.5" fill="none" opacity=".5"/>
    <path d="M30 50 A40 24 0 0 1 70 39" stroke="var(--c-white)" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
    <g class="fin"><path d="M58 72 Q66 88 74 76 Z" fill="var(--c-fish-deep)"/></g>
    <circle cx="50" cy="68" r="5" fill="var(--c-cheek)" opacity=".45"/>
    ${brow}<g class="eyes"><circle cx="37" cy="55" r="9" fill="var(--c-white)"/><circle cx="35" cy="56" r="5" fill="var(--c-ink)"/><circle cx="36.5" cy="54" r="1.6" fill="var(--c-white)"/></g>
    ${mouth}</g></svg>`;
}

/* ---------- animated scenes (viewBox 360x120, ground at y=96) ---------- */
const B=(es,pt)=>st.lang==='es'?es:pt;
const tw=s=>Math.round(s.length*6.6+18);
function bubble(x,y,text,delay=0,side='l'){
  const w=tw(text),tx=Math.max(4,Math.min(356-w,side==='l'?x:x-w));
  return `<g class="sc-bubble" style="animation-delay:${delay}s"><rect x="${tx}" y="${y}" width="${w}" height="22" rx="11" fill="var(--sc-bubble)" stroke="var(--sc-line)" stroke-width="1.5"/>
    <path d="M${side==='l'?tx+14:tx+w-14} ${y+21} l${side==='l'?-4:4} 7 l${side==='l'?10:-10} -7z" fill="var(--sc-bubble)"/>
    <text x="${tx+w/2}" y="${y+15}" text-anchor="middle" class="sc-text">${esc(text)}</text></g>`;
}
function tag(x,y,text){
  const w=tw(text)-4;
  return `<g class="sc-tag"><rect x="${x-w/2}" y="${y}" width="${w}" height="18" rx="6" fill="var(--sc-tag)"/><text x="${x}" y="${y+13}" text-anchor="middle" class="sc-tagtext">${esc(text)}</text></g>`;
}
function npc(x,y,shirt,o={}){
  const skin=o.skin||'var(--c-skin)',hair=o.hair||'var(--c-hair)';
  const arm=o.wave?`<g class="sc-wave" style="transform-origin:${x+14}px ${y+2}px"><rect x="${x+12}" y="${y-14}" width="7" height="20" rx="3.5" fill="${shirt}"/><circle cx="${x+15.5}" cy="${y-16}" r="4.5" fill="${skin}"/></g>`:'';
  return `<g class="${o.cls||'sc-bob'}">${arm}
    <rect x="${x-16}" y="${y-6}" width="32" height="36" rx="14" fill="${shirt}"/>
    ${o.apron?`<rect x="${x-10}" y="${y+2}" width="20" height="26" rx="5" fill="${o.apron}"/>`:''}
    <circle cx="${x}" cy="${y-19}" r="14" fill="${skin}"/>
    <path d="M${x-14} ${y-21} Q${x} ${y-42} ${x+14} ${y-21} Q${x+7} ${y-30} ${x} ${y-30} Q${x-7} ${y-30} ${x-14} ${y-21}z" fill="${hair}"/>
    <g class="eyes" style="transform-origin:${x}px ${y-18}px"><circle cx="${x-5}" cy="${y-18}" r="1.9" fill="var(--c-ink)"/><circle cx="${x+5}" cy="${y-18}" r="1.9" fill="var(--c-ink)"/></g>
    <path d="M${x-5} ${y-11} Q${x} ${y-7} ${x+5} ${y-11}" stroke="var(--c-ink)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${o.hat||''}</g>`;
}
const hero=(x,y,size,mood)=>`<g class="sc-hero">${mascot(st.lang,mood).replace('<svg class="mascot',`<svg x="${x}" y="${y}" width="${size}" height="${size}" class="mascot`)}</g>`;
const stars=()=>[[30,14],[80,30],[140,10],[210,24],[300,12],[335,34]].map(([x,y],i)=>`<circle class="sc-star" style="animation-delay:${i*.4}s" cx="${x}" cy="${y}" r="1.4" fill="var(--sc-win)"/>`).join('');
const base=(wall)=>`<rect width="360" height="120" fill="${wall||'var(--sc-sky)'}"/>${wall?'':stars()}<rect y="96" width="360" height="24" fill="var(--sc-ground)"/>`;
const counter=(y=78)=>`<rect x="150" y="${y}" width="210" height="${96-y}" fill="var(--sc-wood)"/><rect x="146" y="${y-4}" width="214" height="7" rx="2" fill="var(--sc-wood-d)"/>`;
const steam=(x,y)=>[0,.7,1.4].map((d,i)=>`<path class="sc-steam" style="animation-delay:${d}s" d="M${x+i*5-5} ${y} q-4 -6 0 -11 q4 -5 0 -10" stroke="var(--sc-steam)" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('');
const windowR=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--sc-glass)" stroke="var(--sc-frame)" stroke-width="3"/><path d="M${x+w/2} ${y} v${h} M${x} ${y+h/2} h${w}" stroke="var(--sc-frame)" stroke-width="2"/>`;

const SCENES={
 greet:m=>`${base()}
   <g fill="var(--sc-build)"><rect x="150" y="34" width="50" height="62"/><rect x="205" y="18" width="60" height="78"/><rect x="270" y="44" width="46" height="52"/><rect x="320" y="28" width="40" height="68"/></g>
   ${[[160,44],[180,44],[160,64],[215,30],[240,30],[215,52],[240,52],[280,56],[298,56],[330,40],[330,62]].map(([x,y],i)=>`<rect class="sc-winb" style="animation-delay:${i*.3}s" x="${x}" y="${y}" width="10" height="12" rx="2" fill="var(--sc-win)"/>`).join('')}
   <circle class="sc-sun" cx="60" cy="26" r="13" fill="var(--sc-sun)"/>
   ${npc(250,70,'var(--br-people)',{wave:true})}${bubble(262,10,B('¡Hola! ¿Qué tal?','Olá! Tudo bem?'),0,'l')}
   ${hero(70,44,58,m)}`,
 cafe:m=>`${base('var(--sc-wall)')}${windowR(18,14,70,52)}
   <rect x="300" y="20" width="44" height="30" rx="4" fill="var(--sc-board)"/><text x="322" y="39" text-anchor="middle" class="sc-board">${B('CAFÉ','CAFÉ')}</text>
   ${npc(255,66,'var(--sc-shirt)',{apron:'var(--br-food)'})}${counter()}
   <rect x="168" y="46" width="44" height="30" rx="5" fill="var(--sc-metal)"/><rect x="176" y="40" width="28" height="8" rx="3" fill="var(--sc-metal-d)"/>
   <rect x="183" y="58" width="14" height="12" rx="3" fill="var(--sc-cup)"/>${steam(190,56)}
   <g class="sc-slide"><rect x="300" y="60" width="16" height="15" rx="3" fill="var(--sc-cup)"/><rect x="298" y="57" width="20" height="4" rx="2" fill="var(--br-food)"/></g>
   ${bubble(230,8,B('¿Para llevar?','É para levar?'),0,'l')}${hero(60,46,56,m)}`,
 bakery:m=>`${base('var(--sc-wall)')}
   <g class="sc-awning">${[0,1,2,3,4,5,6,7,8].map(i=>`<path d="M${i*40} 0 h40 v16 q-10 8 -20 0 q-10 8 -20 0z" fill="${i%2?'var(--br-food)':'var(--sc-bubble)'}"/>`).join('')}</g>
   ${npc(270,66,'var(--sc-shirt)',{apron:'var(--sc-bubble)',hat:`<rect x="257" y="35" width="26" height="9" rx="4" fill="var(--sc-bubble)"/>`})}
   <rect x="150" y="62" width="210" height="34" rx="4" fill="var(--sc-glass)" stroke="var(--sc-frame)" stroke-width="3"/>
   ${[170,198,226,254,282,310,338].map((x,i)=>`<g class="sc-pop" style="animation-delay:${i*.15}s"><ellipse cx="${x}" cy="84" rx="11" ry="6" fill="var(--sc-crust)"/><ellipse cx="${x}" cy="82" rx="7" ry="3.5" fill="var(--sc-custard)"/><circle cx="${x-2}" cy="81" r="1.4" fill="var(--sc-crust-d)"/></g>`).join('')}
   ${steam(198,74)}${bubble(225,22,B('¡Recién hechos!','Acabados de sair!'),0,'l')}${hero(55,46,56,m)}`,
 restaurant:m=>`${base('var(--sc-wall)')}
   <rect x="40" y="16" width="44" height="32" rx="3" fill="var(--sc-frame)"/><rect x="45" y="21" width="34" height="22" fill="var(--sc-hill)"/><circle cx="70" cy="28" r="4" fill="var(--sc-sun)"/>
   <rect x="120" y="74" width="140" height="8" rx="3" fill="var(--sc-cloth)"/><path d="M128 82 v14 M252 82 v14" stroke="var(--sc-wood-d)" stroke-width="5"/>
   <ellipse cx="160" cy="73" rx="16" ry="4" fill="var(--sc-plate)"/><ellipse cx="220" cy="73" rx="16" ry="4" fill="var(--sc-plate)"/>
   <rect x="187" y="58" width="6" height="14" rx="2" fill="var(--sc-bubble)"/><path class="sc-flame" d="M190 50 q4 5 0 9 q-4 -4 0 -9z" fill="var(--sc-sun)"/>
   <g class="sc-walk">${npc(310,66,'var(--sc-shirt)',{apron:'var(--c-ink)',cls:'sc-none'})}<rect x="318" y="44" width="30" height="4" rx="2" fill="var(--sc-metal-d)"/><ellipse cx="333" cy="42" rx="10" ry="4" fill="var(--sc-plate)"/></g>
   ${bubble(240,6,B('¿Mesa para seis?','Mesa para seis?'),0,'l')}${hero(40,46,56,m)}`,
 train:m=>`${base()}<circle class="sc-sun" cx="320" cy="22" r="11" fill="var(--sc-sun)"/>
   <g class="sc-scroll slow"><path d="M0 80 q45 -34 90 0 t90 0 t90 0 t90 0 t90 0 t90 0 t90 0 t90 0 v20 h-720z" fill="var(--sc-hill2)"/></g>
   <g class="sc-scroll"><path d="M0 90 q30 -18 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 v10 h-720z" fill="var(--sc-hill)"/>
     ${[20,120,220,320,380,480,580,680].map(x=>`<rect x="${x}" y="58" width="3" height="38" fill="var(--sc-frame)"/>`).join('')}</g>
   <rect y="96" width="360" height="5" fill="var(--sc-rail)"/>
   <g class="sc-rattle"><rect x="70" y="52" width="230" height="40" rx="12" fill="var(--br-travel)"/><rect x="70" y="80" width="230" height="5" fill="var(--sc-bubble)" opacity=".7"/>
     ${[118,166,214,262].map(x=>`<rect x="${x}" y="60" width="32" height="16" rx="4" fill="var(--sc-glass)"/>`).join('')}
     <circle cx="105" cy="94" r="5" fill="var(--c-ink)"/><circle cx="270" cy="94" r="5" fill="var(--c-ink)"/></g>
   ${hero(76,40,48,m)}`,
 palace:m=>`${base()}<circle class="sc-sun" cx="40" cy="24" r="11" fill="var(--sc-sun)"/>
   <path d="M120 96 q80 -70 180 -10 q30 16 60 10z" fill="var(--sc-hill)"/>
   <g><rect x="210" y="34" width="60" height="34" fill="var(--sc-palace1)"/><rect x="200" y="26" width="16" height="42" fill="var(--sc-palace2)"/><circle cx="208" cy="24" r="9" fill="var(--sc-palace2)"/>
     <rect x="262" y="20" width="18" height="48" fill="var(--sc-palace1)"/><path d="M262 20 l9 -12 l9 12z" fill="var(--sc-palace2)"/>
     ${[220,236,252].map(x=>`<rect x="${x}" y="44" width="8" height="12" rx="4" fill="var(--sc-win)"/>`).join('')}
     <path class="sc-flag" d="M271 8 v-8 l10 3 l-10 3" fill="var(--br-food)"/></g>
   <g class="sc-drive"><rect x="0" y="72" width="62" height="20" rx="7" fill="var(--br-travel)"/><rect x="6" y="76" width="50" height="8" rx="2" fill="var(--sc-glass)"/><text x="50" y="90" class="sc-tagtext" fill="var(--sc-bubble)">434</text><circle cx="12" cy="94" r="4" fill="var(--c-ink)"/><circle cx="50" cy="94" r="4" fill="var(--c-ink)"/></g>
   ${bubble(110,6,B('¡Una entrada, por favor!','Uma entrada, por favor!'),0,'l')}${hero(86,46,50,m)}`,
 car:m=>`${base()}<circle class="sc-sun" cx="300" cy="22" r="11" fill="var(--sc-sun)"/>
   <g class="sc-scroll slow">${[0,90,180,270,360,450,540,630].map(x=>`<g><rect x="${x+20}" y="62" width="5" height="30" fill="var(--sc-wood-d)"/><circle cx="${x+22}" cy="56" r="14" fill="var(--sc-hill2)"/></g>`).join('')}</g>
   <rect y="92" width="360" height="28" fill="var(--sc-road)"/>
   <g class="sc-scroll fast">${[0,60,120,180,240,300,360,420,480,540,600,660].map(x=>`<rect x="${x}" y="104" width="30" height="4" rx="2" fill="var(--sc-win)"/>`).join('')}</g>
   <g class="sc-rattle"><path d="M110 92 v-18 q0 -6 6 -7 l22 -3 l18 -16 h48 l20 18 q22 2 24 12 v14z" fill="var(--br-food)"/>
     <path d="M146 64 l12 -11 h40 l14 12z" fill="var(--sc-glass)"/>
     <g class="sc-wheel" style="transform-origin:136px 94px"><circle cx="136" cy="94" r="10" fill="var(--c-ink)"/><path d="M130 94 h12" stroke="var(--sc-metal)" stroke-width="2"/></g>
     <g class="sc-wheel" style="transform-origin:216px 94px"><circle cx="216" cy="94" r="10" fill="var(--c-ink)"/><path d="M210 94 h12" stroke="var(--sc-metal)" stroke-width="2"/></g></g>
   ${hero(158,30,38,m)}${bubble(240,8,B('¡Con el depósito lleno!','Com o depósito cheio!'),0,'l')}`,
 hotel:m=>`${base('var(--sc-wall)')}
   <rect x="196" y="14" width="80" height="40" rx="4" fill="var(--sc-wood-d)"/>
   ${[0,1,2,3].map(i=>`<g class="sc-swing" style="transform-origin:${210+i*18}px 22px;animation-delay:${i*.3}s"><path d="M${210+i*18} 22 v10" stroke="var(--sc-metal)" stroke-width="2"/><circle cx="${210+i*18}" cy="36" r="4" fill="var(--sc-sun)"/></g>`).join('')}
   ${npc(300,66,'var(--br-travel)')}${counter(76)}
   <g class="sc-ding"><path d="M178 72 q8 -14 16 0z" fill="var(--sc-sun)"/><rect x="174" y="71" width="24" height="3" rx="1.5" fill="var(--sc-metal-d)"/></g>
   ${bubble(150,2,B('¿A nombre de quién?','Em nome de quem?'),0,'l')}${hero(50,46,56,m)}`,
 shop:m=>`${base('var(--sc-wall)')}
   <rect x="160" y="22" width="150" height="5" rx="2" fill="var(--sc-metal-d)"/><path d="M170 27 v70 M300 27 v70" stroke="var(--sc-metal-d)" stroke-width="4"/>
   ${['var(--br-food)','var(--br-travel)','var(--br-people)','var(--br-life)','var(--sc-sun)'].map((c,i)=>`<g class="sc-swing" style="transform-origin:${185+i*26}px 25px;animation-delay:${i*.25}s"><path d="M${185+i*26} 25 v6" stroke="var(--sc-metal-d)" stroke-width="2"/><path d="M${173+i*26} 34 l12 -4 l12 4 l4 10 h-6 v20 h-20 v-20 h-6z" fill="${c}"/></g>`).join('')}
   ${npc(330,66,'var(--sc-shirt)')}
   <rect x="20" y="20" width="34" height="70" rx="17" fill="var(--sc-glass)" stroke="var(--sc-frame)" stroke-width="3"/>
   ${bubble(230,72,B('¿Qué talla?','Que tamanho?'),0,'l')}${hero(76,46,56,m)}`,
 market:m=>`${base('var(--sc-wall)')}
   <rect x="20" y="10" width="110" height="22" rx="4" fill="var(--br-life)"/><text x="75" y="25" text-anchor="middle" class="sc-board" fill="var(--sc-bubble)">${B('CAJA 3','CAIXA 3')}</text>
   <rect x="110" y="70" width="190" height="26" fill="var(--sc-metal)"/>
   <g class="sc-belt">${Array.from({length:14},(_,i)=>`<rect x="${100+i*16}" y="66" width="10" height="5" fill="var(--sc-metal-d)"/>`).join('')}</g>
   <g class="sc-items"><circle cx="130" cy="60" r="7" fill="var(--br-food)"/><rect x="150" y="46" width="10" height="21" rx="3" fill="var(--br-travel)"/><rect x="172" y="52" width="20" height="15" rx="2" fill="var(--sc-sun)"/></g>
   <rect x="250" y="56" width="20" height="12" rx="2" fill="var(--c-ink)"/><rect class="sc-blink" x="252" y="66" width="16" height="3" fill="var(--br-food)"/>
   ${npc(320,64,'var(--br-life)')}${bubble(240,8,B('¿Necesita bolsa?','Precisa de saco?'),0,'l')}${hero(36,46,56,m)}`,
 pharmacy:m=>`${base('var(--sc-wall)')}
   <g class="sc-blink"><path d="M58 10 h14 v14 h14 v14 h-14 v14 h-14 v-14 h-14 v-14 h14z" fill="var(--br-people)"/></g>
   ${[0,1].map(r=>`<rect x="160" y="${22+r*24}" width="190" height="4" fill="var(--sc-wood-d)"/>${[0,1,2,3,4,5,6].map(i=>`<rect x="${166+i*26}" y="${8+r*24}" width="18" height="14" rx="2" fill="${['var(--br-travel)','var(--sc-bubble)','var(--br-food)','var(--br-life)'][(i+r)%4]}"/>`).join('')}`).join('')}
   ${npc(270,70,'var(--sc-bubble)')}${counter(80)}
   ${bubble(140,56,B('¿Qué le pasa?','O que se passa?'),0,'l')}${hero(40,46,56,m)}`,
 talk:m=>`${base()}<circle class="sc-sun" cx="40" cy="22" r="11" fill="var(--sc-sun)"/>
   <circle cx="320" cy="50" r="26" fill="var(--sc-hill2)"/><rect x="317" y="70" width="6" height="26" fill="var(--sc-wood-d)"/>
   <rect x="110" y="80" width="150" height="6" rx="3" fill="var(--sc-wood)"/><path d="M118 86 v10 M252 86 v10" stroke="var(--sc-wood-d)" stroke-width="4"/>
   ${npc(215,62,'var(--br-people)')}
   ${bubble(180,4,B('¿De dónde eres?','De onde és?'),0,'l')}${bubble(170,28,B('¡De Alemania!','Da Alemanha!'),2.2,'r')}
   ${hero(118,36,54,m)}`,
 plans:m=>`${base('var(--sc-wall)')}
   <rect x="230" y="14" width="80" height="64" rx="6" fill="var(--sc-bubble)" stroke="var(--sc-frame)" stroke-width="3"/><rect x="230" y="14" width="80" height="16" rx="6" fill="var(--br-people)"/>
   ${Array.from({length:12},(_,i)=>`<rect x="${238+(i%4)*17}" y="${36+Math.floor(i/4)*13}" width="12" height="9" rx="2" fill="${i===9?'var(--br-food)':'var(--sc-line)'}" ${i===9?'class="sc-blink"':''}/>`).join('')}
   <text x="270" y="27" text-anchor="middle" class="sc-tagtext" fill="var(--sc-bubble)">${B('SÁBADO','SÁBADO')}</text>
   ${npc(170,66,'var(--br-travel)')}<g class="sc-buzz"><rect x="186" y="56" width="10" height="17" rx="2" fill="var(--c-ink)"/></g>
   ${bubble(110,6,B('¿Quedamos el domingo?','Combinamos domingo?'),0,'l')}${hero(40,46,56,m)}`,
 trouble:m=>`${base()}
   <g fill="var(--sc-build)"><rect x="200" y="30" width="60" height="66"/><rect x="266" y="16" width="44" height="80"/><rect x="314" y="40" width="46" height="56"/></g>
   ${npc(160,66,'var(--br-life)')}
   ${['?','?','!'].map((q,i)=>`<text class="sc-float sc-q" style="animation-delay:${i*.6}s" x="${150+i*14}" y="36">${q}</text>`).join('')}
   <g class="sc-buzz"><rect x="232" y="72" width="16" height="24" rx="3" fill="var(--c-ink)"/><rect x="235" y="75" width="10" height="15" fill="var(--br-food)"/></g>
   ${bubble(200,8,B('¿Me puede ayudar?','Pode ajudar-me?'),0,'l')}${hero(50,46,56,m)}`,
 info:m=>`${base('var(--sc-wall)')}
   <circle cx="300" cy="28" r="16" fill="var(--br-people)"/><text x="300" y="35" text-anchor="middle" class="sc-board" fill="var(--sc-bubble)">i</text>
   <rect x="180" y="30" width="56" height="66" rx="6" fill="var(--sc-metal)"/><rect class="sc-screen" x="188" y="38" width="40" height="26" rx="3" fill="var(--br-travel)"/>
   <rect x="196" y="70" width="24" height="6" rx="2" fill="var(--c-ink)"/>
   ${npc(300,70,'var(--br-people)')}
   ${bubble(110,6,B('¿Cómo funciona?','Como é que funciona?'),0,'l')}${hero(70,46,56,m)}`,
 room:m=>`${base('var(--sc-wall)')}${windowR(150,12,60,46)}
   <rect x="40" y="62" width="100" height="6" rx="2" fill="var(--sc-wood)"/><path d="M48 68 v28 M132 68 v28" stroke="var(--sc-wood-d)" stroke-width="5"/>
   <rect x="96" y="44" width="30" height="18" rx="2" fill="var(--c-ink)"/><rect x="92" y="60" width="38" height="3" fill="var(--sc-metal-d)"/>
   <path d="M60 62 v-18 M60 44 l-10 -8 h20z" stroke="var(--sc-metal-d)" stroke-width="3" fill="var(--sc-sun)"/><circle class="sc-glow" cx="60" cy="40" r="14" fill="var(--sc-sun)" opacity=".25"/>
   <path d="M180 66 v30 M204 66 v30 M178 72 h28 M200 40 v32" stroke="var(--sc-wood-d)" stroke-width="5" stroke-linecap="round"/>
   <rect x="240" y="70" width="110" height="20" rx="6" fill="var(--br-travel)"/><rect x="244" y="62" width="30" height="12" rx="5" fill="var(--sc-bubble)"/><path d="M240 90 v6 M350 90 v6" stroke="var(--sc-wood-d)" stroke-width="5"/>
   ${tag(90,30,B('el escritorio','a secretária'))}${tag(192,98,B('la silla','a cadeira'))}${tag(296,46,B('la cama','a cama'))}${tag(180,62,B('la ventana','a janela'))}
   ${hero(282,22,40,m)}`,
 stall:m=>`${base()}
   <g>${[0,1,2,3,4,5,6].map(i=>`<path d="M${70+i*36} 14 h36 v14 q-9 7 -18 0 q-9 7 -18 0z" fill="${i%2?'var(--br-people)':'var(--sc-bubble)'}"/>`).join('')}</g>
   <path d="M74 28 v68 M318 28 v68" stroke="var(--sc-wood-d)" stroke-width="4"/>
   <rect x="80" y="70" width="232" height="26" fill="var(--sc-wood)"/>
   ${[100,114,128].map((x,i)=>`<circle class="sc-pop" style="animation-delay:${i*.2}s" cx="${x}" cy="66" r="7" fill="var(--br-food)"/>`).join('')}
   <g class="sc-pop" style="animation-delay:.5s"><path d="M168 66 q18 -12 36 0 q-18 10 -36 0z M204 66 l8 -6 v12z" fill="var(--sc-metal)"/></g>
   <g class="sc-pop" style="animation-delay:.8s"><ellipse cx="254" cy="64" rx="18" ry="8" fill="var(--sc-crust)"/><path d="M244 60 l4 6 M254 58 l4 6 M264 60 l4 6" stroke="var(--sc-crust-d)" stroke-width="2"/></g>
   ${tag(114,80,B('los tomates','os tomates'))}${tag(186,80,B('el pescado','o peixe'))}${tag(256,80,B('el pan','o pão'))}
   ${hero(10,46,56,m)}`,
 daynight:m=>`${base('var(--sc-wall)')}
   <defs><clipPath id="dnclip"><rect x="200" y="12" width="110" height="60" rx="5"/></clipPath></defs><g><rect x="200" y="12" width="110" height="60" rx="5" fill="var(--sc-sky)" stroke="var(--sc-frame)" stroke-width="3"/>
     <g clip-path="url(#dnclip)"><g class="sc-orbit" style="transform-origin:255px 70px"><circle cx="255" cy="28" r="9" fill="var(--sc-sun)"/><circle cx="255" cy="112" r="8" fill="var(--sc-moon)"/></g></g></g>
   <rect x="20" y="66" width="120" height="22" rx="6" fill="var(--br-life)"/><rect x="24" y="58" width="30" height="12" rx="5" fill="var(--sc-bubble)"/><path d="M20 88 v8 M140 88 v8" stroke="var(--sc-wood-d)" stroke-width="5"/>
   ${['z','z','Z'].map((z,i)=>`<text class="sc-float sc-q" style="animation-delay:${i*.7}s" x="${64+i*10}" y="46">${z}</text>`).join('')}
   <rect x="250" y="76" width="90" height="5" rx="2" fill="var(--sc-wood)"/><path d="M256 81 v15 M334 81 v15" stroke="var(--sc-wood-d)" stroke-width="4"/><rect x="290" y="60" width="26" height="16" rx="2" fill="var(--c-ink)"/>
   ${tag(80,98,B('dormir','dormir'))}${tag(300,98,B('trabajar','trabalhar'))}
   ${hero(34,26,46,m)}`,
 clock:m=>`${base('var(--sc-wall)')}
   <circle cx="240" cy="54" r="38" fill="var(--sc-bubble)" stroke="var(--sc-frame)" stroke-width="5"/>
   ${Array.from({length:12},(_,i)=>`<rect x="239" y="20" width="2" height="6" fill="var(--sc-line)" transform="rotate(${i*30} 240 54)"/>`).join('')}
   <rect class="sc-hand-h" x="238" y="34" width="4" height="22" rx="2" fill="var(--c-ink)" style="transform-origin:240px 54px"/>
   <rect class="sc-hand-m" x="239" y="24" width="2" height="32" rx="1" fill="var(--br-food)" style="transform-origin:240px 54px"/>
   <circle cx="240" cy="54" r="3" fill="var(--c-ink)"/>
   <g class="sc-flip" style="transform-origin:330px 66px"><path d="M318 44 h24 l-12 22 l12 22 h-24 l12 -22z" fill="var(--sc-glass)" stroke="var(--sc-frame)" stroke-width="3"/><path d="M324 84 h12 l-6 -8z" fill="var(--sc-sun)"/></g>
   ${tag(240,98,B('las tres y media','três e meia'))}${bubble(110,8,B('¿Cuánto se tarda?','Quanto tempo demora?'),0,'l')}${hero(60,46,56,m)}`
};
const UNIT_SCENE=['greet','cafe','train','hotel','shop','restaurant','talk','pharmacy','plans','trouble','bakery','palace','cafe','restaurant','market','info','room','stall','daynight','clock','car'];
function sceneSVG(u,mood='idle'){
  const sk=SCENES[UNITS[u].scene]||SCENES.greet;
  return `<svg class="scene-svg" viewBox="0 0 360 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Scene: ${esc(uTxt(u,'t'))}">${sk(mood)}</svg>`;
}
function itemUnit(it){return it.type==='cold'?gistById(it.id).u:S[it.id].u}
function sceneStrip(it){
  const u=itemUnit(it);
  return `<div class="scene ${it.type==='intro'?'':'quiet'}" id="scene" data-u="${u}">${sceneSVG(u)}</div>`;
}
function setSceneMood(mood){const s=$('#scene');if(s){s.classList.remove('quiet');s.innerHTML=sceneSVG(+s.dataset.u,mood)}}

