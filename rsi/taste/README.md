# Taste OS v0.1 — research taste as a testable decision skill

Research taste is the ability to choose **which worthwhile uncertainty to investigate next**. It belongs above the RSI build / measure / improve loop. This version deliberately does not pretend to train a new foundation model or score a product's moral worth.

## What we optimise for

We use a **human-owned mission charter** (charter.json). The north stars are reduced avoidable harm, truth and dignity, meaningful community participation, accessible plant-based food and trustworthy operations. Each product has an explicit beneficiary, first-success proxy, real-world outcome and anti-metrics.

Nothing may trade away hard constraints for a composite score. Growth in impressions and comments is not equivalent to improved welfare, adoption or flourishing. All metrics remain hypotheses until observed with an appropriate denominator.

## How a real choice is made

1. Name an important problem for a specific person or group. Register experiment ID, falsifiable question, method, success/failure criterion and uncertainty.
2. Enforce hard **mission vetoes** first. Unconsented data, deceptive claims, privacy exposure, unsafe publication and manipulative engagement cannot be offset by impact predictions. Reject vanity-only objectives.
3. Compare remaining proposals **within a product** on four 1–5, explicitly subjective ordinal assessments: mission importance, learning, tractability and effort. Display the non-dominated/Pareto set, not a pseudo-objective universal moral score.
4. A person chooses across products, challenges assumptions, and records a prior success probability and budget before spending resources.
5. Execute a minimum viable experiment. Keep the original pre-registered goal visible. Assess outcomes with independent people where possible, including those who disagree.
6. Feed outcomes back into research choice process. Track Brier score for **resolved, pre-registered** forecasts, and agreement with blind human pairwise preferences.
7. Then let RSI optimise a chosen implementation. Never auto-deploy on a preference model's score alone.

## What exists, and what does not yet

- Working charter, five product outcome maps, six *illustrative proposals*, hard gates, Pareto selection and regression tests.
- The example portfolio is **not a ranking of real market opportunities**. Scores are hypotheses awaiting human validation; no user-study results were invented.
- The system does **not** automatically retrieve new ideas, contact users, monitor outcomes, create production releases, or change the charter.
- We cannot measure quality of research selection until we record **forecasts before testing, independently review outcomes, and compare against credible alternatives**.
- Cross-product priority remains accountable human judgment, not a hidden “maximise engagement” reward.

## Run

From repository root: node --test rsi/taste/core.test.mjs && node rsi/taste/run.mjs

GitHub Actions writes rsi/taste/out/latest.json as a job artifact; anonymised decision-level records, not raw private comments.

## Practical experiments

| Product | Research question | Short-term | Long-term |
|---|---|---|---|
| Animal Voices | Do independent people prefer a *truthful recommendation*, including no reply? | Verified first-use acceptance and sourced-claim accuracy | Animal-friendly follow-through; no causal claim without study |
| INCA | Can a reviewer verify sources and handoffs on unseen dossiers? | Correct passage and page; error rate | Less staff review time without mistakes |
| RETURN LOOP | Do unseen complaint types get a fair resolution? | Macro-F1, correction time | Fewer repeat complaints |
| Vietkieu Community | Can people join one meaningful event? | Attendance and consented usefulness | Repeat friendships and participation |
| Food Lab | Can we fulfil affordable plant-based orders sustainably? | Fulfilment, allergen safety, margin | Repeat voluntary plant-based meals |

## Validation

**Mechanical tests ≠ research judgment ≠ social impact.** Keep all three separate.

A future experiment will use independent blind reviewers, pairwise proposal preferences and pre-registered real outcomes. Do not turn preference ties, unresolved forecasts or missing outcomes into an invented percentage.

Inspired by Anthropic TASTE (2026), rTaste (Oct 2026) and Ellison Carter's Taste and the End of Scarcity (2026). None of those papers validates these project-specific choices.
