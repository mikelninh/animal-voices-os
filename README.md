# Animal Voices v0.7 — Good conversations, good evidence

[**Live app**](https://animal-voices-os.vercel.app/) · *For animals. With humans.*

A welcoming, high-fidelity editorial workspace for writing informed and empathetic replies to comments about animals and veganism, without blaming people.

## What's new in 0.7

- **One clear first action:** paste a comment, or choose a ready example. No dashboard clutter.
- **Three transparent steps:** understand the comment → inspect the sources and draft → personally approve and copy with citations.
- **Kiki redesigned as an unmistakable chicken:** visible red comb and wattles, defined golden beak, wings, tail and feet.
- **Original responsive interface:** clear typography, soft gradients, elegant cards, generous whitespace, thoughtful micro-interactions.
- **Gentle defaults:** no claims without sources, no reposting automatically, sensitive questions and possible quotations held for human review.
- **Secondary workspaces:** searchable evidence library; social content drafts (Reel, carousel, Story); local and honest measurement.

## Run locally

Requires Node.js 22 (no dependencies):

```bash
npm start
# Open http://localhost:5173
npm test
```

## Reality check

- **Not yet live-LLM-agentic**: topic matching and writing are based on curated knowledge, rather than an active language-model agent swarm.
- **Not scientifically certified**: source links are curated, not independently peer-reviewed, and must be checked before using them publicly.
- **No Instagram/X API or auto-posting**. Only an editor can choose to copy approved drafts.
- Browser-local records are not synced; **0 external-impact claims** until evidence is independently verified.
- Scientific URLs are provided to readers as direct source links. Factual assertions must be checked against full original context.

## Next steps

1. Validate quoted source text and scientific claims against the originals; add expert reviewer process.
2. Build authenticated backend with stored, dated evidence extracts, multi-model criticism and provider-independent tool interfaces.
3. Authorised Instagram Professional own-comment ingestion, with the human approval gate always on.
4. Real external user studies and voluntary dialogue-quality measurement.

## Security

User comments are untrusted text. The interface escapes user-visible content and does not transmit comments to a server or LLM. Approval is invalidated when a response is edited or a persona is changed. Records are saved locally in the browser and can be cleared.
