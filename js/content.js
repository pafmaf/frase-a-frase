/* Content loader. Reads content/config.json and every content/units/<id>.json it lists, checks them,
   and builds the structures the app uses:
     APP    {name, storageKey}
     LANGS  {es:{name,native,code,buddy,city}, ...}      LINES {es:{idle,happy,sad,done}, ...}
     UNITS  [{slug,t,sh,s,lv,br,tree,col,row,parents:[unit index],ic,scen,scene}]
     S      [ {u:unit index, en, es, pt, ...} ] indexed by sentence id (ids may have gaps)
     GIST   [ {u,l,t,en,q,a,d} ]               indexed by passage number (id "g<n>")
   Format: see content/README.md. tools/content.py validate checks the same rules offline. */
let APP, LANGS, LINES, UNITS, S, GIST;

async function loadContent(dir = 'content/') {
  const get = async p => {
    const r = await fetch(dir + p);
    if (!r.ok) throw new Error(`${dir}${p}: HTTP ${r.status}`);
    try { return await r.json(); } catch (e) { throw new Error(`${dir}${p}: ${e.message}`); }
  };
  const cfg = await get('config.json');
  const files = await Promise.all((cfg.units || []).map(id => get(`units/${id}.json`)));
  buildContent(cfg, files);
}

function buildContent(cfg, files) {
  const bad = (where, msg) => { throw new Error(`content: ${where}: ${msg}`); };
  APP = { name: 'Frase a Frase', storageKey: 'frase-a-frase-v1', ...(cfg.app || {}) };
  LANGS = {}; LINES = {};
  for (const [l, v] of Object.entries(cfg.languages || {})) {
    const { lines, ...rest } = v;
    for (const k of ['name', 'native', 'code', 'buddy', 'city']) if (!rest[k]) bad(`languages.${l}`, `missing "${k}"`);
    LANGS[l] = rest;
    LINES[l] = { idle: ['…'], happy: ['✓'], sad: ['…'], done: ['✓'], ...(lines || {}) };
  }
  if (!Object.keys(LANGS).length) bad('config.json', 'no languages');

  const index = {};
  files.forEach((f, i) => {
    if (!f.id) bad(`units[${i}]`, 'missing "id"');
    if (f.id in index) bad(f.id, 'duplicate unit id');
    index[f.id] = i;
  });
  UNITS = files.map(f => ({
    slug: f.id, t: f.title, sh: f.short || f.title, s: f.summary || '', lv: f.level || '',
    br: f.branch || 'core', tree: f.tree || 'main', col: f.col ?? 0, row: f.row ?? 0,
    parents: (f.parents || []).map(p => p in index ? index[p] : bad(f.id, `unknown parent "${p}"`)),
    ic: f.icon || '', scen: !!f.scenario, scene: f.scene || 'greet'
  }));

  S = []; GIST = [];
  files.forEach((f, u) => {
    for (const s of f.sentences || []) {
      if (!Number.isInteger(s.id) || s.id < 0) bad(f.id, `sentence id must be a whole number, got ${JSON.stringify(s.id)}`);
      if (S[s.id]) bad(f.id, `sentence id ${s.id} is already used`);
      if (!s.en) bad(f.id, `sentence ${s.id} has no English`);
      S[s.id] = { u, en: s.en };
      for (const l of Object.keys(LANGS)) if (s[l]) S[s.id][l] = s[l];
    }
    for (const p of f.passages || []) {
      const n = /^g(\d+)$/.exec(p.id || '') ? +p.id.slice(1) : bad(f.id, `passage id must look like "g12", got ${JSON.stringify(p.id)}`);
      if (GIST[n]) bad(f.id, `passage id ${p.id} is already used`);
      if (!LANGS[p.lang]) bad(f.id, `passage ${p.id}: unknown language "${p.lang}"`);
      if (!(p.text && p.en && p.question && p.answer && (p.wrong || []).length >= 2)) bad(f.id, `passage ${p.id}: needs text, en, question, answer and at least 2 wrong answers`);
      GIST[n] = { u, l: p.lang, t: p.text, en: p.en, q: p.question, a: p.answer, d: p.wrong };
    }
  });
}
