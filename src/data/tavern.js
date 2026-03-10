/**
 * tavern.js
 *
 * Content data for the Boar's Head Tavern:
 * flavor texts, Knight's Gambit config, Bard tales, riddles, stranger encounters.
 */

// ---------------------------------------------------------------------------
// Tavern flavor subtitles — one shown randomly per visit
// ---------------------------------------------------------------------------

export const TAVERN_SUBTITLES = [
  "The fire crackles. Ale flows. Secrets are cheap.",
  "A place for honest men and liars alike.",
  "Every coin wagered here was earned in sweat.",
  "The barkeep watches. He always watches.",
  "You smell woodsmoke, mutton, and ambition.",
  "The bard tunes his lute. The dice are warm.",
  "A stranger in the corner raises his cup to you.",
  "The floorboards creak with the weight of history.",
];

// ---------------------------------------------------------------------------
// Knight's Gambit — medieval rock-paper-scissors
// ---------------------------------------------------------------------------

export const GAMBIT_WEAPONS = {
  sword:  { name: "Sword",  symbol: "\u2694", beats: "arrow",  reason: "The blade cuts the bowstring" },
  shield: { name: "Shield", symbol: "\u26E8", beats: "sword",  reason: "The shield turns the blade" },
  arrow:  { name: "Arrow",  symbol: "\u27B6", beats: "shield", reason: "The arrow finds the gap in the shield" },
};

export const GAMBIT_WAGERS = [10, 25, 50, 100];
export const GAMBIT_MAX_ROUNDS = 5;

export const GAMBIT_WIN_LINES = [
  "Your blade strikes true!",
  "The stranger grunts and slides coins across the table.",
  "A fine strike, my lord.",
];

export const GAMBIT_LOSE_LINES = [
  "Too slow!",
  "The stranger grins. Your coins disappear.",
  "Perhaps try a different approach, my lord.",
];

export const GAMBIT_DRAW_LINES = [
  "Blades clash \u2014 no winner this round.",
  "A standoff. The tension mounts.",
  "Evenly matched.",
];

export const GAMBIT_SCRIBES_NOTE =
  "Games of chance and skill were ubiquitous in medieval taverns. Dice games (especially \u2018hazard,\u2019 the ancestor of craps) were so popular that kings repeatedly tried to ban them among soldiers. Knights and commoners alike wagered on everything from card games to cockfights. The Church condemned gambling, but taverns ignored the clergy \u2014 as they ignored most things.";

// ---------------------------------------------------------------------------
// Rats in the Cellar
// ---------------------------------------------------------------------------

export const RATS_DURATION_MS = 20000;
export const RATS_GRID_SIZE = 4; // 4x4
export const RATS_FOOD_PER_ESCAPE = 2;

export const RATS_RATINGS = [
  { min: 0,  max: 5,  label: "The rats feast tonight.",               reward: 0,  foodPerEscape: 2 },
  { min: 6,  max: 9,  label: "A fair effort, my lord.",               reward: 0,  foodPerEscape: 1 },
  { min: 10, max: 14, label: "Well done! The cellar is mostly clear.", reward: 15, foodPerEscape: 1 },
  { min: 15, max: 99, label: "A legendary ratter! The cats are jealous.", reward: 25, foodPerEscape: 0 },
];

export const RATS_SCRIBES_NOTE =
  "Vermin destroyed vast quantities of stored grain in the Middle Ages \u2014 some historians estimate rats consumed up to a third of Europe\u2019s food supply. The Black Death itself was spread by fleas carried on rats. Cats were valued as working animals precisely because they protected grain stores. A good mouser was worth more than many farm tools.";

// ---------------------------------------------------------------------------
// The Bard's Corner
// ---------------------------------------------------------------------------

export const BARD_TALES = [
  "You think your treasury is impressive? Mansa Musa of Mali carried so much gold on his pilgrimage to Mecca in 1324 that when he passed through Cairo, he gave away so much of it that he crashed Egypt's gold market FOR TWELVE YEARS. The man was so generous he broke an entire country's economy by accident.",
  "You drink coffee, yes? Thank a goat. An Ethiopian herder named Kaldi noticed his goats dancing \u2014 DANCING \u2014 after eating certain berries. Monks in Yemen brewed them into a drink to stay awake during prayers. By the 1400s, coffeehouses in Cairo and Istanbul were everywhere. Europeans didn't figure out coffee for another two hundred years. You're welcome.",
  "In 859 AD \u2014 that's almost 1,200 years ago \u2014 a woman named Fatima al-Fihri used her inheritance to build the University of al-Qarawiyyin in Fez, Morocco. It's still open TODAY. Oxford didn't exist for another 237 years. Harvard? Don't make me laugh. That's 777 years later.",
  "While European doctors were saying 'have you tried leeches?' the physician al-Zahrawi in C\u00f3rdoba, Spain was writing a 1,500-page medical encyclopedia with ILLUSTRATIONS of surgical instruments. He invented tools for removing cataracts from people's EYES. With a needle. On purpose. And it worked.",
  "In 1154, a Muslim geographer named al-Idrisi made a map for the King of Sicily that was more accurate than anything in Europe. Only one problem for you lot \u2014 south was at the TOP. Africa was on top, Europe was on the bottom. He wasn't wrong, by the way. There IS no real 'up' on a sphere. Think about that tonight.",
  "The Mongol Empire ran a postal system called the Yam. Horse relay stations every 25 miles across ALL of Central Asia. A message could travel from Beijing to Budapest in DAYS. Genghis Khan didn't conquer the world with just swords \u2014 he conquered it with really, really fast mail. Your Amazon package still takes a week.",
  "In the Kingdom of Ghana, salt was so valuable that traders would exchange it POUND FOR POUND with gold. Think about that. The same stuff you dump on french fries was worth its weight in treasure. Merchants from the Sahara carried salt blocks on camel caravans for MONTHS to trade in Timbuktu. Some salt blocks were used as money. You could literally lick your wallet.",
  "In the 900s, Baghdad had an entire street called the Suq al-Warraqin \u2014 the Stationers' Market \u2014 with over a HUNDRED shops selling nothing but handwritten books. They had poetry, science, philosophy, fiction. Meanwhile, some European monasteries owned maybe twelve books total and chained them to the shelves so nobody would steal them. Chained. Books.",
  "Zheng He was a Chinese Muslim admiral who commanded a fleet of 300 ships \u2014 some of them 400 feet long. Columbus had three ships. Three. And they were about 60 feet. Zheng He sailed to India, Arabia, and East Africa between 1405 and 1433. He brought back giraffes. GIRAFFES. The Chinese emperor was very confused.",
  "Hospitals in the Islamic world \u2014 called bimaristans \u2014 were free to everyone, regardless of religion or wealth. The one in Cairo had separate wards for different diseases, a pharmacy, and \u2014 I am not making this up \u2014 musicians who played soothing music to help patients heal. Your doctor's office has a four-month-old magazine. Think about that.",
  "You think Vikings only raided? They were businessmen! Arab silver coins called dirhams have been found in Viking graves in Sweden. The traveler Ibn Fadlan actually met the Vikings on the Volga River and wrote about them. He said they were the tallest people he'd ever seen and also... the least hygienic. He was very specific about that. Very. Specific.",
  "When people say 'from here to Timbuktu,' they mean 'the middle of nowhere.' But in the 1400s, Timbuktu \u2014 in present-day Mali \u2014 was one of the most important intellectual cities on EARTH. The Sankore Madrasah had 25,000 students. They studied astronomy, law, medicine, and mathematics. More students than most American colleges today. Nowhere? Please.",
  "In 807 AD, the Abbasid Caliph Harun al-Rashid sent Charlemagne \u2014 the King of the Franks \u2014 a water clock. It had twelve mechanical knights that popped out on the hour. Charlemagne's people thought it was MAGIC. They literally couldn't figure out how it worked. Meanwhile in Baghdad, it was just a nice gift. A regifting, probably.",
  "Chess was invented in India, picked up by Persian scholars, then carried across the Islamic world by traders and travelers. The pieces got Arabic names \u2014 'checkmate' comes from 'shah mat,' which means 'the king is helpless.' Europeans learned the game from Muslims in Spain. So every time you play chess, you're playing a 1,400-year-old import.",
  "The Alhambra in Granada, Spain, built by the Moors, has rooms where the architecture is designed so that a whisper in one corner can be heard perfectly in the opposite corner \u2014 across the entire room. They also carved 'There is no conqueror but God' into the walls over 9,000 times. Nine. Thousand. That's not decoration. That's dedication.",
];

export const BARD_STATE_COMMENTS = [
  { condition: (s) => s.denarii > 800, text: "Your coffers overflow, my lord. Careful \u2014 Mansa Musa was rich too, and he accidentally destroyed Egypt's economy." },
  { condition: (s) => s.denarii < 50, text: "I've seen beggars with heavier purses. Perhaps try taxing something. Anything. The air, maybe." },
  { condition: (s) => s.food < 20, text: "The peasants are eating bark soup. I know because I just had a bowl. It was terrible." },
  { condition: (s) => s.food > 500, text: "Your granaries could feed an army! Which is good, because armies tend to show up when you have food." },
  { condition: (s) => s.population > 300, text: "Your kingdom swells! More people means more taxes, more soldiers, and more complaints. Mostly complaints." },
  { condition: (s) => s.population < 50, text: "It's getting quiet around here. I can hear my own echo. That's never a good sign for a kingdom." },
  { condition: (s) => s.garrison > 200, text: "Your army is fearsome! Though I notice they keep looking at YOUR castle. Just something I observed." },
  { condition: (s) => s.garrison === 0, text: "No army? Bold strategy. I once knew a lord who tried that. I say 'knew' because he's no longer a lord. Or alive." },
  { condition: (s) => s.turn === 1, text: "Ah, a new ruler! The last one? Don't ask. Just... don't open that closet in the east tower." },
  { condition: (s) => s.turn === 5, text: "Five turns in and still alive! That's better than Lord Pemberton. He didn't survive the opening feast." },
  { condition: (s) => s.turn >= 10 && s.turn < 15, text: "Ten turns! You've outlasted most rulers in this cursed kingdom. The bar is low, but still \u2014 well done." },
  { condition: (s) => s.buildings?.some(b => b.id === "school"), text: "A school! Fatima al-Fihri would be proud. Knowledge is the one treasure that can't be taxed. Yet." },
  { condition: (s) => s.buildings?.some(b => b.id === "market"), text: "A market! Soon traders will come from distant lands, selling exotic goods, exotic diseases, and exotic lies." },
  { condition: () => true, text: "Your manor endures, my lord. Not every lord can say that. The last three couldn't, for instance." },
];

export const BARD_RIDDLES = [
  {
    question: "I am sought by kings but made by the sea. Caravans die for me. I preserve your meat but I'm not loyalty. What am I?",
    answer: "Salt",
    options: ["Salt", "Ice", "Honey"],
    correct: "Salt! The white gold of the Sahara. You'd have done well in Timbuktu.",
    wrong: "No, friend. It's salt. Wars were fought over it. You put it on eggs.",
  },
  {
    question: "I have cities but no houses, forests but no trees, and water but no fish. What am I?",
    answer: "A map",
    options: ["A map", "A painting", "A dream"],
    correct: "A map! al-Idrisi would toast you from his workshop in Sicily.",
    wrong: "It's a map, friend. Perhaps you need one \u2014 you seem a bit lost.",
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps",
    options: ["Footsteps", "Memories", "Debts"],
    correct: "Footsteps! You think like a Silk Road traveler.",
    wrong: "Footsteps, my lord. Like the ones merchants leave across a thousand miles of desert.",
  },
  {
    question: "I can be cracked, made, told, and played. What am I?",
    answer: "A joke",
    options: ["A joke", "An egg", "A promise"],
    correct: "A joke! And you, my lord, are no joke. Usually.",
    wrong: "A joke! Like the one about the knight who forgot his armor. It didn't end well for him either.",
  },
  {
    question: "I have hands but cannot clap. I have a face but cannot smile. Harun al-Rashid sent me as a gift.",
    answer: "A clock",
    options: ["A clock", "A puppet", "A shield"],
    correct: "A clock! The great water clock of Baghdad. Charlemagne thought it was witchcraft.",
    wrong: "A clock, my lord. Specifically, the legendary water clock that baffled the Franks.",
  },
];

// ---------------------------------------------------------------------------
// Easter Eggs
// ---------------------------------------------------------------------------

export const WALL_STATIC_GRAFFITI = [
  { text: "Aldric owes me 3d", strikethrough: true },
  { text: "God save the King", icon: "\u266B" },
  { text: "HERE BE RATS", large: true },
];

export const WALL_DYNAMIC_CONDITIONS = [
  { condition: (s) => (s.tavern?.gambitTotalWins ?? 0) >= 3, text: "BEWARE THE LORD\u2019S BLADE \u2014 a worthy gambler" },
  { condition: (s) => s.food < 30, text: "BY ORDER: Food rationing in effect" },
  { condition: (s) => s.garrison > 12, text: "SOLDIERS WANTED \u2014 see the garrison captain" },
  { condition: (s) => s.denarii > 800, text: "The lord drinks well tonight" },
  { condition: (s) => s.turn > 10, text: "The seasons turn. How long will this lord last?" },
];

export const STRANGER_ENCOUNTERS = [
  { type: "tip",     text: "I hear trouble is coming with the next season. Prepare wisely." },
  { type: "trade",   text: "I have provisions for sale. 150d for a generous supply.", cost: 150, reward: { food: 10 } },
  { type: "warning", text: null }, // dynamically generated based on lowest resource
];

export const VISIT_MILESTONES = [
  { visits: 3, message: "You\u2019re becoming a regular, my lord." },
  { visits: 5, graffiti: "THE LORD\u2019S SEAT" },
  { visits: 10, message: "On the house, my lord. You\u2019ve earned it." },
];
