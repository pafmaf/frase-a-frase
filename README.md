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

`tools/sentences.tsv` (and `tools/sentences.json`) list every clip:

| column | meaning |
|---|---|
| `lang` | `es` or `pt` |
| `id` | file name without extension. Numbers are sentences, `g…` are cold-water passages |
| `kind` | `sentence` (calm, clear) or `passage` (natural speed, like real speech) |
| `text` | what to say |

The Portuguese is European Portuguese (pt-PT), so use a Portugal voice, not a Brazilian one.

**Phonon (recommended):** `bash tools/gen-phonon.sh` from the repo root records every clip with
[Phonon](https://github.com/gradium-ai/xn-ptts) (`uvx ptts`) in several voices and writes `audio/manifest.json`.
Defaults: Spanish `Alba Alvaro`, Portuguese `Joana Paulo`; override with
`VOICES_ES="Alba Alvaro Lucia-Sol" VOICES_PT="Joana Paulo Sofia" bash tools/gen-phonon.sh`.
Use Spain voices for `es` and Portugal voices for `pt`. It resumes where it stopped, so re-running only
records missing clips. Needs `uv` and `ffmpeg`.

**macOS voices:** `tools/make-frase-audio.sh` records everything with the macOS voices (Mónica, Joana) into this layout;
set `VOICE_DIR=male ES_VOICE="…" PT_VOICE="…"` to record a second voice. Merge the `voices` entries of
both runs into one `manifest.json`.

### Updating clips

New clips are picked up automatically. If you **replace** clips that already exist, bump `VERSION`
in `sw.js` (e.g. `v1` → `v2`) so phones drop their cached copies.

## Progress

Stored in the browser's local storage, separately per device and per address. Progress from the
Claude preview does not carry over to the GitHub Pages copy.
