# Animal Voices LIVE v0.6 · private semantic conversation coach

**[Try the LIVE conversation lab](https://animal-voices-os.vercel.app/live.html)** · [Instagram browser integration](https://animal-voices-os.vercel.app/install.html) · [Version design, privacy and tests](docs/LIVE_06.md)

The next release goes beyond keyword routing: a **private, opt-in AI endpoint** performs semantic classification over the curated Animal Voices topic inventory, generates four distinct voices, and runs a separate model critique against editorial source-card summaries. Both the trusted-origin LIVE lab and the mobile userscript offer this workflow. **No unapproved text transfer, no automatic social posting, and no scientific/live-study verification is claimed.** Private `AVOS_EDITOR_CODE` and `OPENAI_API_KEY` must already be configured. Without them the local curated suggestions keep working. Offline-only/installed app flows are unchanged.

**Evidence so far:** CI tests validate input safety, private access, bilingual/voice contracts and a Chromium mobile browser with mocked AI output; this is not a claim of live production model calls or successful logged-in Instagram compatibility. Results are opt-in and explicitly require human source review.

---

# Animal Voices · Directly in Instagram (mobile browser beta)

**[Animal Voices Community Code](https://animal-voices-os.vercel.app/community-code.html)** · [Moderation policy and evaluation framework](docs/COMMUNITY_CODE.md) · **[Install on iPhone or Android](https://animal-voices-os.vercel.app/install.html)** · **[Try the in-Instagram demo](https://animal-voices-os.vercel.app/instagram-demo.html)** · [Read the release gates & source audit](docs/INSTAGRAM_COMPANION.md) · [Previous web companion](https://animal-voices-os.vercel.app/phone.html)

The new `animal-voices.user.js` works **in the Instagram website** via a Safari Userscripts or Firefox Android/Violentmonkey extension. It adds a button beside recognisable comments and a fallback tap-to-select launcher. A shadow-DOM panel first suggests a moderation action (answer, optional one-liner, one boundary, end, protect/report), then shows a suitable local editorial response and evidence limits. Source capsules were last edited on 2026-11-11. **Only you may insert and publish**; there is no Instagram auto-posting, account login or remote comment upload.

**Verified:** headless Chromium end-to-end with a mobile-sized Instagram-style DOM and manual insertion into the correct reply textarea, plus automated safety cases. **Not yet independently device-tested on logged-in Instagram.com**. The native Instagram app cannot be modified by this userscript. See [docs/INSTAGRAM_COMPANION.md](docs/INSTAGRAM_COMPANION.md) for boundaries and next test gates.

---

# Animal Voices OS v1.3 · Goal-first Conversations

[**Daily conversations**](https://animal-voices-os.vercel.app/daily.html) · [**Blind strategy test**](https://animal-voices-os.vercel.app/strategy-lab.html) · [**AI upgrade lab**](https://animal-voices-os.vercel.app/upgrade.html) · [**Strategy and research protocol**](docs/STRATEGY_V13.md)

## Our change in direction

**Choose the conversation goal before the voice.** The default app now proposes one of four distinct, editorially written goals: connection, understanding, curiosity, or enabling a voluntary next step. You can compare all four instantly without generating anything through an AI service. Momo, Kiki and Bao move into a collapsed optional personality control and remain in the full Studio.

An optional authenticated AI step now receives the selected conversation goal for both model drafting and critic checks. It never posts, does not verify original research live, requires explicit consent, and remains subject to human review of sources.

**What was tested:** 20 synthetic comments × 4 goal variants, basic safety/source gates, approval resets, local strategy feedback, blind A/B with "neither", private JSON exports, and mock-model unit tests. Real preference and animal-welfare outcomes remain unmeasured.

**Next milestone:** source-checked, diverse real comments and truly independent volunteer blind testing. See the protocol. No claim that any strategy has been proven most persuasive.

---

# Animal Voices OS v1.2 · Daily Companion

[**Open everyday mode**](https://animal-voices-os.vercel.app/daily.html) · [**Full Studio**](https://animal-voices-os.vercel.app/?studio=1#dialog) · [**20-case Answer Upgrade Lab**](https://animal-voices-os.vercel.app/upgrade.html)

## v1.2 — Real daily utility, not another dashboard

The default homepage now sends visitors to a quiet, responsive everyday flow. Enter a comment (or use a safe sample), receive a source-linked curated answer immediately, choose **Klar / Warm / Locker** without navigating away, review original evidence, then copy the short reply yourself. No account, private code or AI request is needed for this baseline. Unsupported/unsafe comments fail closed into a hold, ignore or report suggestion.

An explicitly optional private **Mit KI feilen** tool takes the current reply through writer + independent model critic *against curated source capsules*. It requires the existing `AVOS_EDITOR_CODE` and per-request consent; editor code stays in this page's password input, never in storage or URLs. AI drafts are never automatically adopted, and adoption revokes prior source review. Production `/api/status` reports configured capabilities only; a valid provider request still needs separate testing with the private code. Drafts are not independently scientifically verified.

The home-screen PWA now opens the daily mode. Existing Android share-to-app handling stays on the legacy studio route `/?inbox=1#dialog`, with its local-only IndexedDB inbox. The full old studio remains accessible at `/?studio=1#dialog`.

**Test basis:** automated Node tests cover 20/20 source-backed corpus cases, copy approval revocation, safe holds, privacy guard, optional AI consent, and PWA shell. GitHub Actions is the authoritative test run. No real external users, preference votes, improved dialogue outcomes or live-source verification are claimed.

**Limits:** keyword-led topic recognition covers only the curated knowledge base. Private editor codes are temporary beta gates, not a substitute for proper multi-user authentication and distributed rate limits. Manually verify original sources and claims before using a reply.

---

# Animal Voices OS v1.1 · Answer Upgrade Lab

[**Live Companion**](https://animal-voices-os.vercel.app/) · [**20-case Answer Upgrade Lab**](https://animal-voices-os.vercel.app/upgrade.html) · [Response Lab](https://animal-voices-os.vercel.app/quality.html) · [v1.1 Test Protocol](docs/UPGRADE_LAB_V11.md)

## v1.1 — Are the improved answers genuinely better?

- A reproducible set of **20 synthetic, anonymous known-topic comments**, manually tied to the curated source library. These are not measured users or real social media outcomes.
- An editor can **opt in to a private real AI model review of an existing answer**, one case at a time. Writer and critic calls stay server-side. No model credentials are saved or sent on page load.
- A separate clearly labelled **editorial demo mode** works without API credentials and does not count as AI.
- A/B cards are shuffled blindly. Reviewers can choose A, B, or neither; critical facts/safety issues and whether original sources were actually checked are recorded separately.
- **Shareable blind reviewer packs** omit which side is AI-generated. Reviewers import them without private AI credentials and export local votes. The owner keeps the version mapping separately.
- All results are local to the browser; there is no central user database, anonymous telemetry collection, automated publishing or fake impact counter.
- The live AI endpoint remains **inactive until the project owner configures `OPENAI_API_KEY` and `AVOS_EDITOR_CODE` securely** on Vercel. Source notes do not constitute independent verification against primary studies. The 20-case pilot is deliberately not a test of arbitrary new comment understanding.

**Current state:** Deterministic everyday app works, AI server and demo/review workflow coded, production OpenAI credentials not yet provisioned; no real AI improvements or participants measured.

[Setup and safety](docs/AI_BETA_V1.md) · [v1.1 evaluation guide](docs/UPGRADE_LAB_V11.md)

---

## Previous release: v1.0

[**Live Animal Voices**](https://animal-voices-os.vercel.app/) · [**Private AI setup instructions**](docs/AI_BETA_V1.md) · [**Answer Quality Lab**](https://animal-voices-os.vercel.app/quality.html)

## What is new?

- **Improve an existing reply with AI**: optional private editor receives a curated existing reply and its claim/limitations, offers a better-targeted version, and shows **before → after** with a reason.
- **Or create a fresh alternative**: both routes pass through a separate model critic and never claim to have verified an original study live.
- **Human choice**: suggestions are never applied automatically. Applying one resets approval, copied/posted status and source-open confirmation.
- **No keys or user comments are committed**. Model calls happen server-side only following explicit consent, authenticated private editor access and best-effort request throttling.
- **Fallback**: the curated, deterministic conversation tool remains fully usable even when AI is unavailable.
- **Public AI activation is pending**: project-scoped credentials are **not yet configured**. `/api/status` reports availability honestly. We have tested the endpoint with **mocked model calls**, not real paid provider responses.

Activation and important cost/privacy limitations are documented in [docs/AI_BETA_V1.md](docs/AI_BETA_V1.md). For broader public access, durable quotas, budgets and expert source verification must come first.

---

## Previous version: v0.9.5

[**Live companion**](https://animal-voices-os.vercel.app/) · [**Response Lab**](https://animal-voices-os.vercel.app/quality.html) · [**Source**](https://github.com/mikelninh/animal-voices-os)

## v0.9.5 — Better context, not more buttons

Animal Voices is a **deterministic, curated** advocacy companion, not a live AI chatbot. The public client currently uses rules to match 12 themes and manually written editorial replies. An optional `api/assist.js` model writer + critic exists but is **not activated** in the everyday UI and requires server-only provider credentials, an authorised editor and explicit consent. It is **not live scientific verification**.

- Added `context-fit.js`: 72 new intent-aware editorial replies (12 subjects × 2 contexts × 3 distinct voices). Existing factual templates remain for straightforward claims.
- **Question vs. objection:** For supported topics the companion heuristically suggests a context; readers can switch to question / skeptical objection / factual claim in the visible reply card without restarting.
- **Approval revocation:** Changing context invalidates the old approval, copy state and previous source-opening confirmation. Source must be opened and manually reviewed again.
- **Private quality feedback:** One tap can flag irrelevant, preachy, too long or weakly sourced replies. Stores only topic/context/persona/reason locally, not the comment text or user identity. Manual JSON export includes locally stored feedback.
- **Response Lab v0.9.5:** Blind comparisons now measure whether the earlier general response or the new intent-aware response is preferred **for a specified context**. It has no shared cohort data or genuine users by default.
- Offline PWA cache version bumped to include the new script, and source assets are versioned.

### Scientific integrity & consent

Curated source links are **not** live-checked. Every public factual claim must be checked against original research and limitations by a person. Deterministic safety gates stop some threats, quotations and sensitive medical matters, but cannot guarantee detection of all cases. No third-party posting, no Instagram account scraping, and no automatic publication. Do not share private comments or identifiers.

### Why the future version should use LLMs

The rules-based prototype is cheap, predictable and offline-friendly but misses context and new objections. A production hybrid could use an authenticated server-side LLM as a **context + draft assistant**, with source-retrieval, independent deterministic citation checks, model critique, safe abstention, rate limits, logging minimisation and human approval. Until provider keys, consent and a source-review process exist, we cannot label this a live AI assistant.

### Evaluation

Acceptance before claiming superiority: test anonymised real comments with diverse non-vegan / vegan reviewers; blind preference + neither rate, independent factual review, absolute safety error counts, context-match accuracy and qualitative feedback. Metrics begin at zero: no real participant or animal-welfare outcome is implied by this release.

---

## Previous release: v0.9.4

[**Live companion**](https://animal-voices-os.vercel.app/) · [**Response Lab**](https://animal-voices-os.vercel.app/quality.html) · [GitHub](https://github.com/mikelninh/animal-voices-os)

## v0.9.4 — Response Quality Engine

- All 12 topics now have **36 new, voice-specific short responses** rather than the same text with three superficial openers. These remain editorial drafts, NOT peer-reviewed or live fact-checked.
- **Response Lab:** blinded old-vs-new A/B choices, optional six-criterion ratings (weighted: evidence 25, context 20, respect 15, clarity 15, constructive 15, voice 10), hard factual/safety-error flag, local-only browser storage, anonymized CSV export.
- A locally stored preference is NOT a representative study, verified source review, or animal-welfare impact. Missing ratings are never filled with invented scores.
- The companion stays simple; the optional evaluation link appears below the dialogue workflow. Existing approvals and human source checking remain unchanged.
- Research rationale: corrections improve belief accuracy but changes in downstream behavior are less certain (Porter & Wood, 2024); miscorrections can hurt trust in true information (2024 cross-country experiments); short-user corrections sometimes have only small average effects (Altay et al., 2025).

### Quality acceptance

**Hard gates:** No invented citations, no factual distortions, no personal attacks, no medical overreach. An entertaining answer that fails a gate is rejected regardless of preference or weighted score.

**Trial protocol:** 50–100 real, anonymized comments; 2 independent reviewers per source-critical item; randomise left/right presentation; report raw per-topic votes and abstentions separately; aim to recruit 10+ blinded readers; include disagreement and adverse reactions.

**Future:** Compare selected answers in controlled, consented settings to measure useful comprehension, trust and willingness to continue; never infer animals saved from likes or copied responses.

## Previous release: v0.9.3

[**Live**](https://animal-voices-os.vercel.app/) · [GitHub](https://github.com/mikelninh/animal-voices-os) · *For animals. With humans.*

An original, compassionate, privacy-first Instagram Companion for choosing when to reply, report, ignore, or turn recurring questions into stories. Curated evidence is always openable, with original links and scientific limitations. No automatic social-media posting.

## v0.9.3 — Easier daily use

- Private AI writer and editor-code field are hidden from the user-facing app until an authenticated AI service actually exists. The backend route remains feature-disabled without server keys.
- The redundant reviewer-initials input is removed. The local audit uses a single-user approval marker; do not mistake this for multi-user identity verification.
- One human review checkbox, unlocked only after at least one original source link was opened. Opening a link is not proof it was read; user must explicitly confirm its content before copy.
- The system selects a character automatically: Momo for research/nutrition/environment, Kiki for ethics/animal lives, Bao for enjoyment and everyday food. An optional collapsed voice switch retains user choice for the current draft; all personas share factual claims and sources.
- Copy sends the complete edited reply with all related original source URLs in a clearer list; no one-click auto posting.
- Usability objective: the original short answer, source link, and review confirmation should fit a single natural mobile journey.

## v0.9.2 — One-Screen Companion (human-first)

- **One obvious action**: paste a real comment and select **Antwort finden**. Supported editorial topics immediately show the draft below a compact, explained recommendation – no repeated "Next" navigation. Example chips run the same flow in one tap.
- **Progressive disclosure**: optional link and context, alternative actions, source details, privacy information and the unconfigured AI worker stay available without monopolising the first screen.
- **Evidence next to the claim**: original source links and key limitations appear beside the draft, not on a separate mandatory page. Users must open an original source, personally check the passage and explicitly review the final answer before copying.
- **One confirmed action**: **Prüfen & kopieren** records human approval and attempts the clipboard copy, retaining a separate manual retry if browser clipboard access fails.
- **One-time local initials**: the reviewer abbreviation is remembered only in the same browser. Changing the reply revokes approval and any self-reported posting.
- **Safety unchanged**: threats, quoted/debunked claims, minors' nutrition questions, medical advice and unsupported assertions abstain. No Instagram automation.
- **Acceptance**: 43 automated tests and four independent Chromium viewport flows (360/390/768/1440). The browser tests verify the interface against the shipped script with outbound links mocked; no real Instagram / native Android share-sheet test yet.

See [v0.9.2 product note](docs/V092_SINGLE_SCREEN.md) for design rationale and QA limitations.

## v0.9 — Core capabilities retained

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