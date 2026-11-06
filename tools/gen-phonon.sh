#!/bin/bash
# Frase a Frase: record every clip with Phonon (ptts) in several voices.
# Usage (from the repo root):  bash tools/gen-phonon.sh
# Needs: uv (https://docs.astral.sh/uv/) or ptts installed, and ffmpeg (brew install ffmpeg).
# Voices: one folder per voice; the folder name is shown in the app's "Recorded voice" setting.
# Use Spain voices for es and Portugal voices for pt (not Mexican or Brazilian).
set -euo pipefail

VOICES_ES="${VOICES_ES:-Alba Alvaro}"
VOICES_PT="${VOICES_PT:-Joana Paulo}"
PTTS="${PTTS:-uvx ptts}"          # or: PTTS=ptts after `brew install gradium-ai/tap/ptts`
TSV="tools/sentences.tsv"
OUT="audio"
TMP="$(mktemp -d)"

[ -f "$TSV" ] || { echo "Run from the repo root (tools/sentences.tsv not found)."; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg missing: brew install ffmpeg"; exit 1; }

n=0; skipped=0; failed=0
slug(){ python3 -c 'import sys,unicodedata,re;s=unicodedata.normalize("NFKD",sys.argv[1]).encode("ascii","ignore").decode().lower();print(re.sub(r"[^a-z0-9_-]","",s))' "$1"; }
# read the list on fd 3 so ptts/ffmpeg can't swallow lines from stdin
while IFS=$'\t' read -r -u 3 lang id kind text; do
  [ "$lang" = "lang" ] && continue          # header
  if [ "$lang" = "es" ]; then voices="$VOICES_ES"; else voices="$VOICES_PT"; fi
  for voice in $voices; do
    dir="$OUT/$lang/$(slug "$voice")"
    mkdir -p "$dir"
    out="$dir/$id.m4a"
    if [ -s "$out" ]; then skipped=$((skipped+1)); continue; fi   # resume-friendly
    if $PTTS --lang "$lang" --voice "$voice" "$text" -o "$TMP/clip.wav" </dev/null >/dev/null 2>"$TMP/err.log" \
       && ffmpeg -nostdin -loglevel error -y -i "$TMP/clip.wav" -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse" \
            -c:a aac -b:a 64k -ac 1 "$out"; then
      n=$((n+1)); printf '\r%d recorded, %d skipped, %d failed  (%s %s %s)   ' "$n" "$skipped" "$failed" "$lang" "$voice" "$id"
    else
      failed=$((failed+1)); echo; echo "FAILED $lang/$voice/$id: $(head -c 300 "$TMP/err.log")"
    fi
  done
done 3< "$TSV"
echo

# manifest.json from what is actually on disk
python3 - "$OUT" <<'PY'
import json, os, sys
root = sys.argv[1]; voices = {}
for lang in ("es", "pt"):
    d = os.path.join(root, lang); voices[lang] = {}
    if not os.path.isdir(d): continue
    for v in sorted(os.listdir(d)):
        vd = os.path.join(d, v)
        if os.path.isdir(vd):
            ids = sorted((f[:-4] for f in os.listdir(vd) if f.endswith(".m4a")), key=lambda s: (s[0] == "g", int(s.lstrip("g"))))
            if ids: voices[lang][v] = ids
json.dump({"ext": "m4a", "voices": voices}, open(os.path.join(root, "manifest.json"), "w"))
print("manifest.json:", {l: {v: len(i) for v, i in vs.items()} for l, vs in voices.items()})
PY
echo "Done. Commit the audio/ folder and push. If you replaced existing clips, bump VERSION in sw.js."
