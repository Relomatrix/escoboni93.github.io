#!/usr/bin/env bash
# Checks every target twice (45 s apart) and writes the failing ones to $1.
# A target is DOWN only if both attempts fail, so a single slow answer does not page anyone.
set -uo pipefail
out="${1:?output file}"
targets="${2:-scripts/uptime/targets.txt}"
: > "$out"

probe() { # url expect -> prints "OK <code> <ms>" or "KO <reason>"
  local url="$1" expect="$2" body code ms
  body="$(mktemp)"
  read -r code ms < <(curl -sS -L --max-redirs 3 --max-time 25 -A 'relomatrix-uptime/1.0' \
      -o "$body" -w '%{http_code} %{time_total}\n' "$url" 2>/dev/null || echo "000 0")
  ms="$(awk -v t="$ms" 'BEGIN{printf "%d", t*1000}')"
  if [[ "$code" != 2* ]]; then echo "KO HTTP $code (${ms} ms)"; rm -f "$body"; return; fi
  if [[ -n "$expect" ]] && ! grep -q -- "$expect" "$body"; then
    echo "KO HTTP $code ma la pagina non contiene \"$expect\""; rm -f "$body"; return
  fi
  rm -f "$body"; echo "OK $code ${ms} ms"
}

declare -a names urls expects first
while IFS='|' read -r name url expect; do
  [[ -z "$name" || "$name" == \#* ]] && continue
  names+=("$name"); urls+=("$url"); expects+=("$expect")
done < "$targets"

echo "| Servizio | Esito |" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
echo "|---|---|" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
retry=0
for i in "${!names[@]}"; do
  first[$i]="$(probe "${urls[$i]}" "${expects[$i]}")"
  [[ "${first[$i]}" == KO* ]] && retry=1
done
[[ $retry == 1 ]] && sleep 45
for i in "${!names[@]}"; do
  res="${first[$i]}"
  if [[ "$res" == KO* ]]; then
    res="$(probe "${urls[$i]}" "${expects[$i]}")"
    [[ "$res" == KO* ]] && echo "${names[$i]} (${urls[$i]}): ${res#KO }" >> "$out"
  fi
  echo "${names[$i]}: $res"
  echo "| ${names[$i]} | $res |" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
done
exit 0
