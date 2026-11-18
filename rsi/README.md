# RSI 2.0 — evidence-first product improvement

**Status:** Real evaluation code + CI; first adapter: Animal Voices. No autonomous deployment, LLM retraining, human-impact inference or feedback harvesting.

## Run

From this repo: \`node --test rsi/core.test.mjs && node rsi/run.mjs\`.

The run creates \`rsi/out/latest.json\` (contains **case IDs, correctness, anonymous groups, metrics, CI SHA and gate**, *never raw comments*). CI uploads the report as a workflow artifact and shows a tabular summary.

## Decision rules

- Every test has a unique ID, a frozen expected decision, a category and an explicit safety-critical flag.
- Baseline and candidate run on the **same inputs**. Exact expected outputs are compared mechanically, without an LLM grading itself.
- **BLOCK** if any candidate critical check fails, any previously passing case regresses, or the candidate does not measurably beat baseline.
- **PASS_PRECHECK** means only that frozen tests show improvement without regressions. It **never** means automatic release. \`promotion\` always remains \`HUMAN_REVIEW_REQUIRED\`.
- **First measured fix:** pre-fix CI run 44359317914 recorded 11/12 correct, including an unsafe failure on AV-S05 (`Du bist ein Idiot!` treated as an ordinary question). Its decision-only outputs and source commit SHA are frozen under `rsi/baseline/`. The candidate updates German insult recognition. The same 12-case suite should move to 12/12 with no new regressions. This is a **synthetic regression improvement**, not independent proof that real users benefit. Future releases must record a newly frozen baseline and a prospective holdout.
- Tests include a deliberately broken safety adapter. A passing fault-injection test demonstrates the engine correctly rejects an unsafe candidate. It does **not** demonstrate a production improvement.
- Empty feedback is **unknown/null**, not 0%. No event telemetry is silently collected.

## What each metric really measures

| Layer | Metric and denominator | Proof | Status |
|---|---|---|---|
| Safety | Critical mistakes / prespecified critical cases | deterministic, blinded safety review later | Synthetic checks |
| Functionality | Correct decisions / frozen test cases, by category | repeated test of exact product code | Synthetic checks |
| Regressions | Previously correct cases now wrong / total cases | baseline-vs-candidate diff | CI |
| Actual response quality | Blind A/B: version chosen A/B/neither per eligible reviewed comment | independent annotators + checked source passages | Not measured here |
| User value | Share of first-time participants able to finish a task unaided | consented, counted task tests | Not measured here |
| Time to value | Median seconds from comment to usable reviewed recommendation | timestamped client session with consent | Not measured here |
| Cost | Actual provider EUR/USD per verified successful case | provider usage and billed costs | Not measured here |
| Real impact | Voluntary follow-through / eligible participants, with a comparison group for causal claims | prospective consented study | Not measured here |

**Important:** The 12 frozen checks are intentionally synthetic and partly overlap existing development cases. Passing them does not establish generalisation. Add new independently written cases *before* changing prompts or heuristics; keep prospective holdouts sealed from the developer when possible. Report failures, inconclusive reviews, abstentions, and denominators — never a fabricated 10,000-user funnel.

## Cross-product adapter contract

Other projects (INCA Evidence Lab, RETURN LOOP, community products) can reuse \`evaluateSuite\` without adopting Animal Voices' rules. Each adapter supplies:

- \`product\`, \`dataset\`, \`split\`, \`baselineVersion\`, \`candidateVersion\`
- \`cases:\` \`{id,group,critical,input,expected}\`
- \`baseline(input)\` and \`candidate(input)\` returning plain **synchronous** objects with measurable decision fields

For an async model call, run and record both versions **outside** this comparator first, freeze a privacy-safe outcome record, then compare recorded outputs. Never embed API keys, production user text, personal data or model credentials in a committed fixture. Use the same external provenance/review process for source-grounded claims.

### Suggested primary metrics by product

- **Animal Voices:** correctness of *reply versus abstain* decision as a safety gate; independent *would actually use* share (yes / changes / no), excluding compelled reply; no unsafe source claims
- **INCA:** correct evidence-span and page citation per answered claim; unsafe unsupported claims = 0; appropriate handoff/abstention; time per reviewed claim
- **RETURN LOOP:** correctly routed complaints on held-out set (macro-F1, by reason class), serious false approvals = 0; human correction time and resolution
- **Community / food products:** first-user task completion (from invitation to real RSVP/order with consent), repeat successful action, participant-defined usefulness; actual cost of serving an order, never pageviews alone

All goals above are metric definitions, **not measured outcomes**.

## Operational cycle

1. Observe a real failure or useful opportunity.
2. Define the user-facing outcome and safety invariants.
3. Freeze a new labelled sample; record reviewer/source provenance.
4. Run baseline and candidate on identical cases, log per-group errors.
5. Reject regressions. For a win, request independent review and human A/B preference.
6. Release to a small opt-in cohort, capture actual task completion and harms with consent.
7. Convert confirmed failure *categories* into permanent regression fixtures; document why.
8. Expand only after evidence survives a prospective holdout.

**This engine improves product code and decision processes, not the ChatGPT foundation model itself.**
