# EmojiNook — 67 Emojis MVP

A dependency-free, production-ready static site targeting the keyword **67 emoji**. It includes 18 copyable combinations, category filters, search, a meaning guide, FAQ, privacy/about pages, SEO metadata, sitemap, and Cloudflare security headers.

## Preview locally

Run any static file server from this directory, then open `/67-emojis/`.

```sh
python3 -m http.server 4173
```

## Deploy to Cloudflare Pages

Connect the GitHub repository and use:

- Production branch: `main`
- Root directory: `emoji-nook`
- Framework preset: `None`
- Build command: leave blank
- Build output directory: `.`

Before connecting a custom domain, confirm that `emojinook.com` has been registered. If a different domain is chosen, replace `https://emojinook.com` in the canonical tags, sitemap, and robots file.

## Important before monetization

The current privacy page correctly says advertising is not enabled. Update it and add an appropriate consent flow before adding AdSense or any ad network that sets cookies.
