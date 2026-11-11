# Sonic Cutter interface

The user's lavender reference (2026-11-04) supersedes the previous teal direction.
Change the header, hero and editor layout; preserve the lower introduction,
scene/tutorial links, FAQ and SEO content layout. Lower sections only inherit
the coordinated palette: lavender-white `#f6f3ff`, white tools, ink `#17152d`,
muted `#706c8b`, primary violet `#7643e8`, soft selection `#eee6ff`.
Use system sans with zero tracking. Keep controls at 6px and the editor at 8px.

Hero asset: `assets/sonic-lavender.jpg`, generated bitmap headphones on the right
with empty space on the left. Desktop copy stays within 65% of the width. Keep
the entire headphones visible with contain framing. At 600px and below, place
the image at the bottom beneath the text. Hero is at least 300px desktop / 320px
mobile and grows for translated text. Retain the original H1 and SEO metadata.
Ambient canvas waves stay slow (six seconds), decorative, paused offscreen and
when hidden, disabled for reduced-motion. They do not measure uploaded audio.

Loaded editor order: file header, five-point timeline, full-width waveform,
seek slider, horizontal editing footer. Footer groups existing playback icons,
start/end numeric inputs, duration output, filename, presets, preview and save.
At 1100px use two footer columns; at 600px stack all sections. Keep preview a
distinct accessible action, not hidden behind ordinary playback. Never fabricate
stereo data: use the existing combined peaks. Inputs remain numeric seconds.

Preserve IDs and listener wiring for fileInput, previewBtn, saveBtn and transport
controls. The original anonymous events remain page_open, file_ready,
preview_started and download_started, deduplicated per page. Do not send filenames
or audio. `check-funnel-ui.cjs` exercises this flow against a local mock endpoint
without polluting production analytics. Export continues to slice original data.

Keep unopened conversion controls in the existing collapsed section. Do not add
unavailable conversion, merging or volume tools merely because the reference has
them. Header links point to the real cutter and existing introduction section.

Regenerate seven localized editor snapshots after source changes. Update localized
image alts, public asset allowlist and release tests when changing the hero asset.
Run check-editor-ui.cjs for desktop, 320/390/768px mobile, native file selection,
preview stopping, preset states and byte-preserving WAV export. It refreshes the
English editor screenshot; run render-content.cjs afterwards. Check release and
anonymous funnel tests before publishing. See SEO.md for generation commands.

Shared tab icon: favicon.svg matches the purple waveform brand. Regenerate the
16/32/48px favicon.ico and 180px apple-touch-icon.png with build-favicons.cjs when
editing the SVG. All pages reference root icon URLs, and the public allowlist,
release checks and live deployment checks must keep these assets included.

MP3 splitter: a separate functional page in all seven locales. Reuse the existing
lavender tokens, 8px framed tool and system type. Fixed-duration and timestamp
modes use native radios, numeric/time inputs and accessible audio controls; no fake
waveform. Actual output parts have preview/download actions and a lazy ZIP action.
Lucide icon nodes come from the installed library, with its license included.
Preserve the cutter's layout and event IDs. The splitter has its own prefixed events.

Audio reverser (2026-11-11): independent seven-locale `/audio-reverser/` pages.
Follow the approved desktop/mobile mockup: compact lavender headphones intro,
full-width waveform selection, whole/selection segmented native radios, explicit
time fields, original/reversed comparison and WAV export. Original audio is teal;
reversed audio is violet. Show real PCM peaks only after selection of a file.
Before a file is selected, show a working drop area, not fabricated audio.
At narrow widths stack commands and export; give waveform handles 44px hit targets.
Use an explicit theme toggle and translated controls. The 2026-11-11 revision
matches the cutter: 220px waveform (200px mobile), slim labeled seek slider,
circular source play/reset controls, grouped time/filename inputs and vertically
aligned preview command. The final WAV download belongs below both comparison
previews, right-aligned on desktop and full-width on mobile. Native audio is the hidden playback engine;
custom controls have translated names, keyboard seeking and a visible playhead.
Download stays disabled until an actual result exists. Changing selection
invalidates old previews and downloads. Preview and download share the same WAV.
The source file never changes. Keep original cutter/splitter IDs and event names.
