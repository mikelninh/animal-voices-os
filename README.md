# Animal Voices v0.8 — Instagram Companion 🐮🐔🐷

**Live:** https://animal-voices-os.vercel.app/ · **Repo:** https://github.com/mikelninh/animal-voices-os

*For animals. With humans.*

## What changed from v0.7

- Installable progressive web application with Web Share Target (`GET /?shared=1&text=...`) on supported Android/browser combinations. Sharing text does **not** assume it is the actual comment. The user must confirm it; link-only shares cannot be submitted as comments.
- Fast four-way triage after pasting a comment: **Reply / Report / Ignore / Save idea**, each explained in plain language. Classification is a cautious deterministic heuristic, **not** a platform moderation decision or an AI model.
- Reply supports **short Instagram** and **full context** formats, with existing curated sources, caveats, Momo/Kiki/Bao personas and mandatory explicit reviewer approval.
- Report gives human-only instructions for Instagram and optional self-report. Ignore preserves privacy. Save stores de-identified ideas locally. User-posted replies are only self-reported, never falsely marked as verified.
- Offline app shell via service worker (not offline source verification). Responsive one-handed controls and an install prompt when the browser makes one available.
- 12 curated topic cards and 11 original research/institutional links from earlier release. **No live literature retrieval or automatic Instagram publishing.**

## Everyday workflow

1. On Android, install Animal Voices from a compatible browser. Open Instagram, use **Share → Animal Voices**, or copy and paste the exact comment. Instagram often sends only the post URL.
2. Confirm the comment and decide what to do: Reply / Report / Ignore / Save for content.
3. If Reply, check the evidence, choose short/long and a persona, review and approve. Copy the response **with source links** and post manually on Instagram.
4. Optionally note that you posted. Such logs are self-reports, not actual impact measurements.

**iPhone or unsupported browsers:** open the site and paste the text or use the clipboard button. The share target feature is browser- and device-dependent. We have not run a native Android Instagram→OS-share-sheet acceptance test on a real handset.

### Privacy and security

- All regular triage and logs run locally in the browser, with no account or database; never share names or confidential comments.
- **Important GET-share caveat:** The incoming Android shared text is initially placed in the request URL, which can pass through infrastructure logs before JavaScript removes it from browser history. Treat shared data as public, anonymise it, and avoid private information. A future POST/service-worker approach could reduce this exposure.
- Comments and URLs are untrusted input; links must be explicitly opened by the user. Unknown claims, quoted viewpoints and sensitive medical topics abstain, rather than hallucinating sources.
- No scraper, bots or posting to Instagram/X. Links to Instagram are manual-navigation links.
- A PWA icon and service worker are included. Offline cached assets are only a static shell; comments and share query strings are not cached.

## Run and test

Requires Node.js 22+.

```bash
npm start
npm test
# open http://localhost:5173
```

The regression suite covers the current workflow and new share-target, triage and privacy decisions. `tests/browser_v08.py` provides an extended Playwright browser acceptance suite; its static-mount mode is used where local HTTP navigation is prohibited by a browser policy. It does **not** prove native Android share-sheet registration.

## Priorities after v0.8

1. Hands-on tests on Android Chrome + Instagram and iPhone fallback.
2. 100 anonymised real comments annotated by people; measure both false-positive correction and abstention rate.
3. Field-verified quote-level evidence ledger and independent science reviewer; only then add server-side provider-independent AI workers.
4. Permissioned Instagram Professional account tools for **owned** media, an authenticated approval queue and thoughtful impact research.

**Guiding metric:** helpful, reliable conversations per editorial hour — while keeping impact claims separate from actual changes in animal-product purchases.
