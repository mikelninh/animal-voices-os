# Animal Voices — simulated reader panel, 2026-11-08

> **IMPORTANT: HYPOTHETICAL EXERCISE, NOT A USER STUDY.** No participants were recruited or observed, no real ratings collected, and the votes below are **illustrative editorial assumptions**, not predictions with measured confidence. Do not report them as product metrics, efficacy or sales evidence.

## What was actually verified in code
- 12 editorial topics × 3 persona voices = 36 old/new comparison pairs.
- Repository source contains **0 identical pairs** (checked by executing the current `triage.js` against `data.js`).
- Historic issue: offline PWA cache could serve obsolete `triage.js`, producing identical options in the real web UI.
- Fixed by versioned scripts, network-first JS/CSS fetch with offline fallback, an explicit identical-text guard, and a regression test. The fix was deployed to Vercel; the real Android test is still outstanding.
- These facts do not validate the scientific accuracy of the answers or actual readership outcomes.

## Hypothetical roleplay: 8 viewpoints × 4 comment topics = 32 judgments

Topics: Strength, B12, Crop deaths, Taste. Each viewpoint compares the **old vs the new** response in the most relevant character voice.  
`N` = would post **new**; `O` = would post **old**; `–` = would post **neither**.

| Simulated reader archetype | Strength | B12 | Crop deaths | Taste | Illustrative feedback |
|---|:---:|:---:|:---:|:---:|---|
| Curious flexitarian | N | N | – | N | More personal and practical; field deaths reply still feels unresolved |
| Defensive meat eater | O | N | O | – | 'Klischee' and ethical pressure can feel accusatory; don't assume I want to convert |
| Evidence-focused dietitian | O | N | O | – | The old answer mentions the meta-analysis; new strength answer relies on one small study |
| Vegan advocate | N | N | N | N | Emotion and individuality much stronger, but don't overclaim |
| Humour-seeking Gen Z user | N | N | N | N | Bao is shareable; jokes about sensitive topics can misfire |
| NGO community moderator | N | O | N | – | New version invites conversation; some replies remain too long for actual comment threads |
| Non-vegan gym regular | N | – | O | – | Give me concrete training evidence and don't moralise a workout question |
| Practical, budget-constrained learner | – | – | O | N | Likes the food challenge, but wants actual affordable action rather than general persuasion |

**Illustrative tally:** 17 N / 7 O / 8 neither. **New among decisive hypothetical votes:** 17/24 = 71%; **neither:** 8/32 = 25%.  
**Do not treat these as measured preference, conversion or user satisfaction.** A different, equally plausible editorial panel could produce another outcome.

## Qualitative findings that are useful regardless of the exact hypothetical vote count

1. **Clearer doesn't necessarily mean more convincing.** A reader who trusts evidence may prefer the older strength answer because it cites a meta-analysis instead of relying mostly on one small RCT. Neither is a substitute for independently verifying claims against the papers.
2. **Tone needs context.** Humour can work for Bao when someone invites play; for defensive or medically concerned readers the same phrasing may feel flippant.
3. **Avoid implicit moral judgments.** A non-vegan who shares concerns about children, price or taste needs to be heard, not immediately recruited.
4. **Crop deaths is a difficult argument.** Respect the genuine concern for affected animals; be exact about uncertainty. Don't substitute 'vegan = zero animal harm'.
5. **One question, one contribution.** Replies that add one grounded fact or one constructive question often feel more natural than trying to settle a whole ethical argument in one comment.
6. **Scientific gate is independent of preference.** An accurate but unappealing reply can be improved. An attractive but inaccurate reply must not ship.

## Product actions derived from this stress test

**P0 — Trust:** Independently review the highest-traffic source excerpts and claims with human evidence reviewers. Flag claims that extrapolate 'no significant difference' into 'proven equivalent'. Attach dated evidence provenance.

**P0 — No fake A/B:** Keep the duplicate guard; do not accept or record identical A/B texts. Force a version refresh of the response library.

**P1 — Real context:** Ask only one short clarifying question if it materially changes the answer (factual question vs joke vs personal experience). Default to a respectful, direct reply; no forced humor.

**P1 — Audience fit:** Compare content in blind human studies for comprehension, tone, willingness to post and perceived respect, separately from scientific accuracy. Include genuinely sceptical/non-vegan raters.

**P1 — Shortness:** Write comment-length defaults of 1–3 sentences, with an optional expandable source card and longer explanation. Measure median seconds to approval and the number of edits.

**P2 — Evaluation design:** Collect 100 anonymized real comments and recruit 10–20 humans; independently annotate ground truth context + research, randomize draft order, double-review difficult facts, report 'neither' and disagreements. Do not infer downstream animal impact.

## Real acceptance decision
Before v1.0:
- 0 fabricated or misattributed sources in the reviewed public release set.
- Two independent reviewers agree on scientific support for prioritized claims.
- Blind preference for the new approach is observed, with 'neither' reported.
- At least one genuine follow-up behavior is measured separately from clicks/likes, with consent.
- Hardware Android Share Target is explicitly tested.
