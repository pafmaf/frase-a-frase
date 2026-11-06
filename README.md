# Frase a Frase

Practical Spanish (Spain) and European Portuguese, one sentence at a time.
A single static page: skill tree, animated scenes, multiple-choice, word-tile building,
cold-water listening, SM-2 spaced repetition. Progress is stored in the browser.

## Deploy to GitHub Pages

1. Create a repository, e.g. `frase-a-frase`, and push the contents of this folder to `main`:
   ```bash
   cd frase-a-frase
   git init -b main && git add . && git commit -m "Frase a Frase"
   git remote add origin git@github.com:<you>/frase-a-frase.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`, **Save**.
3. After a minute the app is live at `https://<you>.github.io/frase-a-frase/`.
4. On the phone:
   - **iPhone (Safari):** Share → **Add to Home Screen**.
   - **Android (Chrome):** menu → **Install app**.

   It then opens full-screen like an app and works offline. Audio clips are cached the first time they play.

`.nojekyll` keeps GitHub from running Jekyll over the files. Pages repos are public.

## Project layout

```
index.html        page shell + boot
css/app.css       styles
js/content.js     loads and checks content/, builds the data the app uses
js/core.js        storage, spaced repetition (SM-2), speech and recorded audio
js/art.js         mascots and animated scenes
js/ui.js          home, skill tree, lessons, settings
content/          all lessons: config.json + one file per unit (see content/README.md)
tools/            content.py (validate, stats, export), gen-phonon.sh, make-frase-audio.sh
audio/            recorded clips + manifest.json
sw.js             offline support
```

Add or edit lessons in `content/` only, then `python3 tools/content.py validate`.
The page loads `content/` with `fetch`, so open it through a web server (`python3 -m http.server`),
not by double-clicking `index.html`.

## Audio

Without recordings the app uses the phone's own speech (works in Safari and Chrome, not inside
the Claude viewer). Recorded clips sound better and are needed for consistent cold-water passages.

### Folder layout

```
audio/
  manifest.json
  es/female/0.m4a  es/female/1.m4a … es/female/g0.m4a …
  es/male/0.m4a …
  pt/female/0.m4a …
  pt/male/…
```

- One folder per voice. The folder name is what the app shows in **Settings → Recorded voice**
  (letters, digits, `-` or `_`; e.g. `female`, `male`, `joana`).
- With more than one voice the default is **Mix**, which alternates voices per sentence.
- A voice may be missing some clips; the app falls back to another voice, then to device speech.

### manifest.json

```json
{
  "ext": "m4a",
  "voices": {
    "es": { "female": ["0", "1", "g0"], "male": ["0", "1", "g0"] },
    "pt": { "female": ["0", "1", "g1"], "male": ["0", "1", "g1"] }
  }
}
```

`ext` can be `m4a`, `mp3`, `ogg` or `wav` (one format for all clips; `m4a`/AAC or `mp3` play everywhere,
including iPhone). See `audio/manifest.example.json`.

### What to record

`python3 tools/content.py tsv` lists every clip (`lang`, `id`, `kind`, `text`), generated from `content/`:
`id` is the file name without extension (numbers are sentences, `g…` are cold-water passages) and
`kind` is `sentence` (calm, clear) or `passage` (natural speed, like real speech).
`python3 tools/content.py stats` shows how many there are.

The Portuguese is European Portuguese (pt-PT), so use a Portugal voice, not a Brazilian one.

**Phonon (recommended):** `bash tools/gen-phonon.sh` from the repo root records every clip with
[Phonon](https://github.com/gradium-ai/xn-ptts) (`uvx ptts`) in several voices and writes `audio/manifest.json`.
Defaults: Spanish `Alba Alvaro`, Portuguese `Joana Paulo`; override with
`VOICES_ES="Alba Alvaro Lucia-Sol" VOICES_PT="Joana Paulo Sofia" bash tools/gen-phonon.sh`.
Use Spain voices for `es` and Portugal voices for `pt`. Existing clips are never re-recorded, so re-running
only records missing ones (new content, interrupted runs). To redo clips on purpose:
`FORCE=1 bash tools/gen-phonon.sh`, optionally narrowed with `ONLY_LANG=pt ONLY_IDS="3 g4"`.
Needs `uv` and `ffmpeg`.

**macOS voices:** `bash tools/make-frase-audio.sh` records with the macOS voices (Mónica, Joana) into `audio/`, skipping
clips that exist (`FORCE=1` to redo); set `VOICE_DIR=male ES_VOICE="…" PT_VOICE="…"` to record a second voice.
`manifest.json` is rebuilt from the files on disk.

### Updating clips

New clips are picked up automatically. If you **replace** clips that already exist, bump `VERSION`
in `sw.js` (e.g. `v1` → `v2`) so phones drop their cached copies.

## Progress

Stored in the browser's local storage, separately per device and per address. Progress from the
Claude preview does not carry over to the GitHub Pages copy.
