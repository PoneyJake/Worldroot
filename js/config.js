/** Worldroot — constants, classes, resources, upgrades. */

window.WorldrootConfig = {
  SAVE_KEY: 'worldroot_save_v1',
  SAVE_KEY_OFFLINE: 'worldroot_save_offline_v1',
  TICK_MS: 1000,
  SPECIALTY_BONUS: 0.25,
  BASE_XP_PER_TICK: 10,
  BASE_RESOURCE_PER_TICK: 1,
  COMBAT_GOLD_PER_TICK: 1,
  UPGRADE_BONUS_PER_LEVEL: 0.01,

  SLOT_UNLOCK_AT: [0, 10, 25],
  MAX_SLOTS: 3,

  TABS: [
    { id: 'characters', label: 'Characters' },
    { id: 'skills', label: 'Skills' },
    { id: 'resources', label: 'Resources' },
    { id: 'worldroot', label: 'Worldroot' },
    { id: 'settings', label: 'Settings' },
  ],

  CLASSES: {
    warrior: {
      id: 'warrior',
      name: 'Warrior',
      specialty: 'mining',
      icon: '⚔',
      desc: '+25% Mining',
    },
    archer: {
      id: 'archer',
      name: 'Archer',
      specialty: 'woodcutting',
      icon: '🏹',
      desc: '+25% Woodcutting',
    },
    sorcerer: {
      id: 'sorcerer',
      name: 'Sorcerer',
      specialty: 'fishing',
      icon: '✦',
      desc: '+25% Fishing',
    },
  },

  SKILLS: {
    combat: {
      id: 'combat',
      name: 'Combat',
      activity: 'combat',
      icon: '🗡',
      desc: 'Fight for gold and drops',
      resources: [],
    },
    mining: {
      id: 'mining',
      name: 'Mining',
      activity: 'mining',
      icon: '⛏',
      desc: 'Ore from the deep roots',
      resources: [
        { id: 'coal', name: 'Coal', minLevel: 1 },
        { id: 'copper', name: 'Copper', minLevel: 10 },
        { id: 'iron', name: 'Iron', minLevel: 25 },
        { id: 'gold', name: 'Gold', minLevel: 50 },
      ],
    },
    woodcutting: {
      id: 'woodcutting',
      name: 'Woodcutting',
      activity: 'woodcutting',
      icon: '🪓',
      desc: 'Timber from the wild groves',
      resources: [
        { id: 'oak', name: 'Oak Log', minLevel: 1 },
        { id: 'spruce', name: 'Spruce Log', minLevel: 10 },
        { id: 'birch', name: 'Birch Log', minLevel: 25 },
        { id: 'jungle', name: 'Jungle Log', minLevel: 50 },
      ],
    },
    fishing: {
      id: 'fishing',
      name: 'Fishing',
      activity: 'fishing',
      icon: '🎣',
      desc: 'Catch from forest streams',
      resources: [
        { id: 'shrimp', name: 'Shrimp', minLevel: 1 },
        { id: 'trout', name: 'Trout', minLevel: 10 },
        { id: 'salmon', name: 'Salmon', minLevel: 25 },
        { id: 'lobster', name: 'Lobster', minLevel: 50 },
      ],
    },
  },

  SKILL_ORDER: ['combat', 'mining', 'woodcutting', 'fishing'],

  ACTIVITIES: [
    { id: 'mining', label: 'Mining', skill: 'mining' },
    { id: 'woodcutting', label: 'Woodcutting', skill: 'woodcutting' },
    { id: 'fishing', label: 'Fishing', skill: 'fishing' },
    { id: 'combat', label: 'Combat', skill: 'combat' },
  ],

  RESOURCE_IDS: [
    'coal', 'copper', 'iron', 'gold',
    'oak', 'spruce', 'birch', 'jungle',
    'shrimp', 'trout', 'salmon', 'lobster',
  ],

  /** 3 meaningful upgrade nodes per resource. effect drives bonus in engine.js */
  UPGRADES: [
    {
      id: 'coal', name: 'Coal', baseCost: 10,
      nodes: [
        { name: 'Chopping Efficiency', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Storage Capacity', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Mining EXP', effect: 'mining_xp', desc: '+1% mining XP per level' },
      ],
    },
    {
      id: 'copper', name: 'Copper', baseCost: 25,
      nodes: [
        { name: 'Forge Heat', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Smelter Storage', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Copper Mastery', effect: 'mining_xp', desc: '+1% mining XP per level' },
      ],
    },
    {
      id: 'iron', name: 'Iron', baseCost: 50,
      nodes: [
        { name: 'Deep Shaft', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Iron Hauling', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Iron EXP', effect: 'mining_xp', desc: '+1% mining XP per level' },
      ],
    },
    {
      id: 'gold', name: 'Gold', baseCost: 100,
      nodes: [
        { name: 'Midas Touch', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Vault Expansion', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Golden Insight', effect: 'combat_gold', desc: '+1% combat gold per level' },
      ],
    },
    {
      id: 'oak', name: 'Oak Log', baseCost: 10,
      nodes: [
        { name: 'Mining Efficiency', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Combat HP', effect: 'combat_hp', desc: '+1% combat HP per level' },
        { name: 'Woodcutting EXP', effect: 'woodcutting_xp', desc: '+1% woodcutting XP per level' },
      ],
    },
    {
      id: 'spruce', name: 'Spruce Log', baseCost: 25,
      nodes: [
        { name: 'Timber Pace', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Lumber Storage', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Spruce Mastery', effect: 'woodcutting_xp', desc: '+1% woodcutting XP per level' },
      ],
    },
    {
      id: 'birch', name: 'Birch Log', baseCost: 50,
      nodes: [
        { name: 'Sharp Axes', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Wood Piles', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Birch EXP', effect: 'woodcutting_xp', desc: '+1% woodcutting XP per level' },
      ],
    },
    {
      id: 'jungle', name: 'Jungle Log', baseCost: 100,
      nodes: [
        { name: 'Canopy Harvest', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Jungle Cache', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Wild Growth', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'shrimp', name: 'Shrimp', baseCost: 10,
      nodes: [
        { name: 'Net Repair', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Tackle Box', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Fishing EXP', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'trout', name: 'Trout', baseCost: 25,
      nodes: [
        { name: 'River Run', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Fish Barrel', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Trout Mastery', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'salmon', name: 'Salmon', baseCost: 50,
      nodes: [
        { name: 'Upstream Lure', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Cold Storage', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Salmon EXP', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'lobster', name: 'Lobster', baseCost: 100,
      nodes: [
        { name: 'Deep Water Traps', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Coastal Vault', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Combat EXP', effect: 'combat_xp', desc: '+1% combat XP per level' },
      ],
    },
  ],
};
