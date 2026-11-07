#!/usr/bin/env python3
"""Frase a Frase content tool. The source of truth is content/ (see content/README.md).

  python3 tools/content.py validate   check every rule the app enforces, plus extra quality checks
  python3 tools/content.py stats      counts per unit and language
  python3 tools/content.py tsv        list every clip to record (lang, id, kind, text) on stdout
                                      (feminine forms are extra clips with id "<id>f")
  python3 tools/content.py json       same list as JSON, with English and unit
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'content')

def load():
    cfg = json.load(open(os.path.join(ROOT, 'config.json'), encoding='utf-8'))
    units = []
    for uid in cfg['units']:
        units.append(json.load(open(os.path.join(ROOT, 'units', uid + '.json'), encoding='utf-8')))
    return cfg, units

def clips(cfg, units):
    """Yield dicts: lang, id, kind, unit, text, en. Sentences first, then passages, ordered by id."""
    langs = list(cfg['languages'])
    out = []
    for u in units:
        for s in u.get('sentences', []):
            for l in langs:
                if s.get(l): out.append(dict(lang=l, id=str(s['id']), kind='sentence', unit=u['id'], stage=s.get('stage', 1), text=s[l], en=s['en']))
                if (s.get('f') or {}).get(l): out.append(dict(lang=l, id=f"{s['id']}f", kind='sentence-f', unit=u['id'], stage=s.get('stage', 1), text=s['f'][l], en=s['en']))
        for p in u.get('passages', []):
            out.append(dict(lang=p['lang'], id=p['id'], kind='passage', unit=u['id'], stage=p.get('stage', 1), text=p['text'], en=p['en']))
    key = lambda c: (langs.index(c['lang']), c['kind'] == 'passage', int(c['id'].strip('gf')), c['id'])
    return sorted(out, key=key)

def validate(cfg, units):
    errs, warns = [], []
    E = lambda m: errs.append(m); W = lambda m: warns.append(m)
    langs = cfg.get('languages', {})
    for l, v in langs.items():
        for k in ('name', 'native', 'code', 'buddy', 'city'):
            if not v.get(k): E(f'languages.{l}: missing "{k}"')
    ids = [u['id'] for u in units]
    if len(set(ids)) != len(ids): E('duplicate unit ids')
    sent, pas = {}, {}
    for u in units:
        uid = u['id']
        for k in ('title', 'icon', 'col', 'row'):
            if k not in u: E(f'{uid}: missing "{k}"')
        for p in u.get('parents', []):
            if p not in ids: E(f'{uid}: unknown parent "{p}"')
        for s in u.get('sentences', []):
            i = s.get('id')
            if not isinstance(i, int) or i < 0: E(f'{uid}: bad sentence id {i!r}'); continue
            if i in sent: E(f'{uid}: sentence id {i} also used in {sent[i]}')
            sent[i] = uid
            if not s.get('en'): E(f'{uid}: sentence {i} has no English')
            if not any(s.get(l) for l in langs): E(f'{uid}: sentence {i} has no target-language text')
            for l in s:
                if l not in ('id', 'en', 'de', 'f', 'stage') and l not in langs: E(f'{uid}: sentence {i} has unknown field "{l}"')
            for l, t in (s.get('f') or {}).items():
                if l not in langs or not s.get(l): E(f'{uid}: sentence {i}: feminine form for "{l}" without a main text')
                elif t == s[l]: E(f'{uid}: sentence {i}: feminine {l} form equals the main text')
            if not isinstance(s.get('stage', 1), int) or not 1 <= s.get('stage', 1) <= max(1, len(u.get('stages', []))):
                E(f'{uid}: sentence {i} has stage {s.get("stage")!r} but the unit lists {len(u.get("stages", []))} stages')
        for p in u.get('passages', []):
            m = re.fullmatch(r'g(\d+)', str(p.get('id')))
            if not m: E(f'{uid}: bad passage id {p.get("id")!r}'); continue
            if p['id'] in pas: E(f'{uid}: passage {p["id"]} also used in {pas[p["id"]]}')
            pas[p['id']] = uid
            if p.get('lang') not in langs: E(f'{uid}: passage {p["id"]} unknown language {p.get("lang")!r}')
            for k in ('text', 'en', 'question', 'answer'):
                if not p.get(k): E(f'{uid}: passage {p["id"]} missing "{k}"')
            w = p.get('wrong', [])
            if len(w) < 2: E(f'{uid}: passage {p["id"]} needs at least 2 wrong answers')
            if len(w) != 3: W(f'{uid}: passage {p["id"]} has {len(w)} wrong answers (3 is the norm)')
            if p.get('answer') in w: E(f'{uid}: passage {p["id"]} lists the right answer as wrong')
            if p.get('de'):
                d = p['de']
                if not all(d.get(k) for k in ('meaning', 'question', 'answer')) or len(d.get('wrong', [])) != len(w): E(f'{uid}: passage {p["id"]}: "de" needs meaning, question, answer and {len(w)} wrong answers')
            if not 1 <= p.get('stage', 1) <= max(1, len(u.get('stages', []))): E(f'{uid}: passage {p["id"]} has a bad stage {p.get("stage")!r}')
        for k, stg in enumerate(u.get('stages', []), 1):
            if not stg.get('title') or not stg.get('summary'): E(f'{uid}: stage {k} needs a title and a summary')
    # skill tree must be acyclic
    par = {u['id']: u.get('parents', []) for u in units}
    state = {}
    def visit(n, path):
        if state.get(n) == 1: E('parent cycle: ' + ' -> '.join(path + [n])); return
        if state.get(n) == 2 or n not in par: return
        state[n] = 1
        for p in par[n]: visit(p, path + [n])
        state[n] = 2
    for n in par: visit(n, [])
    # quality: every stage should have 6 sentences and a cold-water passage in each language the unit teaches
    for u in units:
        for k in range(1, max(1, len(u.get('stages', []))) + 1):
            for l in langs:
                n = sum(1 for s in u.get('sentences', []) if s.get(l) and s.get('stage', 1) == k)
                g = sum(1 for p in u.get('passages', []) if p.get('lang') == l and p.get('stage', 1) == k)
                if not any(s.get(l) for s in u.get('sentences', [])): continue
                if n != 6: W(f'{u["id"]} stage {k}: {l} has {n} sentences (6 is the norm)')
                if n and not g: W(f'{u["id"]} stage {k}: {l} has sentences but no cold-water passage')
                if g and not n: W(f'{u["id"]} stage {k}: {l} has a passage but no sentences')
    texts = {}
    for c in clips(cfg, units):
        k = (c['lang'], c['text'].strip().lower())
        if k in texts and c['kind'] == 'sentence': W(f'duplicate {c["lang"]} text in {texts[k]} and {c["unit"]}: {c["text"]!r}')
        texts[k] = c['unit']
        if '\t' in c['text'] or '\n' in c['text']: E(f'{c["lang"]} {c["id"]}: tab/newline in text')
    return errs, warns

def stats(cfg, units):
    langs = list(cfg['languages'])
    print(f'{"unit":<18}{"stages":>7}' + ''.join(f'{l+" sent":>9}{l+" pass":>9}' for l in langs))
    tot = {l: [0, 0] for l in langs}
    for u in units:
        row = f'{u["id"]:<18}{len(u.get("stages", [])) or 1:>7}'
        for l in langs:
            n = sum(1 for s in u.get('sentences', []) if s.get(l)); g = sum(1 for p in u.get('passages', []) if p.get('lang') == l)
            tot[l][0] += n; tot[l][1] += g; row += f'{n:>9}{g:>9}'
        print(row)
    print(f'{"TOTAL":<18}{"":>7}' + ''.join(f'{tot[l][0]:>9}{tot[l][1]:>9}' for l in langs))

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'validate'
    cfg, units = load()
    if cmd == 'validate':
        errs, warns = validate(cfg, units)
        for w in warns: print('warning:', w)
        for e in errs: print('ERROR:', e)
        print(f'{len(units)} units, {len(clips(cfg, units))} clips, {len(errs)} errors, {len(warns)} warnings')
        sys.exit(1 if errs else 0)
    elif cmd == 'stats': stats(cfg, units)
    elif cmd == 'tsv':
        print('lang\tid\tkind\ttext')
        for c in clips(cfg, units): print(f'{c["lang"]}\t{c["id"]}\t{c["kind"]}\t{c["text"]}')
    elif cmd == 'json': json.dump(clips(cfg, units), sys.stdout, ensure_ascii=False, indent=1)
    else: sys.exit(__doc__)
