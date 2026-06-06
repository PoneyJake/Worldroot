/** Worldroot — constants, classes, resources, upgrades. */

window.WorldrootConfig = {
  SAVE_KEY: 'worldroot_save_v1',
  SAVE_KEY_OFFLINE: 'worldroot_save_offline_v1',
  TICK_MS: 1000,
  SPECIALTY_BONUS: 0.25,
  BASE_XP_PER_TICK: 10,
  BASE_RESOURCE_PER_TICK: 1,
  COMBAT_GOLD_PER_TICK: 1,
  UPGRADE_EFFICIENCY_PER_LEVEL: 0.01,

  SLOT_UNLOCK_AT: [0, 10, 25],

  CLASSES: {
    warrior: {
      id: 'warrior',
      name: 'Warrior',
      specialty: 'mining',
      icon: '⚔',
      desc: '+25% Mining XP & resources',
    },
    archer: {
      id: 'archer',
      name: 'Archer',
      specialty: 'woodcutting',
      icon: '🏹',
      desc: '+25% Woodcutting XP & resources',
    },
    sorcerer: {
      id: 'sorcerer',
      name: 'Sorcerer',
      specialty: 'fishing',
      icon: '✦',
      desc: '+25% Fishing XP & resources',
    },
  },

  SKILLS: {
    combat: {
      id: 'combat',
      name: 'Combat',
      activity: 'combat',
      resources: [],
    },
    mining: {
      id: 'mining',
      name: 'Mining',
      activity: 'mining',
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
      resources: [
        { id: 'shrimp', name: 'Shrimp', minLevel: 1 },
        { id: 'trout', name: 'Trout', minLevel: 10 },
        { id: 'salmon', name: 'Salmon', minLevel: 25 },
        { id: 'lobster', name: 'Lobster', minLevel: 50 },
      ],
    },
  },

  ACTIVITIES: [
    { id: 'mining', label: 'Mining', skill: 'mining' },
    { id: 'woodcutting', label: 'Woodcutting', skill: 'woodcutting' },
    { id: 'fishing', label: 'Fishing', skill: 'fishing' },
    { id: 'combat', label: 'Combat', skill: 'combat' },
  ],

  /** All gatherable resource ids (for empty inventory). */
  RESOURCE_IDS: [
    'coal', 'copper', 'iron', 'gold',
    'oak', 'spruce', 'birch', 'jungle',
    'shrimp', 'trout', 'salmon', 'lobster',
  ],

  /** 3 upgrade nodes per resource — cost scales with node index. */
  UPGRADES: [
    { id: 'coal', name: 'Coal', baseCost: 10, nodes: ['Coal Upgrade 1', 'Coal Upgrade 2', 'Coal Upgrade 3'] },
    { id: 'copper', name: 'Copper', baseCost: 25, nodes: ['Copper Upgrade 1', 'Copper Upgrade 2', 'Copper Upgrade 3'] },
    { id: 'iron', name: 'Iron', baseCost: 50, nodes: ['Iron Upgrade 1', 'Iron Upgrade 2', 'Iron Upgrade 3'] },
    { id: 'gold', name: 'Gold', baseCost: 100, nodes: ['Gold Upgrade 1', 'Gold Upgrade 2', 'Gold Upgrade 3'] },
    { id: 'oak', name: 'Oak', baseCost: 10, nodes: ['Oak Upgrade 1', 'Oak Upgrade 2', 'Oak Upgrade 3'] },
    { id: 'spruce', name: 'Spruce', baseCost: 25, nodes: ['Spruce Upgrade 1', 'Spruce Upgrade 2', 'Spruce Upgrade 3'] },
    { id: 'birch', name: 'Birch', baseCost: 50, nodes: ['Birch Upgrade 1', 'Birch Upgrade 2', 'Birch Upgrade 3'] },
    { id: 'jungle', name: 'Jungle', baseCost: 100, nodes: ['Jungle Upgrade 1', 'Jungle Upgrade 2', 'Jungle Upgrade 3'] },
    { id: 'shrimp', name: 'Shrimp', baseCost: 10, nodes: ['Shrimp Upgrade 1', 'Shrimp Upgrade 2', 'Shrimp Upgrade 3'] },
    { id: 'trout', name: 'Trout', baseCost: 25, nodes: ['Trout Upgrade 1', 'Trout Upgrade 2', 'Trout Upgrade 3'] },
    { id: 'salmon', name: 'Salmon', baseCost: 50, nodes: ['Salmon Upgrade 1', 'Salmon Upgrade 2', 'Salmon Upgrade 3'] },
    { id: 'lobster', name: 'Lobster', baseCost: 100, nodes: ['Lobster Upgrade 1', 'Lobster Upgrade 2', 'Lobster Upgrade 3'] },
  ],
};
