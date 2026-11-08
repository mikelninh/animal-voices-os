# Animal Voices v0.8 — Instagram Companion
**Status:** Product/technical specification, not implemented.  
**Decision:** Prioritize the everyday mobile flow over another homepage redesign.  
**North-star:** helpful, source-grounded, voluntary conversations that contribute to less animal suffering, without amplifying trolls.

## User story
While scrolling Instagram, I see a claim or baiting comment. I want to decide in seconds whether to report, ignore, clarify, or save it as a recurring topic. If I respond, I want a compassionate, accurate reply with the original source, and I must approve it before posting.

## Mobile UX
1. **Capture** — Paste comment or share text through installed PWA; optionally save original post URL. Never assume a shared Instagram post URL includes comment text. No third-party comment scraping.
2. **Triage** — Four outcomes: `Reply`, `Report`, `Ignore`, `Save as content idea`; show one plain-language explanation. Only recommend reporting suspected platform-policy violations, not ordinary disagreements.
3. **Evidence** — Identify original context (question/quote/sarcasm/factual claim/value disagreement), match one claim to traceable research, show dates, original link, boundaries, and abstain when unknown.
4. **Reply** — Suggested default 1–3 sentences, optional longer answer, tone Momo/Kiki/Bao; preserve factual content across tones. Human must open the source and explicitly approve. Copy-with-citation; return manually to Instagram.
5. **Learn** — Save topic/category and approved draft locally; explicitly record whether a reply was posted. Do **not** infer likes, readers, changed minds or any measurable animal impact from a copied answer.

### Platform constraints
- Instagram API comment moderation is for professional accounts' **own media/comments**, with required Meta permissions; not for automatic replies across arbitrary third-party posts.
- A PWA share target can be offered on compatible, installed Android/browser setups. It may receive a URL rather than comment text. Provide paste fallback; compatibility is limited.
- Do not accept passwords in the app, never scrape profiles, and do not automate mass unsolicited engagement.
- Personal data minimization: avoid names, handles and screenshot storage; any import/exports must warn about containing copied text.
- Screenreader, reduced-motion and large-font testing are mandatory.

## The 4-way decision
| Decision | Use when | Default |
|---|---|---|
| Reply | Specific verifiable claim, useful for bystanders, relevant approved evidence | Short sourced correction, one follow-up max |
| Report | Threat, targeted harassment, abuse, scams or demonstrable guideline violation | Official platform report flow |
| Ignore | Ragebait with no sincere question and poor constructive reach | Do not engage, block/mute if needed |
| Save idea | Recurring question or a good educational angle | De-identified content backlog |

## Evidence infrastructure (provider-independent)
`Capture → Context & safety classifier → Claim resolver → Evidence retriever → Citation verifier → Adversarial critic → Persona writer → Human reviewer → Export/Manual publish → Outcome log`.

Evidence objects should include:
`claim_id`, `claim_text`, `source_title`, `url`, `doi`, `date_published`, `date_verified`, `study_design`, `direct_excerpt`, `support_span`, `limitation`, `reviewer_id`, `confidence`, `expiry`, `status`. Verify each quote against the source, not just a model summary.

When sources disagree, avoid a confident answer. Store retrieval and critique traces with minimal private data, no user account tracking by default. The model vendor is replaceable (OpenAI / Anthropic / xAI); the evidence ledger and policies remain ours.

## v0.8 priorities & acceptance
**P0 / first releasable Android-friendly beta**
- [ ] Implement privacy-safe native PWA share target (GET text/link) and install instructions; graceful paste fallback.
- [ ] Implement quick capture from Android and explicit separation of source link vs exact copied comment.
- [ ] Replace keyword-only selection as the only decision with human-confirmable context + safety triage; no unsupported factual claims.
- [ ] Add 4 action states; allow report/ignore without generating any reply.
- [ ] Short & long answer cards, original citation link, scientific caveat and human approval.
- [ ] Track only actual self-reported outcomes, not invented activity.
- [ ] Accessible Android mobile E2E test: text → triage → sources → edit → approve → copy → return to IG.

**P1 / evidence scale**
- [ ] 100 anonymized real comments annotated by two human reviewers; check disagreements and error classes.
- [ ] Traceable source ledger and independent scientific reviewer sign-off for first 20 claims.
- [ ] LLM agents server-side with auth/rate limiting, plus deterministic safeguards for citation verification and moderation.
- [ ] Explicit abstention and correction/appeals workflow.
- [ ] Content loop: 10 recurring comment themes → 3 original posts/reels, human-approved.

**P2 / operations**
- [ ] Own-account Instagram Professional API integration only after authorized sign-in and Meta review; comments ingestion and optional human-confirmed replies.
- [ ] Team workspace auth, role-based access, audit log and GDPR privacy review.
- [ ] Optional non-Instagram distribution via original content, partner co-productions and science pages.

### Target metrics, **not achieved numbers**
- Median supported known-topic reply from capture to **editable draft**: under 30 seconds.
- Median capture to **human-approved copy**: under 90 seconds (including source review).
- 0 invented citations, invented quotations or automatically published comments in acceptance test.
- Correctly abstain in 100% of high-risk **synthetic** test cases; separately report real-world sensitivity/specificity with confidence intervals.
- 20 authentic, voluntarily documented conversations (not scraping); reviewer assesses helpfulness and civility.
- 10 recurring themes with full evidence cards; at least 3 pieces of original content.
- Accessibility tests: 360px/390px/768px/desktop, keyboard & screen reader, no horizontal overflow.

## Growth and business model
Start with end users and creators **free**. Grow through original animal characters, source-backed educational posts, recipes, voluntary dialogue and NGOs. Paid product should sell **editorial time savings and verified production services**, not forced conversions or guaranteed ideological outcomes:
- NGOs / shelters: evidence and creative production packages (pilot fee, to validate).
- Advocacy creators / educators: paid team collaboration and research workflow, optional.
- Foodservice partners: a separate program measuring replacement of animal-containing mains and animal-product procurement by controlled comparisons.

Conduct 10 problem discovery interviews and 5 willingness-to-pay tests before choosing a price. Never invent pilot metrics or backfill a 2030 progress bar.

## Independent impact thesis
Content → useful discussions / source visits → voluntary recipe and food-service experiments → measurable reduced animal-product procurement. A 2030 stretch target of 10,000,000 additional plant-based mains per year must be separated from what Instagram interactions actually demonstrate.

### Public evidence and platform references
- Meta API: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Meta safety and reporting: https://www.meta.com/safety/topics/safety-basics/tools/stay-safe/
- PWA Share Target: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
- Controlled study of user corrections, modest effects (2025): https://misinforeview.hks.harvard.edu/article/the-small-effects-of-short-user-corrections-on-misinformation-in-brazil-india-and-the-united-kingdom/
- Risk of incorrectly correcting true information: https://pmc.ncbi.nlm.nih.gov/articles/PMC11332053/
- Faunalytics 2026 digital animal advocacy intervention: https://faunalytics.org/the-effects-of-digital-advocacy/

**Product promise:** More good conversations, less attention wasted, zero invented evidence. For animals. With humans.
