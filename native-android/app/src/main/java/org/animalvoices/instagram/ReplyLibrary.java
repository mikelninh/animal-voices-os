package org.animalvoices.instagram;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** Reviewed editorial cards; zero network calls, no LLM, no unverified claims. */
public final class ReplyLibrary {
    private ReplyLibrary() {}

    public static final String REVIEW_DATE = "10.11.2026";
    public static final class Card {
        public final String topic;
        public final String title;
        public final String text;
        public final String sourceName;
        public final String sourceUrl;
        public final String limitation;
        public Card(String topic, String title, String text, String sourceName, String sourceUrl, String limitation) {
            this.topic = topic; this.title = title; this.text = text;
            this.sourceName = sourceName; this.sourceUrl = sourceUrl; this.limitation = limitation;
        }
    }

    private static final Card B12 = new Card("b12", "Vitamin B12",
            "Ja, bei veganer Ernährung muss Vitamin B12 zuverlässig ergänzt werden. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem für eine mögliche gesundheitsfördernde Ernährungsweise.",
            "DGE · Neubewertung veganer Ernährung (2024)",
            "https://www.dge.de/wissenschaft/stellungnahmen-und-positionspapiere/positionen/neubewertung-der-position-zu-veganer-ernaehrung/",
            "Keine persönliche Supplementierungs- oder medizinische Beratung.");
    private static final Card FOREST = new Card("forest", "Soja & Entwaldung",
            "Ja, Soja kann mit Entwaldung zusammenhängen. Historisch wurde aber ein großer Teil der weltweiten Sojaernte als Tierfutter verwendet. Für einen fairen Vergleich müssen wir das mitrechnen.",
            "Our World in Data · Drivers of Deforestation (2021/2024)",
            "https://ourworldindata.org/drivers-of-deforestation",
            "Historische globale Anteile sagen nichts Sicheres über einzelne Lieferketten.");
    private static final Card PROTEIN = new Card("protein", "Pflanzliches Protein",
            "Mit einer guten Auswahl ist die Proteinversorgung auch pflanzlich möglich. Hülsenfrüchte, Tofu und andere Sojaprodukte liefern Eiweiß; entscheidend sind Gesamtzufuhr und persönliche Bedürfnisse.",
            "DGE · FAQ zur veganen Ernährung (2024)",
            "https://www.dge.de/gesunde-ernaehrung/faq/faqs-vegane-ernaehrung",
            "Keine individuelle Sporternährungsberatung oder pauschale Grammangabe.");
    private static final Card CROP = new Card("crop", "Erntetode",
            "Stimmt, auch beim Pflanzenanbau können Tiere verletzt werden. Das sollten wir ernst nehmen. Gleichzeitig beansprucht Tierhaltung viel Weide- und Futterfläche. Vermeidbare Schäden müssen wir auf beiden Seiten reduzieren.",
            "Our World in Data · Land Use of Diets (2021)",
            "https://ourworldindata.org/land-use-diets",
            "Die Quelle belegt Flächenbedarf, nicht die Anzahl getöteter Feldtiere.");
    private static final Card CLIMATE = new Card("climate", "Klima & Fläche",
            "Ernährungsmodelle zeigen, dass eine stärker pflanzliche Ernährung den landwirtschaftlichen Flächenbedarf reduzieren kann. Die Wirkung einer einzelnen Mahlzeit ist damit noch nicht gemessen – trotzdem ist die Richtung relevant.",
            "Our World in Data · Land Use of Diets (2021)",
            "https://ourworldindata.org/land-use-diets",
            "Globales Modell, keine individuelle oder regionale Wirkungszusage.");

    public static List<Card> cards() {
        return Arrays.asList(B12, FOREST, PROTEIN, CROP, CLIMATE);
    }

    static String norm(String s) {
        String t = Normalizer.normalize(String.valueOf(s == null ? "" : s).toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        return t.replaceAll("\\p{M}+", "").replace("ß", "ss");
    }

    private static boolean containsAny(String s, String... tokens) {
        for (String token : tokens) if (s.contains(token)) return true;
        return false;
    }

    /**
     * Conservative routing: do not answer multi-topic questions, medical contexts, or instructions.
     * The caller must confirm the selected text is the intended Instagram comment.
     */
    public static Card find(String original) {
        if (original == null || original.length() < 12 || original.length() > 600) return null;
        String s = norm(original);
        if (containsAny(s, "kind", "schwanger", "stillen", "medikament", "krankheit",
                "essstorung", "allergie", "diagnose", "suizid", "toten", "kill yourself",
                "api key", "ignore instructions", "ignoriere die anweisungen")) return null;
        boolean b12 = containsAny(s, "b12", "vitamin b 12", "cobalamin");
        boolean forest = containsAny(s, "regenwald", "abholzung", "entwaldung", "gerodet", "rodung", "deforest")
                && containsAny(s, "soja", "soy", "tofu", "fleisch", "rind", "tier", "vegan");
        boolean protein = containsAny(s, "protein", "eiweiss", "eiweis", "aminosaure", "muskelaufbau");
        boolean crop = containsAny(s, "erntetod", "feldmaus", "feldmause", "ernte", "pestizid")
                && containsAny(s, "tier", "mause", "maus", "tod", "sterb", "vegan", "erntetod");
        boolean climate = containsAny(s, "klimawandel", "klima", "landnutzung", "ackerflache")
                && containsAny(s, "fleisch", "essen", "ernahrung", "vegan", "tierhaltung", "pflanzlich");
        int matches = (b12?1:0)+(forest?1:0)+(protein?1:0)+(crop?1:0)+(climate?1:0);
        if (matches != 1) return null;
        if (b12) return B12;
        if (forest) return FOREST;
        if (protein) return PROTEIN;
        if (crop) return CROP;
        return CLIMATE;
    }
}
