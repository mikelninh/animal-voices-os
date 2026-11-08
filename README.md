# Animal Voices Studio 🌱

**For animals. With humans.**

A calm, humane, evidence-led workspace for animal advocacy. We are for animals, not against people: factual claims deserve sources and limits; value questions deserve empathy and inspiring dialogue.

**Live:** https://animal-voices-os.vercel.app/

## v0.6 — High-fidelity editorial workspace

- **Overview:** mission, original character art, honest local statistics and quick access.
- **Dialogue studio:** input a comment, identify its context, match against a curated claim, inspect sources and caveats, select Momo / Kiki / Bao, edit a reply, approve personally, copy with citations.
- **Evidence library:** twelve curated subjects, eleven direct scientific/institutional source links, studies' caveats, keyword search and topic filters.
- **Content studio:** source-linked Reel, carousel and Story drafts with selectable tone and mascot voice; no fabricated experimental results.
- **Impact & learning:** private local records, approval count, exportable JSON, zero automatically posted items and zero externally verified real-world impact.
- **Design:** responsive warm minimalism, original geometric mascot illustrations, accessible navigation and reduced-motion support.

### Local development

Requires Node.js 22+, no NPM packages or API keys.

```bash
npm start
# Open http://localhost:5173
npm test
```

Or deploy this static repository using Vercel, Netlify or GitHub Pages with the repo root as the public folder.

### Scientific and safety rules

1. All factual source links are editorial references. Their quotes and content require verification against the original before publishing; no live literature search or external peer review is claimed.
2. Quoted claims, medical-sensitive statements, ambiguous topics and prompt injections are held for a human rather than answered automatically.
3. Freeform user input is treated as untrusted text. The provided response templates are tied to specific curated evidence records; manual review remains mandatory.
4. Each published response should cite the corresponding original source and include material limitations.
5. No Instagram/X connection, web scraping, bulk responding, shadow account automation or autonomous social posting.
6. Browser-local records are not synced across devices. The app is a demonstrator, **not** production multi-user infrastructure.
7. API-based LLM workers are intentionally excluded from this frontend release. Future provider connections must run server-side with authentication, rate limiting, structured provenance and human sign-off.

### Files

- `index.html`: five-workspace application shell
- `styles.css`: responsive design system
- `app.js`: client-side editorial workflow and interaction
- `data.js`: annotated claim and source registry
- `characters/`: original lightweight illustrations
- `tests/editorial.test.mjs`: validation of editorial content and UI contracts
- `.github/workflows/ci.yml`: GitHub Actions checks

### Roadmap

**Next:** blind user tests with real commenters and expert source review; connect an Instagram Professional account via authorised Meta APIs to review **our own** comments; server-side evidence retrieval and traceable multi-model critiques; authenticated review queue; explicit consent and privacy controls.

Our stretch goal of reducing animal-product purchasing in foodservice by 2030 is *separate* from content metrics. We never equate reach or replies with animals saved.

*Open hearts. Protect animals. Keep the facts honest.*
