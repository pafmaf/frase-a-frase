#!/bin/bash
# Frase a Frase: record every clip with Phonon (ptts) in several voices.
# Usage (from the repo root):  bash tools/gen-phonon.sh
# Needs: uv (https://docs.astral.sh/uv/) or ptts installed, and ffmpeg (brew install ffmpeg).
# Existing clips are never re-recorded (resume-friendly). To redo them: FORCE=1 bash tools/gen-phonon.sh
#   (or only some: FORCE=1 ONLY_LANG=pt ONLY_IDS="g3 g4" bash tools/gen-phonon.sh).
# The list of clips comes from content/ (python3 tools/content.py tsv).
# Voices: one folder per voice; the folder name is shown in the app's "Recorded voice" setting.
# Use Spain voices for es and Portugal voices for pt (not Mexican or Brazilian).
set -euo pipefail

VOICES_ES="${VOICES_ES:-Alba Alvaro}"
VOICES_PT="${VOICES_PT:-Joana Paulo}"
PTTS="${PTTS:-uvx ptts}"          # or: PTTS=ptts after `brew install gradium-ai/tap/ptts`
OUT="audio"
TMP="$(mktemp -d)"
TSV="$TMP/clips.tsv"
FORCE="${FORCE:-0}"; ONLY_LANG="${ONLY_LANG:-}"; ONLY_IDS=" ${ONLY_IDS:-} "

[ -f tools/content.py ] || { echo "Run from the repo root (tools/content.py not found)."; exit 1; }
python3 tools/content.py validate >/dev/null || { python3 tools/content.py validate; exit 1; }
python3 tools/content.py tsv > "$TSV"
command -v ffmpeg >/dev/null || { echo "ffmpeg missing: brew install ffmpeg"; exit 1; }

n=0; skipped=0; failed=0
slug(){ python3 -c 'import sys,unicodedata,re;s=unicodedata.normalize("NFKD",sys.argv[1]).encode("ascii","ignore").decode().lower();print(re.sub(r"[^a-z0-9_-]","",s))' "$1"; }
# read the list on fd 3 so ptts/ffmpeg can't swallow lines from stdin
while IFS=$'\t' read -r -u 3 lang id kind text; do
  [ "$lang" = "lang" ] && continue          # header
  [ -n "$ONLY_LANG" ] && [ "$lang" != "$ONLY_LANG" ] && continue
  [ "$ONLY_IDS" != "  " ] && [[ "$ONLY_IDS" != *" $id "* ]] && continue
  if [ "$lang" = "es" ]; then voices="$VOICES_ES"; else voices="$VOICES_PT"; fi
  for voice in $voices; do
    dir="$OUT/$lang/$(slug "$voice")"
    mkdir -p "$dir"
    out="$dir/$id.m4a"
    if [ "$FORCE" != 1 ] && [ -s "$out" ]; then skipped=$((skipped+1)); continue; fi   # resume-friendly: keep what exists unless FORCE=1
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
