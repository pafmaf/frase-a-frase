# Content

Everything you learn lives here, separate from the app code. Edit these files, run
`python3 tools/content.py validate`, and reload the page. No change to `index.html` or `js/` is needed.

```
content/
  config.json        app name, languages (voice codes, mascot name, city, cheering lines), unit order
  units/<id>.json    one file per skill-tree unit: its metadata, sentences and cold-water passages
```

## Add a unit (a new scenario)

1. Create `content/units/<id>.json` (copy a small one such as `time.json`).
2. Add `"<id>"` to `units` in `config.json`. The order there is the tie-break order of the tree.
3. `python3 tools/content.py validate`
4. Record audio: `bash tools/gen-phonon.sh` (only the new clips are recorded).

## Unit file

| field | meaning |
|---|---|
| `id` | same as the file name; other units refer to it in `parents` |
| `title`, `short`, `summary` | text, or `{"es": "…", "pt": "…"}` when it differs per language |
| `level` | `A1`, `A2`, … (label only) |
| `branch` | colour: `core`, `food`, `travel`, `people`, `life`, `words` |
| `tree` | `main` or `words` (the two tabs of the skill tree) |
| `col`, `row` | position in the tree: `col` 0 to 3 (fractions allowed), `row` is depth |
| `parents` | unit ids that must be finished first |
| `scene` | animated scene: `greet cafe train hotel shop restaurant talk pharmacy plans trouble bakery palace market info room stall daynight clock car` (drawn in `js/art.js`) |
| `scenario` | `true` shows the city badge and allows language-specific sentences |
| `icon` | SVG path (24x24, stroke) |
| `stages` | the unit's situations, in order: `[{ "title": "…", "summary": "…", "scene": "bakery" }]` (`scene` optional, defaults to the unit's) |
| `sentences` | list of `{ "id": 6, "stage": 2, "en": "…", "es": "…", "pt": "…" }` (`stage` defaults to 1) |
| `passages` | list of cold-water listening passages (below) |

**Stages.** Every unit has up to 4 stages, each a different situation (Café: first order, breakfast at the counter,
sitting down, a regular). Aim for 6 sentences and 1 passage per stage and language. Finishing **stage 1** unlocks the
unit's children in the tree; stage 2 opens after stage 1, and so on. Sentences and passages say which stage they belong
to with `"stage": n`; leaving it out means stage 1.

**Sentences.** `id` is a whole number and must be unique across all units. Leave a language out
to make the sentence exist only in the other one (used by the Madrid and Lisboa scenarios).
Each stage's 6 sentences are taught, then drilled in five exercise types.
Use Spain Spanish and European Portuguese (`tu`/`você` forms, `comboio`, `pequeno-almoço`, …).

**Passages.** `{ "id": "g12", "lang": "es", "stage": 2, "text": "…", "en": "…", "question": "…", "answer": "…", "wrong": ["…", "…", "…"] }`.
Natural speed, a few words beyond the unit's vocabulary, plus an English gist question with three
wrong answers. `id` is `g` plus a number, unique across all units.

## German and feminine forms

The app explains everything in English or German (Settings → App language). German lives next to the English:

- unit: `"de": {"title": "…", "short": "…", "summary": "…"}`; each stage: `"de": {"title": "…", "summary": "…"}`
- sentence: `"de": "Einen Milchkaffee, bitte."`
- passage: `"de": {"meaning": "…", "question": "…", "answer": "…", "wrong": ["…", "…", "…"]}`

Missing German falls back to English.

**Speaker gender.** When a sentence changes with the speaker's gender ("Obrigado" / "Obrigada"), the main text is
the man's form and `"f": {"pt": "Obrigada."}` holds the woman's (only for the languages that change). Users pick
"I speak as a man / a woman" in Settings. Feminine forms are recorded as extra clips `<id>f` (female voices only;
see `VOICES_FEMALE` in tools/gen-phonon.sh and `app.voiceGender` in config.json). Until they are recorded the app
reads the feminine form with the device voice.

## Ids are forever

Learner progress (spaced-repetition cards) and recorded audio are keyed by `id`.
**Never renumber or reuse an id.** New content takes the next free number
(`python3 tools/content.py stats` shows totals). Gaps are fine. If you only fix a typo, the
audio for that clip is stale: re-record it with `FORCE=1 ONLY_IDS="12" bash tools/gen-phonon.sh`
and bump `VERSION` in `sw.js`.

## Adding a language

Add an entry under `languages` in `config.json` (`name`, `native`, `code`, `buddy`, `city`, `lines`),
then add that language key to sentences and passages. The mascot drawing and the speech bubbles inside
scenes are still Spanish/Portuguese specific (`js/art.js`), so a new language needs those two small touches.
