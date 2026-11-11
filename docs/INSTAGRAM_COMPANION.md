# Animal Voices – In-Instagram Companion beta 0.2

## Version 0.2 — 11 November 2026

The in-page integration now has four **distinct, locally curated reply variants for each of six supported topics**, in both German and English: **Momo (clear), Kiki (warm), Bao (light), and Curiosity (open question)**. That provides 24 German and 24 English variants, rather than changing emojis around one text. Switching voices keeps the same source capsule, changes the suggested message, and does not run remote AI.

A serious previous UI bug was found and fixed: the popup close handler removed the panel but **left a high-z-index dark backdrop covering the Instagram page**, blocking all further taps. Version 0.2 **does not create a backdrop at all**, and removes any abandoned old backdrop on closing. The sheet is nonmodal so the Instagram page remains visible.

**New handoff:** `Antwort übernehmen ↗` initiates clipboard copy while the user is tapping, removes the panel immediately, triggers the selected Instagram Reply action, waits for a safe and relevant composer, fills it and focuses the input for manual submission. When a safe composer is not identifiable, it uses clipboard copy and a nonblocking confirmation toast. It never clicks Instagram's Post/Submit. `Kopieren` also closes the panel after a successful copy. Candidate selection now excludes sibling-comment textareas to avoid accidental wrong-recipient insertion.

**Demo:** 22 example comments (four static, eighteen generated with `textContent` to avoid injected markup) and fact/ethics/unknown category filters. These are editorial examples and anonymised paraphrases of discussion patterns, **not real Instagram users or direct Instagram comments**. The demo browser test verifies four distinct drafts, source links, popup removal, focus on the correct composer, and unknown-topic abstention.

**Status:** mobile-sized Chromium E2E and GitHub checks passed. Real logged-in instagram.com browser layouts and native iPhone/Android apps still require physical user-side testing; no unverified claims of full compatibility.

---

## What exists, and what does not

**Working in browser on a simulated mobile Instagram-style page, tested with real Chromium.** The userscript `/animal-voices.user.js` is self-contained. It is designed to operate on `instagram.com` **inside the mobile browser** when installed into a userscript-capable browser extension.

It **does not** add UI to the native Instagram iOS/Android application. We cannot promise that an untested version of the native Instagram site will expose the same element selectors as the simulation.

Links:
- [Install on iPhone Safari / Android Firefox](https://animal-voices-os.vercel.app/install.html)
- [Interactive browser test using simulated comments](https://animal-voices-os.vercel.app/instagram-demo.html)
- [Open userscript directly](https://animal-voices-os.vercel.app/animal-voices.user.js)
- [Web/PWA fallback](https://animal-voices-os.vercel.app/phone.html)
- [CI test](https://github.com/mikelninh/animal-voices-os/actions)

## What the user does

1. Open Instagram.com in Safari (with Userscripts) or Firefox Android (with Violentmonkey).
2. For supported DOM layouts, see `✳ Animal Voices` beside a comment's own Reply/Aantworten button. Otherwise tap the floating `✳` launcher and select visible comment text; a banner indicates selection mode.
3. Confirm the extracted comment in the in-page bottom sheet. The algorithm chooses a *local* editorial draft for a limited number of evidence-backed topics, and shows the sources, factual caveat and review date. No external AI runs for each comment.
4. Optionally edit the text. When edited, the verified indicator is removed: **new claims are not prechecked.**
5. Tap `In Antwortfeld einsetzen` to activate Instagram's original Reply button and try to set the correct, visible composer. The user can still edit or decide not to post. **The script does not click Submit/Post.**
6. If Instagram changes the editor such that safe insertion cannot be confirmed, the explicit action falls back to copying while keeping Instagram.com open.

## Prior research, evidence and limits

The source capsules embedded in the userscript were manually matched against authoritative sources on **2026-11-10**. The badge says **pre-checked statement**, not independent study verification of an arbitrary comment.

| Topic | What is supported | Grounded source | Qualification |
| --- | --- | --- | --- |
| Soy & deforestation | Animal feed and oil production account for a large portion of global soy use; a minority goes directly to tofu and similar foods | [Our World in Data](https://ourworldindata.org/land-use-diets) | Historic aggregate ≠ individual supply chain |
| Crop deaths & agriculture | Crop production can harm animals; livestock also uses large areas and feed | [Our World in Data](https://ourworldindata.org/land-use-diets) | Area reduction does not measure crop deaths |
| Protein | Planned variety and sufficient intake of complementary plant protein can meet needs | [DGE FAQ 3.7](https://www.dge.de/gesunde-ernaehrung/faq/faqs-vegane-ernaehrung) | Not individual diet advice |
| B12 | Reliable B12 supplementation is essential for vegan diets; well planned vegan diets can be healthy for healthy adults | [DGE 2024](https://www.dge.de/wissenschaft/stellungnahmen-und-positionspapiere/positionen/neubewertung-der-position-zu-veganer-ernaehrung/) | Vulnerable groups need qualified advice |
| B12 absorption | High single doses have lower percentage uptake | [NIH ODS B12](https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/) | No dosing recommendations |
| Animal sentience | EU law recognises animals as sentient beings | [EUR-Lex Art. 13](https://eur-lex.europa.eu/eli/treaty/tfeu_2016/art_13/oj/deu) | Law does not settle ethics or experiences of all animals |

Unknown, multiple-topic, private-data, minor- or medical-risk comments fail closed with no verified draft. Safety here is rule-based and not a full moderation system.

## Important technical guarantees

- Userscript `@match` only to Instagram browser domains, no broad access.
- No incoming comment or Instagram identity is sent to the Animal Voices server.
- No stored Instagram credentials, no screenshot use, no source-checking network requests each time.
- No `fetch`, `XMLHttpRequest`, social graph mutation, Instagram publishing APIs or simulated Post button clicks.
- Source links open only after a person taps.
- Shadow DOM isolates style from Instagram.
- The in-page panel is removable, has a close control and supports mobile safe-area.
- Replies are inserted only into a likely comment editor tied to the chosen comment; otherwise copy manually.
- Instagram's website is a third-party UI that can change; updates may require adapter changes.

## Verified automated tests

- Pure JS tests cover six source capsules, source allowlist, German + English comments, ambiguous and sensitive comments, and refusal to assume native Instagram app access.
- A headless Chromium end-to-end test loads `instagram-demo.html?selftest=1` at 390 × 844 mobile viewport, observes the injected adjacent button, opens the in-page panel, checks extracted content and source status, **clicks insertion into the matching reply textarea**, checks the generated text and confirms a completely unrelated comment cannot receive a green badge or copy button.
- Existing project safety tests still run in the full Node.js suite on each GitHub commit.

**Not yet verified:** real-world Instagram.com DOM for the user's logged-in account; Safari Userscripts and Firefox Android physical-device behaviour. Testing this requires a person to install the script and visit the actual page. Do not claim that this user-facing step has passed.

## Next release gates

1. On-device smoke test on a genuine public Instagram comment: launcher visible; selected text matches; source capsule is correct; button fills the correct composer or safely falls back to copy; **no auto-post**.
2. On-device Safari and Firefox: Safari prompt/extension permissions, installation and reliable shadow UI.
3. Inspect and patch real Instagram DOM variants if selected content includes a username or multiple comment paragraphs.
4. Collect failures and real device reports **without collecting account names or comment text by default**.
5. Only after these gates, expand sources, intents, coverage and maybe use a private AI service for unknown comments with opt-in and source checking.

We cannot deliver or install an App Store-distributed native iOS extension without its own packaged Xcode app and Apple deployment process. The current independent-browsing script is the fastest technically feasible working pilot.
