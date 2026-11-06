#!/bin/bash
# Frase a Frase: record every sentence with the built-in macOS voices.
# Run from the repo root:  bash tools/make-frase-audio.sh      (FORCE=1 to re-record existing clips)
# Result: audio/<lang>/<voice>/<id>.m4a and audio/manifest.json
# Better quality: System Settings > Accessibility > Spoken Content > System voice > Manage Voices,
# download "Mónica (Premium/Enhanced)" (Spanish, Spain) and "Joana (Premium/Enhanced)" (Portuguese, Portugal).
set -euo pipefail

best_voice() { # $1 = base name, $2 = locale
  local list; list=$(say -v '?')
  for q in "Premium" "Enhanced"; do
    local v; v=$(printf '%s\n' "$list" | grep -E "^$1 \($q\)" | head -1 | sed -E 's/ +[a-z]{2}_[A-Z]{2}.*//' || true)
    [ -n "$v" ] && { echo "$v"; return; }
  done
  local v; v=$(printf '%s\n' "$list" | grep -E "^$1 " | head -1 | sed -E 's/ +[a-z]{2}_[A-Z]{2}.*//' || true)
  [ -n "$v" ] && { echo "$v"; return; }
  printf '%s\n' "$list" | grep " $2 " | head -1 | sed -E 's/ +[a-z]{2}_[A-Z]{2}.*//' || true
}
ES_VOICE="${ES_VOICE:-$(best_voice "Mónica" "es_ES")}"
[ -z "$ES_VOICE" ] && ES_VOICE="$(best_voice "Monica" "es_ES")"
PT_VOICE="${PT_VOICE:-$(best_voice "Joana" "pt_PT")}"
echo "Spanish voice:    ${ES_VOICE:-NOT FOUND}"
echo "Portuguese voice: ${PT_VOICE:-NOT FOUND}"
[ -z "$ES_VOICE" ] || [ -z "$PT_VOICE" ] && { echo "Install the missing voice (see top of script) and run again."; exit 1; }

VOICE_DIR="${VOICE_DIR:-female}"   # folder name = voice label shown in the app (e.g. female, male)
FORCE="${FORCE:-0}"                # FORCE=1 re-records clips that already exist
OUT=audio; mkdir -p "$OUT/es/$VOICE_DIR" "$OUT/pt/$VOICE_DIR"
python3 tools/content.py validate >/dev/null || { python3 tools/content.py validate; exit 1; }
n=0; skipped=0
while IFS=$'\t' read -r -u 3 lang id kind text; do
  [ -z "$lang" ] || [ "$lang" = "lang" ] && continue
  f="$OUT/$lang/$VOICE_DIR/$id"
  if [ "$FORCE" != 1 ] && [ -s "$f.m4a" ]; then skipped=$((skipped+1)); continue; fi   # keep existing clips
  v="$ES_VOICE"; [ "$lang" = "pt" ] && v="$PT_VOICE"
  rate=165; [ "$kind" = "passage" ] && rate=182   # cold-water passages at natural speed
  say -v "$v" -r "$rate" -o "$f.aiff" -- "$text"
  afconvert -f m4af -d aac -b 64000 "$f.aiff" "$f.m4a" && rm "$f.aiff"
  n=$((n+1)); printf '\r%d recorded, %d kept' "$n" "$skipped"
done 3< <(python3 tools/content.py tsv)
echo
# manifest.json from what is on disk, merged with the voices already listed
python3 - "$OUT" <<'PY'
import json, os, sys
root = sys.argv[1]; voices = {}
for lang in ("es", "pt"):
    d = os.path.join(root, lang); voices[lang] = {}
    for v in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        vd = os.path.join(d, v)
        ids = sorted((f[:-4] for f in os.listdir(vd) if f.endswith(".m4a")), key=lambda s: (s[0] == "g", int(s.lstrip("g")))) if os.path.isdir(vd) else []
        if ids: voices[lang][v] = ids
json.dump({"ext": "m4a", "voices": voices}, open(os.path.join(root, "manifest.json"), "w"))
print("manifest.json:", {l: {v: len(i) for v, i in vs.items()} for l, vs in voices.items()})
PY
echo "Done: $n recorded, $skipped already there. Commit the audio/ folder. If you replaced clips, bump VERSION in sw.js."
