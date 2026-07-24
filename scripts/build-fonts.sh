#!/usr/bin/env bash
#
# Regenerates the two self-hosted variable fonts in src/fonts/.
# You only need to run this if you change the character set or the pinned axes.
# The generated .woff2 files are committed, so a normal build never runs this.
#
# Requires: python3 with `pip install fonttools brotli`
# Sources:  devDependencies @fontsource-variable/{fraunces,anek-latin}
#
set -euo pipefail
cd "$(dirname "$0")/.."

# Basic Latin + the typographic punctuation this site actually sets.
# Deliberately excludes the Latin-1 accent block: nothing on this site needs it,
# and it cost ~40KB across the two faces.
UNICODES="U+0020-007E,U+00A0,U+00B7,U+00E9,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192"

SRC_FRAUNCES="node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2"
SRC_ANEK="node_modules/@fontsource-variable/anek-latin/files/anek-latin-latin-wght-normal.woff2"

mkdir -p src/fonts

# Fraunces: pin SOFT=0 (chiselled terminals) and WONK=1 (characterful alternates),
# keep opsz + wght variable.
python3 -m fontTools.varLib.instancer "$SRC_FRAUNCES" SOFT=0 WONK=1 -o /tmp/fraunces-inst.ttf
python3 -m fontTools.subset /tmp/fraunces-inst.ttf \
  --unicodes="$UNICODES" --layout-features='*' --flavor=woff2 \
  --output-file=src/fonts/Fraunces.subset.woff2
rm -f /tmp/fraunces-inst.ttf

# Anek Latin: weight axis only. The width axis is lovely but costs 58KB, which
# is not a trade worth making for guests on rural 4G.
python3 -m fontTools.subset "$SRC_ANEK" \
  --unicodes="$UNICODES" --layout-features='*' --flavor=woff2 \
  --output-file=src/fonts/AnekLatin.subset.woff2

ls -la src/fonts/*.woff2
