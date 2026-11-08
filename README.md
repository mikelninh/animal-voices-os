# Animal Voices OS v0.9 · Kindness Engine

[**Live**](https://animal-voices-os.vercel.app/) · [GitHub](https://github.com/mikelninh/animal-voices-os) · *For animals. With humans.*

An original, compassionate, privacy-first Instagram Companion for choosing when to reply, report, ignore, or turn recurring questions into stories. Curated evidence is always openable, with original links and scientific limitations. No automatic social-media posting.

## v0.9 — Shipped capabilities

- **Context and claim engine** (`engine.js`): distinguishes questions, quoted claims, negations, irony, direct claims, medical risk, harassment, possible threats and prompt injection. Multi-topic ambiguity and unknown claims are held instead of guessing. Its interpretation is a **local heuristic**, not a trained AI classification or proof of accuracy.
- **Evidence worker**: selects among twelve curated topics and eleven institutional or research references; requires a source link and explicit scientific caveat, displays the limitation and the human editor gate.
- **Human decision gate**: `Reply / Report / Ignore / Save idea`. Open a source and tick the editorial review to approve a sourced answer. Copy with citations only after approval. No automatic Instagram actions.
- **Private POST Android Share Target**: on supported installed PWAs, a Service Worker receives the Android share via `POST /share`, writes one temporary, local-only record to IndexedDB, and redirects to `/?inbox=1`. The page consumes and deletes the incoming record. Unlike the older GET method, shared text is not put into the URL or sent to our hosting backend. Unsupported browsers retain copy/paste fallback. The Service Worker cannot intercept POST unless installed/activated.
- **Content feedback loop**: groups genuinely saved, de-identified content ideas by topic, not invented trends, and opens the content studio with the selected subject.
- **Optional AI writer + independent critic** (`api/assist.js`): an OpenAI model drafts a response from our server-side evidence, another model checks whether it is supported. Both calls require deliberate user consent, an editor access code, and `OPENAI_API_KEY`/`AVOS_EDITOR_CODE` configured on the server. **Not enabled by default**. Even after the model critic passes, original source checking and human approval remain mandatory. No live scientific search or external peer review.
- **Honest records**: locally stored, partly de-identified audit data and voluntary self-reports. Every external impact metric remains zero until independently measured. Personal posts are not fetched or tracked.

## Start and test

Node.js 22+ (no dependencies for the offline experience).

```bash
npm test
npm start
# http://localhost:5173
```

GitHub Actions runs source, safety, PWA, and optional-API contract tests on each push. The test corpus includes **100 synthetic examples**; it is not an evaluation of 100 real Instagram comments. On-device Android-to-PWA sharing still needs testing with a real installed app.

## Deploy and configure optional AI

1. Deploy repository root to Vercel. The public static app needs no secrets.
2. Optionally add `OPENAI_API_KEY` and a random **16+ character** `AVOS_EDITOR_CODE` in Vercel server environment settings. You can override `AVOS_MODEL` (default `gpt-4.1-mini`). Never put API keys in source, query strings, client storage or public JavaScript.
3. The API is off and returns 503 unless *both* secrets are set. The editor code is a temporary private-beta gate **not production user authentication**. For multi-user production, add real authentication, server-side rate limits, spending limits, privacy review and abuse monitoring.
4. The user must explicitly check consent before sending the anonymized comment to the AI provider. The API accepts only vetted evidence topics, blocks sensitive cases, checks source IDs, runs a second critic, and holds on uncertainty.
5. Every AI output is a **draft**, not a verified scientific claim; no Instagram post is sent automatically.

### Limitations

The current 12 claims and 11 links are **editorial, not independently validated**; quotes embedded in source data must not be treated as verified direct quotations until checked against the full paper. The local decision engine is conservative but neither fully reliable nor able to read unseen Instagram context. PWA share targets are Android/browser dependent, and Instagram may share a **post link without comment text**. iOS users should use copy/paste. A GET share link from the old v0.8 application is accepted only for backward compatibility and immediately cleared from the visible URL; avoid sharing sensitive data that way.

### Next evidence milestone

Collect 100 anonymized *real* comments with consent and two independent reviewers; quantify harmful false replies, correct abstentions, source-grounding, median time, and constructive conversations. Add externally reviewed source excerpts and dates. Study whether conversations lead to voluntary learning and practical changes. Never equate comment counts with animal lives saved.

### Sources and technical references

- [MDN Share Target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target)
- [Meta Instagram API](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [DGE vegan nutrition 2024](https://www.dge.de/wissenschaft/stellungnahmen-und-positionspapiere/positionen/neubewertung-der-position-zu-veganer-ernaehrung/)
- [Hevia-Larraín et al. 2021](https://pubmed.ncbi.nlm.nih.gov/33599941/)
