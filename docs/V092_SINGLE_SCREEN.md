# Animal Voices v0.9.2 — One-Screen Companion

**Product promise:** Paste a comment → receive the right next-action suggestion and, when evidence supports it, an editable short answer immediately → inspect the actual source → sign off and copy.

## Why the workflow changed

The older workflow had three formal steps, four equally prominent action choices, an entire evidence card before the answer, two buttons for approval then copy, and an initials field for every case. That was excessive for a moment between Instagram comments.

## What is implemented

1. One input, one primary CTA: **Antwort finden**. Example chips submit automatically.
2. Supported, non-sensitive claims trigger a draft without another button. **Melden / Ignorieren / Merken** remain secondary choices.
3. Claims' original sources (direct links) and limitations are visible alongside the draft. Longer scientific explanations can be expanded. Quotes in the library have not been live-verified.
4. Personal source checking + confirmation and human review are **still required** before copy. The approved action now also copies, leaving a retry button if clipboard access is blocked.
5. Optional context, post URL, privacy and optional AI worker appear only on demand. Reviewer initials are kept locally in that browser.
6. Consistent mobile layout puts the primary action on the first screen at phone widths; characters remain visible without displacing the tool.

## Safety and privacy

The decision engine is an editorial heuristic, **not a trained live AI classifier**. It can abstain, but cannot know the true context of third-party Instagram users. Do not paste personal data. Original source opening is a UI interaction, **not proof that the source was read**; human verification is an explicit professional responsibility. No auto-posting. No causal impact claims.

## Tests (2026-11-08)

- `npm test`: 43/43 offline source, security and content contract tests passed.
- Chromium Playwright manual acceptance flows at 360, 390, 768 and 1440px; each checks no overflow/JS exception, inline error recovery, one-tap example → immediate answer → source link → manual review → approve+copy, approval reset after edit, privacy-safe and sensitive holds.
- Browser environment restricts external URLs, so real article navigation and native Android Instagram → Share sheet **remain unverified**. Source links were checked in DOM and click events were simulated for acceptance; no scientific audit of full-text studies.

## Next

Real Android hardware verification, ten user interviews comparing task completion time versus v0.9, source-level external expert review, optional authenticated server-based evidence verifier. The optional AI worker remains **off without credentials**.
