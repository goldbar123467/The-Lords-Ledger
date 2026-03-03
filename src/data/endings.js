/**
 * Endings for The Lord's Ledger
 *
 * Three exports:
 *
 *   victoryTitles       — object mapping conditions to earned titles
 *   failureNarratives   — object mapping meter name to collapse description
 *   victorySummary      — function(meters) → narrative string
 *
 * All text is written at 6th grade reading level with historical grounding.
 * Failure narratives are vivid and second-person to create emotional impact.
 */

// ─────────────────────────────────────────────────────────────────────────────
// VICTORY TITLES
//
// Usage: check conditions after a completed 28-turn run.
// Meters are 0–100. "Balanced" requires all four between 40–60 inclusive.
// If multiple conditions are true, use the one whose meter is highest.
// Balanced overrides all others when the condition is met.
// ─────────────────────────────────────────────────────────────────────────────

export const victoryTitles = {
  /**
   * Awarded when the player's Treasury meter is the highest of all four
   * at the end of 28 turns, and the Balanced condition is not met.
   */
  treasury: {
    title: "The Prosperous",
    subtitle: "Lord of Full Coffers",
    description:
      "Your ledgers never ran dry. While other lords borrowed from merchants " +
      "and prayed for good harvests, you kept your treasury full through sharp " +
      "decisions and careful spending. Generations of stewards will study your " +
      "account books as a model of how to run an estate.",
    historianNote:
      "Some of the wealthiest medieval lords built their fortunes through wool " +
      "and trade rather than warfare. The tiny English town of Lavenham became " +
      "the 14th wealthiest settlement in all of England — entirely from the wool trade.",
  },

  /**
   * Awarded when the player's People meter is the highest of all four
   * at the end of 28 turns, and the Balanced condition is not met.
   */
  people: {
    title: "The Beloved",
    subtitle: "Friend of the Common Folk",
    description:
      "Your people did not just tolerate your rule — they chose it. You listened " +
      "to petitions, kept rents fair, and fed your village through the hard winters. " +
      "When a traveler asked a farmer who ruled this estate, the farmer smiled before " +
      "answering. That smile was your greatest achievement.",
    historianNote:
      "After the Black Death killed nearly half of Europe's people in the 1340s, " +
      "the lords who treated their peasants well found loyal workers while harsher " +
      "lords lost theirs to neighbors who offered better terms. Kindness was often " +
      "the smartest economic choice.",
  },

  /**
   * Awarded when the player's Military meter is the highest of all four
   * at the end of 28 turns, and the Balanced condition is not met.
   */
  military: {
    title: "The Iron Lord",
    subtitle: "Shield of the Estate",
    description:
      "Your castle walls were sound, your soldiers were trained, and raiders " +
      "learned quickly to seek easier targets. Seven years passed without a " +
      "single successful attack on your lands. In a violent age, you made " +
      "safety — and that safety let everything else grow.",
    historianNote:
      "A good castle and trained soldiers protected not just the lord but every " +
      "farmer, merchant, and craftsman within its reach. Medieval peasants often " +
      "sought out strong lords precisely because protection was worth almost " +
      "any price in a world without police or courts.",
  },

  /**
   * Awarded when the player's Faith meter is the highest of all four
   * at the end of 28 turns, and the Balanced condition is not met.
   */
  faith: {
    title: "The Pious",
    subtitle: "Servant of God and People",
    description:
      "The Church spoke well of you, your village priest included you in " +
      "his prayers, and pilgrims who passed through told stories of the " +
      "generous lord to the east. When the bishop made his rounds, your " +
      "chapel was always ready and your face was always genuinely welcome. " +
      "In a world where faith governed everything, your soul was your " +
      "strongest asset.",
    historianNote:
      "The medieval Church was not just a religious institution — it ran " +
      "hospitals, schools, and the only international communication network in " +
      "Europe. A lord with strong Church connections had allies, protection, " +
      "and prestige that money alone could not buy.",
  },

  /**
   * Awarded when ALL four meters are between 40 and 60 inclusive.
   * This overrides the single-highest check.
   */
  balanced: {
    title: "The Balanced",
    subtitle: "Keeper of the Middle Path",
    description:
      "You never chased one goal at the cost of another. Your treasury was " +
      "solid without being miserly. Your people were content without being " +
      "spoiled. Your soldiers were ready without terrorizing anyone. Your " +
      "faith was genuine without being fanatical. This is rarer than it " +
      "sounds — most lords end their reigns having sacrificed everything " +
      "for one thing. You sacrificed nothing essential.",
    historianNote:
      "The most successful medieval lords — like Henry II of England — were " +
      "remembered for managing all the competing demands of their position " +
      "at once: law, trade, military strength, and religious duty. History " +
      "remembers extremes, but stable eras are built by balance.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FAILURE NARRATIVES
//
// Each key is a meter name. Each object describes two failure modes:
//   - "zero"    — the meter hit 0 (total collapse of that resource)
//   - "hundred" — the meter hit 100 (crisis from excess)
//
// Text is second person ("you"), vivid, and historically grounded.
// ─────────────────────────────────────────────────────────────────────────────

export const failureNarratives = {

  treasury: {
    zero: {
      title: "The Empty Coffer",
      headline: "Your treasury ran dry — and so did your reign.",
      narrative:
        "The last coin left your strongbox on a cold Tuesday in February. " +
        "Your soldiers had not been paid in two months and they knew it. " +
        "By Wednesday morning, a third of them were gone — not fled to an " +
        "enemy, just gone, drifting toward lords who could still afford them. " +
        "Your merchants stopped extending credit. Your steward resigned. " +
        "By spring, your neighbors had begun quietly parceling out your " +
        "lands among themselves, and there was nothing left to argue with.",
      historianLesson:
        "The banking families of Florence — the Bardi and the Peruzzi — " +
        "lent the English King Edward III an estimated 1.5 million gold " +
        "florins. When he defaulted on the debt in 1345, one historian wrote " +
        "that it shattered 'the entire financial market of Europe.' " +
        "Even kings could be brought down by empty treasuries.",
      chain: [
        "You spent more than you collected — each season, the gap widened.",
        "Soldiers went unpaid and began to leave.",
        "Merchants stopped selling on credit when they heard the news.",
        "With no coin, no soldiers, and no goods, there was nothing left to rule.",
      ],
    },
    hundred: {
      title: "The Miser's Prison",
      headline: "You hoarded your gold — and lost everything that gold cannot buy.",
      narrative:
        "Your treasury was the fullest in the county, and everyone knew it — " +
        "including the king, who decided you could afford an enormous new tax " +
        "for his latest war. You paid it, but your people had watched you " +
        "count coins while they went hungry for years. When the king's " +
        "collectors arrived, three of your own tenant farmers pointed the " +
        "tax men toward the hidden strongroom. A lord without loyal people " +
        "is just a man in a very expensive house.",
      historianLesson:
        "Medieval kings regularly taxed wealthy lords who appeared to have " +
        "surplus coin — it was one of the main ways they funded wars. " +
        "A lord who was too visibly rich without spending money on his " +
        "people and soldiers was both politically vulnerable and personally " +
        "unpopular. Wealth without generosity was considered a moral failure.",
      chain: [
        "You cut spending wherever possible, year after year.",
        "Your people grew resentful watching money sit while they struggled.",
        "Your soldiers and servants lost respect for a lord who would not invest.",
        "When outside pressure came, no one felt enough loyalty to stand with you.",
      ],
    },
  },

  people: {
    zero: {
      title: "The Empty Village",
      headline: "Your people left — and they took everything with them.",
      narrative:
        "It happened slowly, then all at once. First it was individual families, " +
        "slipping away in the night to a neighboring estate where the lord " +
        "was rumored to be gentler with his rents. Then a whole hamlet left " +
        "after the bad winter — twenty-three people, gone before dawn. " +
        "By midsummer, your fields sat half-worked, your mill ran empty, " +
        "and the village market stalls were bare. An estate without people " +
        "is just land, and land alone feeds no one — including you.",
      historianLesson:
        "After the Black Death killed nearly half of Europe's population in " +
        "the 1340s and 1350s, peasants realized they had real bargaining power. " +
        "Lords who refused to improve conditions found their workers simply " +
        "walking to neighboring estates that offered better terms. This " +
        "migration of workers was one of the main forces that ended serfdom.",
      chain: [
        "You asked too much of your people — in taxes, in labor, or in neglect.",
        "Families began making quiet calculations about other options.",
        "The first few departures showed others that leaving was possible.",
        "An estate with no workers has no harvest, no income, and no future.",
      ],
    },
    hundred: {
      title: "The Spoiled Crowd",
      headline: "You gave your people everything they demanded — and they demanded more.",
      narrative:
        "You were generous — too generous. Every petition was granted, " +
        "every festival funded, every tax reduced at the first complaint. " +
        "Your people loved you, but they had also learned that complaining " +
        "worked. By the sixth year, they expected the impossible: feasts " +
        "every month, no rents, free use of your mill, and your personal " +
        "attention at every dispute. When you finally said no — you had to — " +
        "the shock turned to anger faster than you could have imagined. " +
        "Expectations, once set, are cruel things to disappoint.",
      historianLesson:
        "The Peasants' Revolt of 1381 in England began partly because peasants " +
        "had won many improvements after the Black Death — and then felt those " +
        "improvements were being taken back. Rising expectations can be just as " +
        "dangerous as grinding poverty. The revolt spread across England in " +
        "days and reached London itself before it was put down.",
      chain: [
        "Your generosity was real, but it set expectations you could not always meet.",
        "Each concession made the next demand feel more reasonable.",
        "When resources ran short and you finally said no, it felt like betrayal.",
        "A crowd that believes it has been promised something is very hard to reason with.",
      ],
    },
  },

  military: {
    zero: {
      title: "The Undefended Estate",
      headline: "With no soldiers to defend it, your land belonged to whoever wanted it.",
      narrative:
        "The raiders came in October, when they always come — after the harvest, " +
        "when there is something worth taking. Your castle gate was manned by " +
        "two old men and a teenager who had never held a weapon in anger. " +
        "The raiders did not even need to fight. They walked in, took the " +
        "grain stores, the livestock, and the strongbox, and burned the " +
        "barn as a message. By November, your people had moved to the " +
        "next estate — one with proper soldiers. You followed them shortly after.",
      historianLesson:
        "In medieval Europe, the ability to defend yourself was the foundation " +
        "of everything else. Without soldiers, a lord could not protect his " +
        "people, collect his rents, or keep his neighbors from encroaching. " +
        "The feudal system existed partly because small landowners needed " +
        "the protection of more powerful lords who could afford proper armies.",
      chain: [
        "You reduced military spending to save coin in the short term.",
        "Experienced soldiers left when they found better-paying employers.",
        "Your estate's reputation for weakness spread to those who prey on weakness.",
        "When raiders came, there was nothing and no one to stop them.",
      ],
    },
    hundred: {
      title: "The Iron Fist",
      headline: "Your soldiers were too powerful — and they turned that power against you.",
      narrative:
        "You built the finest army in the county. And then, somewhere along " +
        "the way, your captain decided he did not need you to tell him " +
        "what to do with it. Your soldiers had been given so much authority " +
        "and so many resources that they had become a power in themselves. " +
        "When your captain announced that the estate would be better managed " +
        "under his direct control, your own people did not rise to defend you. " +
        "A lord who rules only through fear cannot inspire loyalty when the " +
        "fear points somewhere else.",
      historianLesson:
        "Powerful nobles who built armies too large for a king's comfort were " +
        "a constant source of instability in the Middle Ages. The 'overmighty " +
        "subject' — a lord with more military power than the king — was one of " +
        "the central problems of medieval government. Wars of the Roses in " +
        "England (1455–1487) were largely caused by noble families whose " +
        "private armies had become impossible for the crown to control.",
      chain: [
        "You invested heavily in soldiers and gave them growing authority.",
        "Military power became the dominant force on the estate, above law and consent.",
        "Your captain and soldiers stopped seeing themselves as servants and started seeing themselves as rulers.",
        "A military coup by your own garrison required no outside enemy at all.",
      ],
    },
  },

  faith: {
    zero: {
      title: "The Excommunicated Lord",
      headline: "The Church turned its back on you — and so did everyone who listened to the Church.",
      narrative:
        "The letter arrived with the bishop's seal and a wax stamp as red as " +
        "blood. You were excommunicated — cut off from the Church, its sacraments, " +
        "and its protection. Your village priest read the notice from the pulpit " +
        "on Sunday, his hands shaking. By Monday, three of your merchants had " +
        "cancelled their agreements: trading with an excommunicated lord, they said, " +
        "was itself a sin. Your soldiers grew nervous. Your people prayed for you — " +
        "but quietly, so no one would see. There is no authority in a medieval " +
        "world that stands if the Church will not stand with it.",
      historianLesson:
        "Excommunication was one of the most powerful weapons in the medieval Church's " +
        "arsenal. When Pope Gregory VII excommunicated King Henry IV of Germany in 1076, " +
        "the king had to stand barefoot in the snow outside the pope's castle for three " +
        "days to beg forgiveness — or lose his throne. Even the most powerful rulers " +
        "in medieval Europe could be brought to their knees by a letter with a bishop's seal.",
      chain: [
        "You repeatedly ignored or worked against the Church's interests.",
        "The local priest and then the bishop registered their disapproval.",
        "Religious authority is social authority — when the Church condemned you, others followed.",
        "Excommunication did not just cut you off from God. It cut you off from everyone who feared God.",
      ],
    },
    hundred: {
      title: "The Fanatic's Fall",
      headline: "Your faith consumed you — and everything around you.",
      narrative:
        "You gave everything to the Church. The tithes, the feast days, the pilgrimages, " +
        "the donations — always more, always more. By the seventh year, your treasury " +
        "was stripped and your people had lost patience with endless feast days that " +
        "interrupted the harvests. When the bishop asked you for yet another donation " +
        "for a new cathedral bell tower, your steward resigned on the spot. Your " +
        "soldiers, whose wages had been 'redirected' to a chapel expansion, mutinied " +
        "that same afternoon. Faith that ignores the needs of the living is not " +
        "piety — it is just another form of neglect.",
      historianLesson:
        "Several medieval kings and lords gave so lavishly to the Church that they " +
        "destabilized their own governments. King Henry III of England spent so much " +
        "on rebuilding Westminster Abbey and on Church donations that his barons " +
        "revolted and stripped him of much of his power in 1258. The lesson was " +
        "painful: even deeply sincere faith had to be balanced against practical " +
        "responsibilities to the people you governed.",
      chain: [
        "Your generosity to the Church began outpacing your practical obligations.",
        "Your people and soldiers tolerated the imbalance at first — then grew resentful.",
        "As practical support for your rule eroded, your Church connections could not replace it.",
        "Faith is a resource like any other. Spend it unwisely and the estate collapses anyway.",
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VICTORY SUMMARY FUNCTION
//
// Takes an object of final meter values: { treasury, people, military, faith }
// Returns a narrative paragraph (string) summarizing the reign.
//
// The function identifies the player's strongest and weakest meters
// and builds a custom narrative from those results.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a narrative summary of the completed reign based on final meter values.
 *
 * @param {{ treasury: number, people: number, military: number, faith: number }} meters
 * @returns {string} A multi-sentence narrative paragraph.
 */
export function victorySummary(meters) {
  const { treasury, people, military, faith } = meters;

  // Find highest and lowest meters
  const entries = [
    { key: "treasury", value: treasury },
    { key: "people",   value: people   },
    { key: "military", value: military },
    { key: "faith",    value: faith    },
  ];

  entries.sort((a, b) => b.value - a.value);
  const highest = entries[0];
  const lowest  = entries[entries.length - 1];

  // Check for balanced ending
  const isBalanced =
    treasury >= 40 && treasury <= 60 &&
    people   >= 40 && people   <= 60 &&
    military >= 40 && military <= 60 &&
    faith    >= 40 && faith    <= 60;

  // Determine overall tone
  const avgScore = (treasury + people + military + faith) / 4;
  let overallTone;
  if (avgScore >= 65)      overallTone = "strong";
  else if (avgScore >= 45) overallTone = "solid";
  else                     overallTone = "difficult";

  // Opening sentence based on overall performance
  const openings = {
    strong:
      "Seven years have passed since you first sat in the lord's chair, " +
      "and the estate stands stronger than it did when you inherited it.",
    solid:
      "Seven years have passed, and your estate has survived — through good " +
      "seasons and hard ones, through difficult choices and painful trade-offs.",
    difficult:
      "Seven years have passed, and you are still here — which, given " +
      "everything, is itself a kind of victory.",
  };

  // Strength sentence
  const strengthLines = {
    treasury:
      `Your treasury finished at ${treasury} — coin that took careful stewardship to accumulate and harder discipline to protect. ` +
      "Your reeve will speak of your accounting for years.",
    people:
      `Your people finished at ${people} — a measure not of popularity, but of trust earned through consistent fairness. ` +
      "In a world where serfs could simply leave, yours mostly stayed.",
    military:
      `Your military strength finished at ${military}, a wall of trained soldiers and sound walls that kept every threat at bay. ` +
      "Neighboring lords chose their disputes carefully around your borders.",
    faith:
      `Your standing with the Church finished at ${faith} — built through real generosity and genuine respect for religious life. ` +
      "The bishop's records speak well of your estate.",
  };

  // Weakness sentence
  const weaknessLines = {
    treasury:
      `Your treasury finished at ${treasury}, thinner than your steward would have liked. ` +
      "Generosity and investment are admirable — but coin keeps soldiers and buys grain in bad years.",
    people:
      `Your people's contentment finished at ${people}. ` +
      "Not every tenant would tell a traveler that you were a good lord — something worth reflecting on.",
    military:
      `Your military strength finished at ${military}, lower than your captain would have preferred. ` +
      "You survived seven years — but not every lord who entered the eighth year made it to the ninth.",
    faith:
      `Your standing with the Church finished at ${faith}. ` +
      "The priest spoke your name in prayers, but with less warmth than you might have wished.",
  };

  // Closing sentence
  const closings = {
    balanced:
      "History does not often remember the balanced lords — it prefers heroes and villains. " +
      "But the people who lived on your estate, who ate its food and worked its fields " +
      "and raised their children within its walls, will remember.",
    strong:
      "The chronicle of your reign is one that your children's children can be proud of. " +
      "Medieval life was hard, short, and often brutal — and you made a small corner of it " +
      "better for the people who lived there.",
    solid:
      "No reign is perfect, and yours was not. But the estate stands, your people mostly " +
      "remember you fairly, and the ledger books close without disaster. " +
      "In a medieval world, that is no small thing.",
    difficult:
      "The years were hard and the decisions were harder. You made mistakes — every lord does. " +
      "What matters is that you are still learning. " +
      "History is full of lords who did not last seven years.",
  };

  // Build the paragraph
  const opening = openings[overallTone];
  const strength = isBalanced ? "" : (strengthLines[highest.key] + " ");
  const weakness = isBalanced
    ? "All four of your estate's systems — treasury, people, military, and faith — " +
      "finished within a healthy range of each other. That balance does not happen by accident. " +
      "It is the result of dozens of small decisions that valued the whole over any single part. "
    : (weaknessLines[lowest.key] + " ");
  const closing = isBalanced ? closings.balanced : closings[overallTone];

  return `${opening} ${strength}${weakness}${closing}`;
}
