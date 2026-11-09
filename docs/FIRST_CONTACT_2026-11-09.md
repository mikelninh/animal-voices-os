# Animal Voices — First Contact pilot, 9 November 2026

## Executive result
**We did the initial work, not a simulated survey.** We sourced 10 distinct public Reddit discussions, made anonymised German **paraphrases** (English source posts were translated), authored 2 contrasting replies per case, compiled source and caution notes, and deployed a mobile-friendly opt-in blind test at [First Contact](https://animal-voices-os.vercel.app/field-test.html).

- **10** unique source discussion threads; selected purposively, **not randomly sampled** or representative
- **20** distinct editorial candidates, roughly **20–28 words each**
- **7/10** manually intended topics matched by the existing local classifier after a targeted forest-keyword repair; that is an in-sample routing check, **not model accuracy**
- **6/10** cases have a source-linked topic and can receive the existing *generic* daily response
- **4/10** are deliberately held: **F02** (insect suffering), **F08** (cost with no curated source card), **F09** (painless killing is ethical, not a basic animal-pain fact), **F10** (positive curiosity about products is not in the current classifier)
- **0** externally recruited or verified human preference votes, **0** demonstrated behavioural changes, **0** independently measured reductions in animal suffering
- Only the new **field-test.html** page contains specially tailored A/B replies for all 10 cases. The existing **daily.html** does **not** yet reliably answer every case and should not be advertised as doing so.

### Immediate strategic discovery
Our main bottleneck is **question fit and topic coverage**, not wordsmithing. Many real questions cannot safely be answered by a general fact card alone.

## Editorial review (not blind votes)

| ID | Intent and source | Two response goals | Current daily route | Reviewer concern / next decision |
|---|---|---|---|---|
| F01 | [Crop-death moral consistency](https://www.reddit.com/r/DebateAVegan/comments/1jrx2ck/crop_deaths_conflicting_arguments_by_vegans/) | Connection vs clarification | Reply | Never imply precise comparisons of animal deaths; discuss intentionality and avoidable harm without false precision |
| F02 | [Insect suffering and moral overwhelm](https://www.reddit.com/r/DebateAVegan/comments/1log438/implications_of_insect_suffering/) | Connection vs inquiry | Hold | Avoid claiming insects categorically do or do not feel pain; separate ethics and uncertain evidence |
| F03 | [Vegan athlete needing protein](https://www.reddit.com/r/veganfitness/comments/1rtlvxu/vegan_gym_goers_how_do_you_get_in_protein/) | Clarification vs practical step | Reply | Good practical relevance; no personal gram targets without context |
| F04 | [Protein digestibility and essential amino acids](https://www.reddit.com/r/veganfitness/comments/1q0tw72/protein/) | Clarification vs connection | Reply | Distinguish foods, amino-acid quality and overall dietary adequacy; avoid claiming that all protein sources are identical |
| F05 | [B12 supplement labels and high doses](https://www.reddit.com/r/VeganDE/comments/1l72xuu/nahrungserg%C3%A4nzung_b12_%C3%BCberdosierung/) | Clarification vs connection | Reply | Source-checked general absorption explanation, **not** individual supplementation advice; see NIH and DGE |
| F06 | [Soy, cattle and deforestation](https://www.reddit.com/r/VeganDE/comments/1jjmp5n) | Clarification vs inquiry | Reply after keyword fix | Historic global soy feed share is not proof about a specific producer; see OWID |
| F07 | [Plant-milk taste barrier](https://www.reddit.com/r/VeganDE/comments/1hxghoh) | Connection vs practical step | Reply | Respect taste; don't demand perfect abstention to acknowledge progress |
| F08 | [Real price/time-access barriers](https://www.reddit.com/r/VeganDE/comments/1p8z0s1/kollege_meint_vegan_ist_doch_viel_zu_teuer_kanns/) | Connection vs practical step | Hold | No price source. Do not invalidate time, income, disability, location or access barriers |
| F09 | [Ethics of painless killing](https://www.reddit.com/r/DebateAVegan/comments/1ll65f1/many_vegans_say_its_okay_to_eat_plants_but_not/) | Clarification vs inquiry | Hold | Normative claim isn't established by an animal-sentience source; label as ethics, not science |
| F10 | [Non-vegan curiosity about substitutes](https://www.reddit.com/r/VeganDE/comments/1qeetmd/gute_vegane_ersatzprodukte/) | Practical step vs inquiry | Hold | Positive opening not detected; consumer-product recommendations require current local data |

## Independent source checks used for candidate review
- [NIH Office of Dietary Supplements — B12](https://ods.od.nih.gov/factsheets/Vitaminb12-HealthProfessional/): absorption fraction falls as single supplement dose increases, so label amounts cannot be interpreted as fully absorbed.
- [DGE — B12 FAQ](https://www.dge.de/gesunde-ernaehrung/faq/vitamin-b12/): vegan diets require reliable B12 supplementation; individual concerns need qualified healthcare support.
- [Our World in Data — soy and deforestation](https://ourworldindata.org/drivers-of-deforestation): historic feed usage contextualises soy questions, but does not establish individual supply chains.
- [Our World in Data — land use](https://ourworldindata.org/land-use-diets): global modelling suggests plant-based diets reduce cropland/grazing pressure; it doesn't measure field deaths for a particular meal.
- [Protein quality review (2025)](https://pubmed.ncbi.nlm.nih.gov/39661760/): potential difficulties involving indispensable amino acids and digestibility deserve nuance.
- [Athletic performance review (2025)](https://pubmed.ncbi.nlm.nih.gov/41200120/): appropriate total protein and planning can support athletic performance.

## What has and has not been tested

**Completed**
1. Sourced real public conversation contexts, noted publication date, original thread, and traceable audit URL. Paraphrases remove handles and identifying details.
2. Created A and B replies that deliberately differ in conversation objective rather than swapping adjectives or emoji.
3. Built blind A/B review with random side assignment, **neither** vote, optional user perspective, reason, possible-facts-issue flag, no account or third-party analytics, local JSON export and a copyable invitation.
4. Added regression tests for dataset size, unique source links, concise candidates, no secret credentials, privacy and abstention logic. GitHub Actions runs on each commit.

**Not completed**
- We have not asked real independent participants to evaluate the app. Therefore it has no verified human preference winner.
- We have not independently certified every scientific or ethical claim by external experts. The sources above support narrower facts but cannot certify all normative wording.
- There is no central server collecting participants' votes: they must voluntarily export files and return them. We have not sent invitations or posted on behalf of the user.

## Next decisions
1. Run **5–10 genuinely voluntary readers** with different dietary perspectives; send them [the live pilot](https://animal-voices-os.vercel.app/field-test.html), ask them to complete and share their own JSON export.
2. Independently evaluate whether any answer is manipulative, unhelpful, inaccurate or ethically inappropriate; discard those **regardless of votes**.
3. Fix the uncovered daily-app classes: insect welfare uncertainty, economic accessibility without simplistic costs, ethical reasoning about killing, and positive curiosity/product recommendations.
4. Iterate with 30 public discussion contexts in a second tranche only after checking what the first round actually reveals.

**Decision principle:** good conversations are a means, not an impact metric. Later impact claims need opt-in follow-up and independently verifiable animal-product purchasing reductions, not merely likes, apparent agreement or raw comment counts.
