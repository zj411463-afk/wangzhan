# Sonic Cutter

[Open Sonic Cutter](https://www.tomp3.xyz/en/) to select, preview and save a
continuous MP3 or WAV excerpt in your browser. Audio files stay on your device.
MP3 exports align to existing audio frames and WAV exports align to sample
blocks, without re-encoding. The original file remains unchanged.

## Languages

[中文](https://www.tomp3.xyz/) ·
[English](https://www.tomp3.xyz/en/) ·
[日本語](https://www.tomp3.xyz/ja/) ·
[한국어](https://www.tomp3.xyz/ko/) ·
[Français](https://www.tomp3.xyz/fr/) ·
[Deutsch](https://www.tomp3.xyz/de/) ·
[Español](https://www.tomp3.xyz/es/)

## Use cases and guides

- [Make a ringtone clip](https://www.tomp3.xyz/en/scenes/ringtone/)
- [Trim a podcast or interview](https://www.tomp3.xyz/en/scenes/podcast/)
- [How to select, preview and save an MP3 clip](https://www.tomp3.xyz/en/guides/cut-mp3/)
- [How to keep complete sentences in a recording](https://www.tomp3.xyz/en/guides/cut-podcast/)
- [中文铃声制作指南](https://www.tomp3.xyz/scenes/ringtone/)
- [中文播客剪切教程](https://www.tomp3.xyz/guides/cut-podcast/)

The current release does not offer format conversion, video extraction, DRM
removal, noise reduction, fades or clip joining. Phone ringtone installation
is a separate step. Cutting preserves existing data; it cannot recover details
lost during an earlier MP3 encode.

## Development

The site is static HTML, with a Cloudflare Pages Worker for canonical host
redirects, security headers and optional anonymous event counts. See
[ANALYTICS.md](ANALYTICS.md) for event definitions and [SEO.md](SEO.md) for
localized pages, content generation and release checks.

```sh
node .github/scripts/render-content.cjs
node .github/scripts/render-locales.cjs
node .github/scripts/check-audio-only.js
node --test .github/scripts/check-funnel.mjs .github/scripts/check-release.mjs
node .github/scripts/build-pages.js
```

The locale renderer requires Playwright and Chromium. Configure `NODE_PATH`
and `CHROME_PATH` if necessary. Build into an empty output directory. Only
allowlisted public assets are deployed; project documentation and credentials
are not part of the website bundle.
