#!/usr/bin/env bash
# Checks every target twice (45 s apart) and writes the failing ones to $1.
# A target is DOWN only if both attempts fail, so a single slow answer does not page anyone.
# Probes run in parallel, so even a full outage (every target timing out) ends in about 100 s.
set -uo pipefail
out="${1:?output file}"
targets="${2:-scripts/uptime/targets.txt}"
work="$(mktemp -d)"
: > "$out"

probe() { # url expect -> prints "OK <code> <ms>" or "KO <reason>"
  local url="$1" expect="$2" body meta rc code ms
  body="$(mktemp)"
  meta="$(curl -sS -L --max-redirs 3 --max-time 25 -A 'relomatrix-uptime/1.0' \
      -o "$body" -w '%{http_code} %{time_total}' "$url" 2>/dev/null)"
  rc=$?
  read -r code ms <<< "${meta:-000 0}"
  ms="$(awk -v t="${ms:-0}" 'BEGIN{printf "%d", t*1000}')"
  if [[ $rc -ne 0 ]]; then echo "KO HTTP ${code:-000}, curl exit $rc (${ms} ms)"; rm -f "$body"; return; fi
  if [[ "$code" != 2* ]]; then echo "KO HTTP $code (${ms} ms)"; rm -f "$body"; return; fi
  if [[ -n "$expect" ]] && ! grep -q -- "$expect" "$body"; then
    echo "KO HTTP $code ma la pagina non contiene \"$expect\""; rm -f "$body"; return
  fi
  rm -f "$body"; echo "OK $code ${ms} ms"
}

declare -a names urls expects
while IFS='|' read -r name url expect; do
  [[ -z "$name" || "$name" == \#* ]] && continue
  names+=("$name"); urls+=("$url"); expects+=("$expect")
done < "$targets"

run_pass() { # pass-number indexes...
  local pass="$1"; shift
  for i in "$@"; do probe "${urls[$i]}" "${expects[$i]}" > "$work/$pass.$i" & done
  wait
}

run_pass 1 "${!names[@]}"
failed=()
for i in "${!names[@]}"; do grep -q '^KO' "$work/1.$i" && failed+=("$i"); done
if [[ ${#failed[@]} -gt 0 ]]; then sleep 45; run_pass 2 "${failed[@]}"; fi

summary="${GITHUB_STEP_SUMMARY:-/dev/null}"
printf '| Servizio | Esito |\n|---|---|\n' >> "$summary"
for i in "${!names[@]}"; do
  res="$(cat "$work/1.$i")"
  if [[ -f "$work/2.$i" ]]; then
    res="$(cat "$work/2.$i")"
    [[ "$res" == KO* ]] && echo "${names[$i]} (${urls[$i]}): ${res#KO }" >> "$out"
  fi
  echo "${names[$i]}: $res"
  echo "| ${names[$i]} | $res |" >> "$summary"
done
rm -rf "$work"
exit 0
