# Sonic Cutter interface

Approved direction C: generous photographic studio banner above a large light
audio workbench. Palette: white, cool gray `#f3f6f5`, ink `#141a1f`, teal
`#087d83`, mint selection and restrained pink ambient audio traces.
Use Inter / Avenir Next / system sans, medium-weight headings, zero tracking.
Keep controls at 6px radius; sections are unframed, not nested cards.

Banner asset: `assets/sonic-studio.jpg`. Headphones left, mixing desk right,
quiet center for localized H1. Banner around 480px desktop / 280px mobile,
growing for translations. Two smooth thin canvas waves use a six-second cycle,
not rapid beats. Pause offscreen and when hidden; honor reduced-motion.
This ambient animation does not measure user audio.

Loaded workbench: large light waveform left and 270px settings column right,
with presets, numeric inputs, filename, preview and save. Playback transport
sits under the waveform. Do not fabricate stereo data: retain combined peaks.
Keep audio parsing, selection, export and anonymous tracking unchanged.

At 900px stack waveform and settings. At 560px give preview/save separate
full-width actions and keep inputs at 16px. Empty upload area at least 420px
desktop / 360px mobile, centered vertically: icon, introduction, then a wide
selection button below. Section introduction sits under its title, not at the
far right. Waveform 360px desktop / 280px mobile. Test all seven
languages at 320px. Use localized accessible names for icon controls.

Regenerate localized editor snapshots after source changes. The generator,
public allowlist and release tests must include the new banner asset. Update
`assets/audio-selection.png` and regenerate scene/tutorial content after visual
changes, keeping URLs, metadata and internal links intact. See SEO.md.

Keep the unopened converter inside a collapsed details section, preserving its
content and controls without dominating the cutter page. Existing tutorial and
scene content stays available; do not invent new conversion capabilities.

Reusable UI check: run `.github/scripts/check-editor-ui.cjs` with NODE_PATH and
CHROME_PATH configured as for render-locales.cjs. It checks seven languages at
320/390/768px, desktop column geometry, preview stopping, and byte-identical WAV
sample export. It also refreshes the English tutorial editor screenshot; run
render-content.cjs afterwards so image dimensions stay synchronized.
