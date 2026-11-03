# Search and AI visibility

The homepage is the existing Chinese entry point. `/en/` is a separately
indexable English version of the same working editor. Both pages link to each
other and have canonical URLs and reciprocal `hreflang` annotations. The
homepage retains the existing browser/IP-based language preference; a visitor
opening `/en/` receives English by default and can change the interface language.

The English static HTML is generated from `index.html` so that its visible
content is available before JavaScript runs. After changing the shared editor or
translations, regenerate it using Playwright and an installed Chromium browser:

```sh
node .github/scripts/render-english.cjs
node --test .github/scripts/check-funnel.mjs .github/scripts/check-release.mjs
```

Set `NODE_PATH` to the directory containing Playwright and `CHROME_PATH` to a
Chromium executable when those are not available through the normal environment.
The release check compares the shared scripts so an outdated English editor does
not silently ship. Only the allowlisted public files are deployed.

Submit `https://www.tomp3.xyz/sitemap.xml` in Google Search Console and Bing
Webmaster Tools after verifying site ownership. Review indexing, queries,
clicks, and countries there. In Bing, review AI Performance if available.
Use those reports to choose future guides rather than inventing search demand.
The site's event counters are action counts, not unique people or user-level
conversion data. Do not add credentials or verification tokens to this file.
