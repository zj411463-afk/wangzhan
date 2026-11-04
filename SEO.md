# Search and AI visibility

The homepage retains its existing browser/IP-based automatic language choice.
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

Four content pages are available in every supported language: ringtone and podcast
use cases, MP3 cutting and speech-excerpt tutorials. The source of their translated
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

The first command updates the content HTML, editor resource copy and 35-URL sitemap.
The second regenerates the translated editor snapshots. The release check validates
unique titles and descriptions, canonical URLs, one H1 per page, image alternatives,
local links and fragments, contextual links and structured data. Content pages have
WebPage and BreadcrumbList markup; tutorials also have Article and HowTo markup
matching visible text. This does not guarantee search result enhancements.
The unpublished video converter and the error page remain noindex and outside the
sitemap. `robots.txt` allows crawling and points to the canonical sitemap.

`assets/audio-selection.png` is a screenshot of the working English editor with a
synthetic local audio sample, not a user's recording. Guide layouts reuse the site's
teal accent and use the Mintlify documentation reference for reading widths and navigation.
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
