/** Worldroot — constants, classes, resources, upgrades. */

window.WorldrootConfig = {
  SAVE_KEY: 'worldroot_save_v2',
  SAVE_KEY_OFFLINE: 'worldroot_save_offline_v2',
  TICK_MS: 1000,
  SPECIALTY_BONUS: 0.25,
  BASE_XP_PER_TICK: 10,
  BASE_RESOURCE_PER_TICK: 1,
  UPGRADE_BONUS_PER_LEVEL: 0.01,
  RATE_WINDOW_TICKS: 30,

  SLOT_UNLOCK_AT: [0, 10, 25],
  MAX_SLOTS: 3,

  SIDEBAR_NAV: [
    { type: 'skill', id: 'combat', label: 'Combat', icon: '🗡' },
    { type: 'skill', id: 'mining', label: 'Mining', icon: '⛏' },
    { type: 'skill', id: 'woodcutting', label: 'Woodcutting', icon: '🪓' },
    { type: 'skill', id: 'fishing', label: 'Fishing', icon: '🎣' },
    { type: 'skill', id: 'smithing', label: 'Smithing', icon: '🔨', comingSoon: true },
    { type: 'skill', id: 'smelting', label: 'Smelting', icon: '🔥', comingSoon: true },
    { type: 'skill', id: 'crafting', label: 'Crafting', icon: '🧵', comingSoon: true },
    { type: 'divider' },
    { type: 'page', id: 'characters', label: 'Characters', icon: '👥' },
    { type: 'page', id: 'worldtree', label: 'World Tree', icon: '🌳' },
    { type: 'page', id: 'settings', label: 'Settings', icon: '⚙' },
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
      desc: 'Hunt monsters across the forest for XP and loot',
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
    smithing: {
      id: 'smithing',
      name: 'Smithing',
      icon: '🔨',
      desc: 'Forge weapons and armor',
      comingSoon: true,
      resources: [],
    },
    smelting: {
      id: 'smelting',
      name: 'Smelting',
      icon: '🔥',
      desc: 'Refine ore into bars',
      comingSoon: true,
      resources: [],
    },
    crafting: {
      id: 'crafting',
      name: 'Crafting',
      icon: '🧵',
      desc: 'Craft tools and supplies',
      comingSoon: true,
      resources: [],
    },
  },

  SKILL_ORDER: ['combat', 'mining', 'woodcutting', 'fishing'],

  VEINS: {
    mining: [
      { id: 'coal_vein', name: 'Coal Vein', resource: 'coal', minLevel: 1, icon: '⬛' },
      { id: 'copper_vein', name: 'Copper Vein', resource: 'copper', minLevel: 10, icon: '🟤' },
      { id: 'iron_vein', name: 'Iron Vein', resource: 'iron', minLevel: 25, icon: '⬜' },
      { id: 'gold_vein', name: 'Gold Vein', resource: 'gold', minLevel: 50, icon: '🟡' },
    ],
    woodcutting: [
      { id: 'oak_grove', name: 'Oak Grove', resource: 'oak', minLevel: 1, icon: '🌳' },
      { id: 'spruce_grove', name: 'Spruce Grove', resource: 'spruce', minLevel: 10, icon: '🌲' },
      { id: 'birch_grove', name: 'Birch Grove', resource: 'birch', minLevel: 25, icon: '🌿' },
      { id: 'jungle_grove', name: 'Jungle Grove', resource: 'jungle', minLevel: 50, icon: '🌴' },
    ],
    fishing: [
      { id: 'shrimp_spot', name: 'Shrimp Spot', resource: 'shrimp', minLevel: 1, icon: '🦐' },
      { id: 'trout_spot', name: 'Trout Spot', resource: 'trout', minLevel: 10, icon: '🐟' },
      { id: 'salmon_spot', name: 'Salmon Spot', resource: 'salmon', minLevel: 25, icon: '🐠' },
      { id: 'lobster_spot', name: 'Lobster Spot', resource: 'lobster', minLevel: 50, icon: '🦞' },
    ],
  },

  MONSTERS: [
    {
      id: 'forest_slime',
      name: 'Forest Slime',
      level: 1,
      icon: '🟢',
      boss: false,
      drop: { id: 'slime_gel', name: 'Slime Gel', amount: 1 },
    },
    {
      id: 'goblin_scout',
      name: 'Goblin Scout',
      level: 5,
      icon: '👺',
      boss: false,
      drop: { id: 'goblin_ear', name: 'Goblin Ear', amount: 1 },
    },
    {
      id: 'dire_wolf',
      name: 'Dire Wolf',
      level: 10,
      icon: '🐺',
      boss: false,
      drop: { id: 'wolf_fur', name: 'Wolf Fur', amount: 1 },
    },
    {
      id: 'forest_bandit',
      name: 'Forest Bandit',
      level: 15,
      icon: '🥷',
      boss: false,
      drop: { id: 'bandit_emblem', name: 'Bandit Emblem', amount: 1 },
    },
    {
      id: 'bandit_leader',
      name: 'Bandit Leader',
      level: 25,
      icon: '👑',
      boss: true,
      drop: { id: 'bandit_emblem', name: 'Bandit Emblem', amount: 3 },
    },
  ],

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
    'slime_gel', 'goblin_ear', 'wolf_fur', 'bandit_emblem',
  ],

  LOOT_NAMES: {
    slime_gel: 'Slime Gel',
    goblin_ear: 'Goblin Ear',
    wolf_fur: 'Wolf Fur',
    bandit_emblem: 'Bandit Emblem',
  },

  /** World Tree branches — upgrades organized by category, not resource */
  WORLD_TREE_BRANCHES: [
    {
      id: 'combat',
      name: 'Combat Branch',
      icon: '⚔',
      nodes: [
        { id: 'damage', name: 'Damage', effect: 'combat_damage', desc: 'Increases combat damage' },
        { id: 'crit_chance', name: 'Crit Chance', effect: 'combat_crit_chance', desc: 'Increases critical hit chance' },
        { id: 'crit_damage', name: 'Crit Damage', effect: 'combat_crit_damage', desc: 'Increases critical hit damage' },
        { id: 'drop_rate', name: 'Drop Rate', effect: 'combat_drop_rate', desc: 'Increases loot drop rate' },
      ],
    },
    {
      id: 'mining',
      name: 'Mining Branch',
      icon: '⛏',
      nodes: [
        { id: 'mining_efficiency', name: 'Mining Efficiency', effect: 'mining_yield', desc: 'Increases ore gathered per tick' },
        { id: 'mining_xp', name: 'Mining XP', effect: 'mining_xp', desc: 'Increases mining experience gained' },
        { id: 'multi_ore', name: 'Multi Ore Chance', effect: 'mining_multi', desc: 'Chance to gather extra ore' },
      ],
    },
    {
      id: 'woodcutting',
      name: 'Woodcutting Branch',
      icon: '🪓',
      nodes: [
        { id: 'chopping_efficiency', name: 'Chopping Efficiency', effect: 'woodcutting_yield', desc: 'Increases logs gathered per tick' },
        { id: 'chopping_xp', name: 'Chopping XP', effect: 'woodcutting_xp', desc: 'Increases woodcutting experience gained' },
        { id: 'multi_log', name: 'Multi Log Chance', effect: 'woodcutting_multi', desc: 'Chance to gather extra logs' },
      ],
    },
    {
      id: 'fishing',
      name: 'Fishing Branch',
      icon: '🎣',
      nodes: [
        { id: 'fishing_efficiency', name: 'Fishing Efficiency', effect: 'fishing_yield', desc: 'Increases fish caught per tick' },
        { id: 'fishing_xp', name: 'Fishing XP', effect: 'fishing_xp', desc: 'Increases fishing experience gained' },
        { id: 'double_catch', name: 'Double Catch Chance', effect: 'fishing_multi', desc: 'Chance to catch extra fish' },
      ],
    },
    {
      id: 'utility',
      name: 'Utility Branch',
      icon: '✦',
      nodes: [
        { id: 'storage_capacity', name: 'Storage Capacity', effect: 'storage', desc: 'Increases resource storage bonus' },
        { id: 'inventory_capacity', name: 'Inventory Capacity', effect: 'inventory', desc: 'Increases inventory capacity bonus' },
        { id: 'gold_gain', name: 'Gold Gain', effect: 'gold_gain', desc: 'Increases gold from all sources' },
      ],
    },
  ],

  /** Base multi-resource costs per upgrade node (scaled by level in engine) */
  UPGRADE_BASE_COSTS: {
    damage: { coal: 20, copper: 10 },
    crit_chance: { coal: 15, iron: 5 },
    crit_damage: { copper: 20, iron: 10 },
    drop_rate: { iron: 15, gold: 5 },
    mining_efficiency: { coal: 50, copper: 25, iron: 10 },
    mining_xp: { coal: 30, copper: 15 },
    multi_ore: { copper: 40, iron: 20 },
    chopping_efficiency: { oak: 50, spruce: 25, birch: 10 },
    chopping_xp: { oak: 30, spruce: 15 },
    multi_log: { spruce: 40, birch: 20 },
    fishing_efficiency: { shrimp: 50, trout: 25, salmon: 10 },
    fishing_xp: { shrimp: 30, trout: 15 },
    double_catch: { trout: 40, salmon: 20 },
    storage_capacity: { coal: 25, oak: 25, shrimp: 25 },
    inventory_capacity: { copper: 25, spruce: 25, trout: 25 },
    gold_gain: { gold: 30, lobster: 20, bandit_emblem: 5 },
  },
};
