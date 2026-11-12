# Animal Voices LIVE v0.6 — Quality and release gates

12 November 2026. Private AI beta, not an autonomous social-media account.

## What has shipped

**Live AI lab:** https://animal-voices-os.vercel.app/live.html

The first-party mobile page offers a fast, locally curated answer (no model request), context-sensitive default voice, three other reply styles, source limitations, and private browser-only quality feedback with export. The user can opt into AI by entering the existing private editor code and checking consent. The code stays in the password field for that session and is not persisted.

**Instagram website companion v0.6:** A new optional AI button calls the Animal Voices backend through supported privileged userscript-manager networking, after explicit consent. It holds the code in tab memory, requests one cleaned comment, then displays model-reviewed replies while preserving the no-autopost, manual-review experience. If privileges or credentials are absent, locally curated suggestions remain available.

**Backend:** api/coach.js uses (1) semantic topic classification, (2) four distinct German/English reply drafts, (3) a separate model critic against curated source-card summaries. Responses are only returned after deterministic checks for language, topic, supported source IDs, unsafe private information, lengths, diversity and critic veto. Sensitive medical and injection-style comments are held before provider calls. Model calls set store:false, and the worker requires an editor code, configured OpenAI key and consent.

**Ethics:** Human dignity first. The moderation engine can advise no response, a boundary, ending a repetitive exchange or reporting a threat; it does not delete, report, block or publish for the user. Editorial ethics are not scientifically verified moral conclusions. A second model pass is NOT independent research verification, and no source is searched live.

## Tests

- Mocked three-call provider contract: German, English, source checks, wrong-language veto, critic veto, unsupported topics, secrets, prompt injection, health-sensitive material, consent and no-cost holds.
- Mobile Chromium Instagram-style DOM: selection, voices, no blackout, manual handoff and optional AI with simulated provider result. It never accesses a real Instagram account.
- Mobile Chromium first-party LIVE page: local recommendation on a new page, plus UI and feedback privacy checks.
- Existing 42 editorial example cases, ragebait corpus and general safety tests run in CI.

## Important limitations

- **Not independently tested with a real OpenAI backend request in production.** The model path is implemented but requires the user's existing live private code to verify end-to-end.
- **Not verified on logged-in Instagram on a physical phone.** This is still a mobile-browser userscript, not an iOS or Android native Instagram integration.
- Editor-code authentication and per-instance rate limits are appropriate only for a private beta. Wider use needs individual user auth, durable quotas and a security review.
- The browser dialog for editor-code entry occurs while on a third-party site; the safer place to enter a secret is the first-party HTTPS Live lab.
- Historical source-card summaries cannot establish the validity of every generated statement. Human review is required before publishing.
- All usage and quality metrics are currently internal/simulated. No independent external preference or behaviour-change evidence exists.

## Next release gates

1. Confirm production hosting configuration and run an authorised real-model request in the first-party LIVE lab.
2. Independently score 100 held-out, anonymised comments (language, appropriateness, source fidelity, respect, abstention).
3. Test iPhone Safari Userscripts and Android Firefox Violentmonkey on an actual Instagram session. Log selector failures without capturing user IDs by default.
4. Invite voluntary reviewers to compare voices blind and export local anonymous ratings. Measure constructive outcomes, not fight length or outrage.
5. Before public beta, implement individual authentication, enforceable distributed quota and privacy/security review.

**Success is a better conversation — not the number of provoked replies.**
