# Animal Voices v1.1 — Answer Upgrade Lab

**Status:** Implementation and automated browser-like tests complete. Real paid AI evaluation is **not** activated unless `OPENAI_API_KEY` and `AVOS_EDITOR_CODE` are securely configured in Vercel. Never represent redactional demos as AI outputs.

## The problem we are solving

"Make our existing answers substantially better" is a different question from "Can we generate a new answer?" v1.1 starts with a trusted baseline from `context-fit.js`, asks a private model for a real improvement, applies a separate model critique against curated source notes, then offers a blinded comparison. All results are proposals until manually reviewed against original sources.

## What's shipped

- `/upgrade.html`: mobile-friendly 20-case lab; default shows a synthetic, non-personal test comment and the associated source links/limits.
- `upgrade-cases.json`: fixed, versioned set of 20 synthetic examples across eight evidence-backed topics, three personas, question and skeptic contexts. They are **not real Instagram users** and the default is **0 real AI generations**.
- **Private AI improve:** one click and explicit consent on each test; sends exactly the selected synthetic comment and existing curated reply to `/api/assist`, which uses writer + critic model steps.
- **Demo without API:** editorial baseline versus existing context-specific editorial text. Visually and in saved data labelled `editorial_demo` and **never counted** as live AI.
- **Blind A/B:** randomised sides; no winner until the reviewer votes. Either A, B, or "neither" can win. Critical factual/safety problems and whether an original source was actually checked are separate flags.
- **Shareable reviewer pack:** export a JSON with anonymous, randomly ordered A/B versions and *no mapping* showing which came from AI. An independent reviewer imports it, votes without credentials, and exports votes. The owner retains mapping in local storage and can export the editorial record separately.
- **Privacy:** private code remains in password input and is not stored, exported, URL-encoded, or sent except as a request header following consent. No central analytics, automation, Instagram posting or batch generation.
- **Offline fallback:** the demo can use cached app assets; live AI requires a real connected server.

## What the numbers do — and don't — mean

Metric | Interpretation
--- | ---
"AI 0/20" | No real AI improvement saved in this browser yet.
"Blind judgments" | Only votes actually cast in this browser. A volunteer pack has no central aggregation.
"AI preferred %" | Among noncritical decisive votes for local real-AI comparisons, how often the AI side was chosen. It does **not** prove factual correctness.
"Critical failure" | A reviewer flagged a factual, attribution or safety problem. This blocks automatic adoption; the marker is not a certified research judgment.
"Source checked" | Self-report. Not independently validated by the app.

## First live test once editor keys are configured

1. Configure `OPENAI_API_KEY` and `AVOS_EDITOR_CODE` in Vercel Production Environment Variables. Generate and store credentials **only in provider settings**, never in chat or GitHub.
2. Redeploy. Confirm `/api/status` returns `available:true`; use the private editor code only on the HTTPS site.
3. In `/upgrade.html`, open the private AI section and consent to submitting synthetic materials. Run **one** case and verify source links, fact accuracy, critic behavior, response time, and costs manually.
4. Run the other 19, deliberately one at a time. No automated expensive batch and no extrapolation from synthetic prompts.
5. Export the **blind pack**, ask 10–20 volunteer reviewers with different views to import it and return their votes. Review factual statements independently against the original sources, ideally with two reviewers on claim-heavy topics.
6. Calculate preference A/B/neither, factual critical errors, source verification, length, contextual relevance, real time/cost, and agreement between raters. Only promote improved templates after human approval.

## Product targets, not achieved metrics

- **0 fabricated references** among source-reviewed accepted drafts.
- **0 auto-posted Instagram replies**.
- **20/20** drafts evaluated or conservatively rejected with documented reasons.
- At least **70% of consenting readers** find the test straightforward to complete on mobile (pilot target, not measured).
- A substantive positive preference shift compared with the existing baseline, including "neither" and disagreement, **without reduced factual accuracy**.
- If external model is unavailable, the curated original remains usable.

## Quality and security caveats

The present two-model flow checks **only curated summary notes**, not the original scientific PDFs. It is not independent source verification. Topic routing is still keyword-based, so unfamiliar or ambiguous comments can be held. Existing 20 examples are designed to be source-linked; they do not measure open-world classifier performance. The private per-instance request throttle does not guarantee cost protection across serverless instances. Hard per-user quotas, billing alerts, authentication, privacy review and professional source verification must precede public availability.

**The next release decision should be evidence-led:** improve what real human reviewers prefer, but never sacrifice accuracy for engagement. For animals. With humans.
