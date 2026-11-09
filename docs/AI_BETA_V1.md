# Animal Voices v1.0 — AI editorial beta

**Purpose:** Improve our *existing* answers first, and optionally write a fresh alternative. Facts are constrained by curated evidence cards and must still be checked by the editor against original sources.

## Current status (2026-11-09)

- Code implemented and covered by simulated two-model API tests.
- **The live AI feature is NOT activated without server-only `OPENAI_API_KEY` and `AVOS_EDITOR_CODE`.** The app shows an honest availability indicator.
- The public editor works fully offline with the original curated answers. The AI is an opt-in advanced/private workflow.
- No real provider invocation or original-source live retrieval is claimed by these tests.

## UX

1. Enter a real, anonymized Instagram comment; Animal Voices chooses an evidence-backed topic and offers its curated answer.
2. Open **Mit KI verbessern** below the editable draft.
3. With a private editor code and explicit consent, choose **Bestehende Antwort verbessern** (preferred) or **Neue Variante erstellen**.
4. Writer model receives the comment, current draft (only in improve mode), current persona, and **server-sourced** fact capsule, limits and source notes.
5. Independent critic checks that claims align with the supplied curated evidence, that material limits are included and that the response actually helps.
6. If the critic fails, no suggestion appears; the original remains untouched.
7. If accepted, compare **before / after** and inspect the short change summary. Only a deliberate **Vorschlag übernehmen** action changes the editable answer.
8. Every use invalidates previous source-open confirmation and human approval. The editor must open the original source and review the evidence, then approve and copy manually.
9. Never autopost.

## Activation: private editor only

Set these variables in **Vercel → Project → Settings → Environment Variables** for the `animal-voices-os` project, target Production:

- `OPENAI_API_KEY`: a project-scoped OpenAI API key, **server only**; never in GitHub, browser JavaScript, URL or frontend logs.
- `AVOS_EDITOR_CODE`: a random private secret of 16+ characters, **not your Instagram password**. Example generating a secret locally: `openssl rand -hex 24`.
- Optional `AVOS_MODEL`: a supported Structured Outputs model. Current default: `gpt-4.1-mini`.

**Do not include actual keys or passwords in a chat message or public commit.**

After variables are configured, redeploy. Visit `/api/status` and confirm that `available` is true. Test the first private, opt-in model request with an anonymized **known-topic** comment.

### Operational limits

- The service requires a private editor code in a timing-safe comparison and a valid browser origin.
- A **best-effort, per-instance** throttle of 6 requests/minute exists. Serverless instances can be multiplied or reset; this is **NOT sufficient** for a public signup or a guaranteed spending cap.
- Before opening the AI to a public audience, add per-user authentication, a durable distributed rate limit, per-user hard quotas, cost alerts/budget caps, abuse monitoring, and a privacy/data retention assessment.
- Client and server reject obvious handles, contact details and direct links; pattern checks cannot guarantee all private details are caught. Only send text you have reviewed and anonymized.
- `store:false` is requested of the model API. Provider data handling must still be assessed under applicable terms and privacy rules.
- Requests are *not* saved by this API. User may have locally stored drafts in their browser.
- Existing factual sources are curated summaries. **A second AI critic is not a professional or real-time source verification.**

## Failure states

- Missing credentials → 503 with original curated answer untouched.
- Unsupported, ambiguous, quoted, threatening or sensitive topic → 422; no model call.
- Insufficient improvement → explicit "keep the original" result.
- Critic rejects unsupported claim → 422, no suggestion.
- Network timeout, malformed response → 503, original unchanged.
- No approval before copying; manual review required after changes.

## Test strategy

Run `npm test` (Node 22+). `tests/ai_improve.test.mjs` fakes OpenAI's structured Responses API and tests new/improve drafts, critic veto, no improvement, privacy, evidence abstention and explicit consent, without incurring model charges.

Before calling the feature production ready, perform a **real** end-to-end provider test with project credentials and original source verification. Test at least five anonymized known comments and five safely held comments; perform Android/iOS browser checks.

## Product-learning loop

Compare old vs AI-improved drafts with the **Response Lab**. Ask both whether the editor would post them and whether a subject expert verifies their factual statements. Measure the rate of "neither" separately. Reuse clear, safely verified wins as human-edited templates in the deterministic offline library.

**For animals. With humans. Facts first, always.**
