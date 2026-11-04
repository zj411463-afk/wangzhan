# Sonic Cutter interface

The homepage uses the existing teal identity: background `#edf2f0`, light tool
surfaces, ink `#141a1f`, accent `#087d83`, selection `#50ddd6` and a dark waveform
surface `#11191d`. Fonts follow the existing Avenir Next / Inter / system stack.
The Spotify design reference informs audio-control hierarchy, without replacing
the site's palette. Keep framed tools at 8px radius or less.

Homepage order: header, generous animated introduction with H1, audio workbench,
feature summaries, supporting content and translated resource links. Keep the H1
above the workbench in actual HTML order, including localized snapshots. At mobile
widths, keep an indication of the following workbench in the first viewport.

The desktop introduction is at least 450px high, with full-bleed moving artwork
and an image-aligned light sweep. The glow uses the same artwork and cover
framing as the image; both move together. Do not overlay detached equalizer bars
or a second illustration. Flowing canvas traces use the artwork's source
coordinates and the same cover mapping; pause their animation offscreen and
when the page is hidden. Use a mint title accent rather than rainbow text.
Honor reduced-motion preferences. Keep the image unframed and text readable
over its dark overlay.

The empty workbench is a full-width file drop target with one border, at least
320px high on desktop and 300px on mobile, and a clear file-selection action.
The loaded waveform is 420px high on desktop and 300px on mobile.
After loading, hide the drop target, show the waveform and
offer a separate replace-file icon in the file header. On desktop the waveform
occupies most of the width; clip information uses a narrow side column. On mobile
the waveform, numeric inputs, full-width preview and save actions remain in one
column. Playback and selection preview stay distinct. Icon actions need localized
accessible names and hover titles.

All seven editor pages share CSS and JavaScript. Regenerate locale snapshots after
editing the root and verify mobile layouts with long French and German labels.
Keep the tutorial screenshot in sync with the working editor and regenerate the
content pages after changing its dimensions. See SEO.md for generation commands.
