/**
 * Configuration for the reward point system
 * This defines how many points are awarded for each action
 */

// Point values for each action
const POINTS_CONFIG = {
  // Authentication related
  daily_login: 5,
  registration: 50,
  profile_completion: 100,

  // Content interaction
  like_post: 2,
  love_post: 3,
  create_post: 10,
  create_meme: 10,
  saved_post: 5,
  comment_post: 5,
  share_post: 5,
  create_status: 8,

  // Group interaction
  join_group: 15,
  follow_user: 5,

  // Purchase related
  purchase_product: 50,
  share_product: 15,

  // Session related
  book_session: 30,

  // Job related
  apply_job: 20,

  // Content consumption
  listen_audio_comic: 15,
  listen_podcast: 10,
  read_comic: 20,
};

// Tier thresholds
const TIER_THRESHOLDS = {
  bronze: { min: 0, max: 499 },
  silver: { min: 500, max: 1499 },
  gold: { min: 1500, max: Infinity },
};

// Benefits for each tier
const TIER_BENEFITS = {
  bronze: [
    "Basic access to platform features",
    "Participation in community events",
    "Unlock basic stickers and badges",
  ],
  silver: [
    "All Bronze benefits",
    "Early access to new content",
    "50% off on digital products",
    "Custom profile features",
  ],
  gold: [
    "All Silver benefits",
    "Priority support",
    "Exclusive content access",
    "Free monthly digital product",
    "Special badges and recognition",
  ],
};

// Daily limits for certain actions to prevent abuse
const DAILY_LIMITS = {
  like_post: 30,
  create_post: 10,
  create_meme: 10,
  saved_post: 5,
  comment_post: 20,
  share_post: 10,
  follow_user: 20,
};

module.exports = {
  POINTS_CONFIG,
  TIER_THRESHOLDS,
  TIER_BENEFITS,
  DAILY_LIMITS,
};
