import { Challenge, Badge, SocialPost, LogEntry, CarbonCategory } from "./types";

// CO2 emission factors in kg CO2e
export const EMISSION_FACTORS = {
  transportation: {
    gas_car: { label: "Gasoline Car (per mile)", factor: 0.404, unit: "miles" },
    hybrid_car: { label: "Hybrid Car (per mile)", factor: 0.18, unit: "miles" },
    ev_car: { label: "Electric Vehicle (per mile)", factor: 0.08, unit: "miles" },
    public_transit: { label: "Bus/Train Transit (per mile)", factor: 0.09, unit: "miles" },
    short_flight: { label: "Short Flight (per mile)", factor: 0.25, unit: "miles" },
    long_flight: { label: "Long Flight (per mile)", factor: 0.18, unit: "miles" },
  },
  energy: {
    electricity: { label: "Electricity (per kWh)", factor: 0.38, unit: "kWh" },
    natural_gas: { label: "Natural Gas (per therm)", factor: 2.0, unit: "therms" },
    heating_oil: { label: "Heating Oil (per gallon)", factor: 10.15, unit: "gallons" },
  },
  diet: {
    meat_beef_lamb: { label: "Beef / Lamb Meal (per meal)", factor: 7.2, unit: "meals" },
    poultry_pork: { label: "Poultry / Pork Meal (per meal)", factor: 2.4, unit: "meals" },
    fish: { label: "Fish Meal (per meal)", factor: 1.8, unit: "meals" },
    vegetarian: { label: "Vegetarian Meal (per meal)", factor: 1.2, unit: "meals" },
    vegan: { label: "Vegan Meal (per meal)", factor: 0.6, unit: "meals" },
  },
  waste: {
    general_trash: { label: "Landfill Trash (per kg)", factor: 0.5, unit: "kg" },
    recycled: { label: "Recycled Items (per kg)", factor: -0.3, unit: "kg" }, // Negative represents savings/offsets
    compost: { label: "Composted Waste (per kg)", factor: -0.2, unit: "kg" },
  },
};

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "challenge_transit_pioneer",
    title: "Transit Pioneer",
    description: "Commute by walking, cycling, or public transit instead of driving your fuel car.",
    category: "transportation",
    difficulty: "Easy",
    xpAward: 50,
    co2SavingsKg: 4.8,
    actionType: "Transit Swap",
  },
  {
    id: "challenge_veg_out",
    title: "Plant Powered",
    description: "Opt for 100% vegetarian or vegan options for all your meals today.",
    category: "diet",
    difficulty: "Medium",
    xpAward: 80,
    co2SavingsKg: 6.2,
    actionType: "Meatless Day",
  },
  {
    id: "challenge_phantom_power",
    title: "Standby Slayer",
    description: "Unplug at least 5 electronics from standby mode overnight (chargers, consoles, appliances).",
    category: "energy",
    difficulty: "Easy",
    xpAward: 40,
    co2SavingsKg: 1.5,
    actionType: "Unplugging Devices",
  },
  {
    id: "challenge_cold_wash",
    title: "Chill Cycle",
    description: "Wash a full load of laundry on cold cycle instead of warm/hot.",
    category: "energy",
    difficulty: "Easy",
    xpAward: 35,
    co2SavingsKg: 1.1,
    actionType: "Cold Laundry",
  },
  {
    id: "challenge_zero_waste",
    title: "Zero Plastics Hub",
    description: "Go a full 24 hours without purchasing or discarding single-use plastics.",
    category: "waste",
    difficulty: "Hard",
    xpAward: 120,
    co2SavingsKg: 3.5,
    actionType: "Zero Plastic",
  },
  {
    id: "challenge_no_car",
    title: "No Car Day",
    description: "Keep your car parked. Rely on cycle, strolls, or remote work.",
    category: "transportation",
    difficulty: "Hard",
    xpAward: 150,
    co2SavingsKg: 12.5,
    actionType: "No Driving",
  },
];

export const ALL_BADGES: Badge[] = [
  {
    id: "badge_commute",
    title: "Transit Champ",
    description: "Log 3 eco-friendly transportation or cycling activities.",
    category: "transportation",
    iconName: "Compass",
  },
  {
    id: "badge_diet",
    title: "Eco Chef",
    description: "Eat and log 5 vegetarian or vegan meals.",
    category: "diet",
    iconName: "Apple",
  },
  {
    id: "badge_energy",
    title: "Kilowatt Keeper",
    description: "Log 3 electricity savings or unplugging actions.",
    category: "energy",
    iconName: "Zap",
  },
  {
    id: "badge_waste",
    title: "Waste Wizard",
    description: "Save a cumulative 10kg of CO2 through recycling and composting logs.",
    category: "waste",
    iconName: "Trash2",
  },
  {
    id: "badge_level_3",
    title: "Conscious Citizen",
    description: "Raise your green profile to Level 3.",
    category: "general",
    iconName: "CheckCircle",
  },
  {
    id: "badge_savings_100",
    title: "Carbon Crusader",
    description: "Help offset or save a total of 100kg CO2e.",
    category: "general",
    iconName: "Globe2",
  },
];

// Helper to generate initials or colors for avatars
export const GRAVATAR_PALETTE = [
  "from-emerald-400 to-green-600",
  "from-teal-400 to-cyan-500",
  "from-green-400 to-emerald-600",
  "from-lime-400 to-green-500",
  "from-sky-400 to-blue-600",
];

export const getAvatarColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRAVATAR_PALETTE.length;
  return GRAVATAR_PALETTE[index];
};

export const INITIAL_SOCIAL_FEED: SocialPost[] = [
  {
    id: "post_1",
    authorName: "Sarah Green",
    authorEmail: "sarah@eco.net",
    avatarSeed: "sarah",
    content: "I took the public subway to work today and saved approx 8.5 kg CO2e compared to driving my Jeep! Small daily choices build massive climate momentum. 🌱🚌",
    timestamp: Date.now() - 3 * 3600 * 1000,
    likes: 12,
    likedByUser: false,
    comments: [
      "Awesome work, Sarah! public transit is the future.",
      "Inspiring! Doing the same tomorrow."
    ]
  },
  {
    id: "post_2",
    authorName: "Daniel K.",
    authorEmail: "daniel@gmail.com",
    avatarSeed: "daniel",
    content: "Just unlocked the 'Eco Chef' badge for compiling vegetarian meals all week! Tofu stir fry tastes way better knowing my diet impact is minimized. 🥑🍳",
    timestamp: Date.now() - 6 * 3600 * 1000,
    likes: 8,
    likedByUser: false,
    comments: ["Recipes please!", "Let's go Green!"]
  },
  {
    id: "post_3",
    authorName: "Marcus Vance",
    authorEmail: "marcus@domain.com",
    avatarSeed: "marcus",
    content: "Took the 'Standby Slayer' challenge seriously today. Switched off all idle surge protectors and smart items before bed. Saved electricity and ready for macro-level audits! ⚡🏡",
    timestamp: Date.now() - 14 * 3600 * 1000,
    likes: 19,
    likedByUser: false,
    comments: []
  }
];

export const INITIAL_LOG_ENTRIES = (): LogEntry[] => [
  {
    id: "log_init_1",
    timestamp: Date.now() - 6 * 24 * 3600 * 1000,
    category: "transportation",
    activityName: "Car Commute (Gasoline)",
    unitValue: 35,
    unitLabel: "miles",
    emission: 35 * 0.404,
    isOffset: false,
  },
  {
    id: "log_init_2",
    timestamp: Date.now() - 5 * 24 * 3600 * 1000,
    category: "diet",
    activityName: "Beef / Lamb Meal",
    unitValue: 2,
    unitLabel: "meals",
    emission: 2 * 7.2,
    isOffset: false,
  },
  {
    id: "log_init_3",
    timestamp: Date.now() - 4 * 24 * 3600 * 1000,
    category: "energy",
    activityName: "Electricity",
    unitValue: 40,
    unitLabel: "kWh",
    emission: 40 * 0.38,
    isOffset: false,
  },
  {
    id: "log_init_4",
    timestamp: Date.now() - 3 * 24 * 3600 * 1000,
    category: "waste",
    activityName: "Recycled Items",
    unitValue: 12,
    unitLabel: "kg",
    emission: Math.abs(12 * -0.3),
    isOffset: true,
  },
  {
    id: "log_init_5",
    timestamp: Date.now() - 2 * 24 * 3600 * 1000,
    category: "transportation",
    activityName: "Bus/Transit",
    unitValue: 15,
    unitLabel: "miles",
    emission: 15 * 0.09,
    isOffset: false,
  },
  {
    id: "log_init_6",
    timestamp: Date.now() - 1 * 24 * 3600 * 1000,
    category: "diet",
    activityName: "Vegan Meal",
    unitValue: 3,
    unitLabel: "meals",
    emission: 3 * 0.6,
    isOffset: false,
  }
];
