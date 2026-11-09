# Animal Voices v1.3 — Goal-first conversation strategy

## North Star
Help someone feel genuinely heard, understand a relevant fact, stay curious, or find a voluntary next step. In the long term, support measurable reductions in avoidable animal suffering. An individual reply is **not** itself evidence of changed behaviour or animals saved.

## Four editorial hypotheses
1. **Connect / Verbindung:** Explicitly acknowledge the legitimate concern and find common ground. Hypothesis: less defensive reaction, more willingness to read.
2. **Clarify / Verstehen:** Answer the actual question early with one sourced, qualified point. Hypothesis: better factual understanding.
3. **Explore / Neugier:** Ask a truly open question without leading or baiting. Hypothesis: more genuine continuation when a conversation is appropriate.
4. **Act / Möglichkeit:** Offer a small, optional next step, not guilt or pressure. Hypothesis: more voluntary exploration or food trials.

**Not personas:** Momo, Kiki and Bao are optional expressive touches in the Studio and a collapsed panel in the daily app; they are not the strategic decision axis. The user can override the suggested goal.

## Shipped experiment
- `daily.html`: one prompt → one goal recommendation → switch among four prepared texts, with one source-review gate before copy. Optional private AI is instructed to pursue the selected goal. No automatic posting.
- `strategy-lab.html`: 20 **synthetic** comments × a balanced set of editorial goal pairings, blind A/B side shuffling. Voting allows A, B, or neither and a separate critical-facts flag. Strategies are disclosed only after the choice.
- Feedback stays in local browser storage (goal, topic, outcome, no comment/handle). Exported JSON can be shared voluntarily. No central analytics or fake test participants.
- `upgrade.html`: previous AI-vs-editorial answer quality lab remains separate; it is not an evaluation of four goals.
- Safety: unsupported cases abstain; model access needs private editor code, explicit opt-in, and human source verification; model critic reads source capsules, not live studies.

## Before making a claim about the best strategy

### Stage 0 — Editorial desk review
Run all 20 synthetic prompts through the four options. Check question-fit, length, loaded language, factual scope and internal consistency. Distinctness is not evidence of efficacy.

### Stage 1 — 30 real comments (with privacy)
Find 30 genuinely occurring **public** comments across genuine question, skeptical objection, values and practical barriers; remove handles/identifiers before analysis, retain consent/permission as appropriate and avoid importing private messages. Obtain two factual/source reviewers for claim-heavy cases. Avoid personal medical advice and minors' nutrition issues.

### Stage 2 — Blinded reader test
Recruit an initial 10–20 voluntary readers with varied dietary views. Randomise A/B and avoid advertising which strategy wrote which before voting. Each rater can pick A, B, or neither and report: feels respected, addresses concern, clarity, seems moralising, continuation interest, serious factual error. Treat correlated votes by rater and topic separately. Do not imply an anonymous link will automatically aggregate responses: respondents must share their own local exports.

### Stage 3 — Real-world validation (only if appropriate)
For consenting uses, compare meaningful dialogue follow-ups to no-response or existing baseline, and look at opt-in self-reports of voluntary experiments. Avoid coercive persuasion and posting automation. Separately evaluate any verified food-service purchasing data against baselines/control for the longer-term animal welfare mission.

## Decision rules
- **Never** promote a strategy with unresolved serious factual, ethical or privacy concerns, however popular.
- Optimise for respectful, relevant conversation, not outrage, conversion claims or raw comment counts.
- Report raw N, abstentions, disagreement, attrition and per-topic breakdown; don't treat a small volunteer set as representative.
- The current data include **zero** independently verified persuasion outcomes and **zero** measured reductions in animal suffering.
- If feedback conflicts with real outcomes, prioritise verified effects and avoid claiming causality.

## Open questions for real reviewers
- Does the answer sound like a human listening, or like a prepared script?
- Is a direct answer needed **before** an exploratory question?
- Is 20–35 words a useful default in this specific setting, rather than a hard rule?
- For skeptics, does acknowledging uncertainty build trust or look evasive?
- Which claims need fuller sources or qualified experts before any outward use?
