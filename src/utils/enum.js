// enums.ts
const AgeCategory = {
  CHILD: "6-12",
  TEEN: "13-16",
  YOUNG_ADULT: "17-19",
  ADULT: "20+",
};
const ProductType = {
  COMIC: "comic",
  AUDIO_COMIC: "audio_comic",
  PODCAST: "podcast",
  WORKSHOP: "workshop",
  ASSESSMENT: "assessment",
  MERCHANDISE: "merchandise",
  MENTOONS_CARDS: "mentoons cards",
  MENTOONS_BOOKS: "metnoons books",
  //Any other product type
};

const CardType = {
  CONVERSATION_STARTER_CARDS: "conversation starter cards",
  SILENT_STORIES: "silent stories",
  STORY_RE_TELLER_CARD: "story re-teller card",
  CONVERSATION_STORY_CARDS: "conversation story cards",
};

module.exports = {
  AgeCategory,
  ProductType,
  CardType,
};
