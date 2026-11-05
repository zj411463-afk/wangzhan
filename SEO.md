# Search and AI visibility

Every editor URL, including the Chinese homepage, keeps its named language stable.
Browser/IP detection recommends a language in the Auto option without silently
changing or redirecting the page. Choosing Auto explicitly opens the recommended
language URL. Manual language choices also open the matching URL, except when an
audio file is already loaded (or the page is opened from file://): in that case
only the interface changes so that editing is not lost. Saved preferences inform
the recommendation, never override the language of a direct URL visit.
Separately indexable versions of the same working editor are available at
`/en/`, `/ja/`, `/ko/`, `/fr/`, `/de/`, and `/es/`. A localized URL defaults
to its named language, even if the visitor is elsewhere; manual switching remains
available. All seven versions link to one another and have canonical URLs and
reciprocal `hreflang` annotations.

Localized static HTML is generated from `index.html` so that its visible
content is available before JavaScript runs. After changing the shared editor or
translations, regenerate it using Playwright and an installed Chromium browser:

```sh
node .github/scripts/render-locales.cjs
node --test .github/scripts/check-funnel.mjs .github/scripts/check-release.mjs
```

Set `NODE_PATH` to the directory containing Playwright and `CHROME_PATH` to a
Chromium executable when those are not available through the normal environment.
The release check compares the shared scripts so an outdated localized editor does
not silently ship. Only the allowlisted public files are deployed.

## Content and internal links

Six supporting/tool pages are available in every supported language: ringtone and podcast
use cases, MP3 cutting and speech-excerpt tutorials, the MP3 splitter and the MP3
editing guide. The source of their translated
titles, descriptions, readable text and editor link labels is `.github/content-pages.cjs`.
The editor links to the use cases and tutorials; use cases link to the matching
tutorial; tutorials link back to the working cutter and relevant use case. All links
are real HTML anchors available without JavaScript. Content language links preserve
the current article instead of returning readers to a different page.

After editing content, generate in this order:

```sh
node .github/scripts/render-content.cjs
node .github/scripts/render-locales.cjs
node --test .github/scripts/check-funnel.mjs .github/scripts/check-release.mjs
```

The first command updates the content HTML, editor resource copy and 49-URL sitemap.
The second regenerates all seven editor snapshots, including the Chinese root,
and aligns visible copy, metadata and structured data. The release check validates
unique titles and descriptions, canonical URLs, one H1 per page, image alternatives,
local links and fragments, contextual links and structured data. Content pages have
WebPage and BreadcrumbList markup; tutorials also have Article and HowTo markup
matching visible text. This does not guarantee search result enhancements.
The unpublished video converter and the error page remain noindex and outside the
sitemap. `robots.txt` allows crawling and points to the canonical sitemap.

`assets/audio-selection.png` is a screenshot of the working English editor with a
synthetic local audio sample, not a user's recording. Guide layouts reuse the site's
teal accent and use the Mintlify documentation reference for reading widths and navigation.
The MP3 guide includes phone file selection, time-input adjustments and download
troubleshooting in all seven languages. Contextual links appear inside the body,
not just in a related-links footer. Share cards use the actual editor screenshot;
images reserve dimensions and article screenshots are lazy-loaded.
External references lead to Apple, Google Pixel and MDN documentation. These are
outbound references. The public GitHub README links back to the tool and selected
guides, providing a relevant repository-to-site link without promising ranking benefits.
Earn additional inbound links through useful demos,
relevant tool directories and original tutorials; do not promise ranking gains or
buy bulk links. No third-party post or directory submission is published by this build.

Submit `https://www.tomp3.xyz/sitemap.xml` in Google Search Console and Bing
Webmaster Tools after verifying site ownership. Review indexing, queries,
clicks, and countries there. In Bing, review AI Performance if available.
Use those reports to choose future guides rather than inventing search demand.
The site's event counters are action counts, not unique people or user-level
conversion data. Do not add credentials or verification tokens to this file.

## Verification and search measurement

Run `node .github/scripts/check-language-seo.cjs` with Playwright/Chromium to check
stable locale URLs against conflicting browser/IP/saved preferences, explicit Auto,
manual URL navigation, mobile overflow and visible/schema language consistency.
Run `check-editor-ui.cjs` and `check-funnel-ui.cjs` to verify actual selection,
preview, byte-preserving export and unchanged anonymous event payloads. These
tests use local fixtures, not production events. The deployed-content check now
covers all 49 indexable pages as well as sitemap, robots, shared icons and splitter assets.

Search Console indexing is an external state, not a build result. Record each
URL's inspected status, Google's selected canonical and the inspection date only
after reading Search Console or an authorized API/export. Do not label an HTTP
200 page as indexed. Submit the existing sitemap rather than inventing additional
URLs solely for keyword coverage. Review 28-day query/page/country/device exports
weekly; prioritize high-impression low-CTR pages for title improvements, and pages
with relevant queries but insufficient answers for content updates. Record changes
and compare periods, distinguishing partial days and the console's reporting timezone.
Do not infer target markets from raw Cloudflare country/request counts.

Further backlinks require editorial work and publication on relevant external
sites; adding outbound references or passing tests does not create inbound links.
The existing public README provides genuine tool and guide links. No directory
listing, purchased link, Search Console submission or indexing request is claimed
by these scripts.

## MP3 splitter and editing intent (2026-11-05)

Primary English query: `mp3 splitter`, served by `/en/mp3-splitter/`, with a working
duration/timestamp splitter, actual output preview, individual downloads and ZIP.
Secondary query: `how to edit mp3`, served by `/en/guides/how-to-edit-mp3/`, explaining
trim versus split, four real steps and the boundary between frame copying and
sample-changing editing. Seven localized versions have self canonicals and reciprocal
language links. Existing cutter and cut-MP3 URLs keep their narrower single-excerpt
intent; no old URLs are removed or redirected simply to target the new keywords.
Home resource links, article body links, guides and the splitter cross-link through
the shared content directory. These are not duplicate title-swapped landing pages.

Search volume, KD and low-DR competitor figures were provided by the user; they
were not independently verified. The referenced external report path was unavailable
on this machine. Do not present those figures as measured traffic or a ranking promise.

The splitter reuses the existing cutter's MPEG header arithmetic, with stricter
Layer III validation, VBR support and separate local-Worker scanning. Output omits
stale original Xing/VBRI/ID3 metadata. It prefers nearby independent frames when
available but clearly discloses bit-reservoir dependencies and non-gapless boundaries.
CBR/VBR fixture tests check copied bytes, ZIP, playback and FFmpeg decoding; they
do not prove artifact-free boundaries for all MP3 encoders. JSZip 3.10.1 is vendored
with its license, loaded only for ZIP, using STORE rather than recompression.
