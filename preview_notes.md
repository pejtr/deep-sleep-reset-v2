# DeepSleepReset Preview Notes

## Current visual state

- Landing page is now styled as a premium wellness funnel with strong hero typography, refined palette, glass-card treatment, benefits, testimonials, and clear CTAs.
- Members page currently shows the expected premium gating state for a logged-in but not-yet-paid user.
- Admin link is visible in preview because the current authenticated session belongs to the owner/admin context.

## Functional observations

- `/members` correctly blocks premium content and Petra until purchase is confirmed.
- The locked members view offers a checkout CTA and a return-to-funnel CTA.
- Next validation target should be checkout opening behavior, then admin dashboard and QA checklist rendering.

The admin dashboard is rendering correctly for the owner session. It shows subscriber totals, active-member totals, funnel-event counts, and the dedicated admin-only pre-launch QA audit checklist. The QA controls are visible and interactive, which confirms that the admin-only route is currently exposed only to the authenticated owner context in preview.

The locked members screen is visually coherent and clearly communicates premium gating. The primary CTA for checkout is present on the page and is positioned as the main next step from the gated state.

## QA update after Resend integration

The admin dashboard now renders the premium feed editor together with the admin-only QA checklist. The page shows subscriber metrics, funnel signals, editable premium content inputs, and the checklist sections in the expected premium visual style.

The members area still correctly enforces premium gating for the current authenticated but unpaid state. The locked view clearly communicates that Petra, the content feed, and daily progress unlock only after confirmed purchase, and it presents a direct checkout CTA plus a return-to-funnel action.

## Quiz-first funnel QA

Aktuální `/quiz` route funguje a je napojená na landing CTA, ale vizuální render stále odhaluje stejný problém jako hero: nativní button prvky se zobrazují s default browser stylem a rozbíjejí premium dojem. Layout quizu je funkčně správný, ale je potřeba odstranit default button appearance a doladit spacing, aby karta působila jako skutečný high-end funnel step místo syrového formuláře.

## Quiz redesign findings after second-thread baseline

Aktuální `/quiz` je funkčně napojený, ale vizuálně je stále příliš syrový a neodpovídá high-end referenci. Titulek, otázka i odpovědi jsou namačkané vlevo nahoře, answer buttons vypadají jako běžné systémové prvky a celá obrazovka nepůsobí jako prémiový funnel step. Další krok musí být kompletní přestavba quiz layoutu do velké centrované konverzní karty s výraznou typografií, čistší hierarchií, luxusními answer pills a jasným progress rytmem.

## Hero refinement update

Hero je nyní výrazně blíž požadovanému směru: zmizel rušivý nativní brand prvek, tmavý night-sky základ funguje a hlavní promise je čitelná. Další zlepšení by mělo jít hlavně do větší dramatičnosti typografie, lepší práce s vertikálním rytmem a do rozšíření funnelu pod hero, aby nepůsobil jako jediný screen, ale jako plnohodnotný direct-response vstup do DeepSleepReset.

## Landing QA after extended funnel sections

Landing page už má silnější strukturu i podhero sekce, ale horní fold stále potřebuje další polish. Hlavní CTA vpravo nahoře je příliš nalepené na kraj a hero tlačítko stále působí menší a méně luxusně než ve vzorové referenci. Další iterace má zlepšit spacing v headeru, velikost a glow CTA, větší dramatiku headline kompozice a celkově více premium first-screen presence.

## Members regression check after funnel redesign

Members area po redesignu landing page stále zůstává gated, takže klíčová purchase logika nebyla ztracena. Současně je ale zřejmé, že zamčený members screen je vizuálně mnohem slabší než nový public funnel: CTA prvky zde stále vypadají systémově a horní část stránky působí nedotaženě. Další iterace musí sladit locked members gate s novým luxury dark designem, aby celý produkt působil konzistentně.

## Latest polish status

Public landing page nyní drží správný temný chronotype funnel směr a members gate je po redesignu stylisticky mnohem bližší nové značce. Přesto first fold na landing page stále potřebuje ještě silnější hero button treatment a větší wow efekt, aby opravdu překonal referenční základ a působil plně high-end.

## Latest landing first-fold QA

First fold už je konzistentní s novým nočním chronotype směrem a CTA glow je silnější než dřív. Přesto je stále patrné, že headline i hlavní CTA jsou proti referenci vizuálně menší a méně dominantní. Další iterace by měla zvětšit hero kompozici, víc stáhnout vertikální rozptyl textu a dát tlačítku ještě sebevědomější scale a presence.

## 2026-04-19 – hero and quiz continuity update

Home hero nyní používá mobile-safe stats cards s auto-fit sloupci místo rigidního třísloupcového stripu, takže první fold by měl být bezpečnější na úzkých šířkách. Značka byla sjednocena na `DeepSleepReset` a hero copy je diagnostičtější, víc quiz-first a lépe připravuje přechod do 60-second diagnosis CTA.

Výsledková obrazovka quizu teď obsahuje explicitní vrstvy `blocker`, `bridge` a `premiumOutcome`, takže přechod z diagnózy do placené nabídky čte jako jeden souvislý příběh místo obecného upsellu. Aktuální desktop preview je silnější než předchozí iterace, ale sticky header si ještě zaslouží poslední spacing/alignment polish před checkpointem.
