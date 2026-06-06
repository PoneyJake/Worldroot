/** Worldroot — constants, classes, resources, upgrades. */

window.WorldrootConfig = {
  SAVE_KEY: 'worldroot_save_v4',
  SAVE_KEY_OFFLINE: 'worldroot_save_offline_v4',
  TICK_MS: 1000,
  BASE_XP_PER_TICK: 10,
  BASE_RESOURCE_PER_TICK: 1,
  UPGRADE_BONUS_PER_LEVEL: 0.01,
  UPGRADE_FLAT_PER_LEVEL: 1,
  RATE_WINDOW_TICKS: 30,
  BASE_INVENTORY_SLOTS: 20,
  BASE_STORAGE_SLOTS: 24,
  BASE_STACK_SIZE: 50,
  SMELT_TICKS_PER_ORE: 8,
  STAT_SCALE: 0.03,

  SLOT_UNLOCK_AT: [0, 10, 25],
  MAX_SLOTS: 3,
  UNLOCK_LEVELS: [0, 5, 10, 15],
  SMELT_SLOT_UNLOCKS: [0, 5, 10, 15],

  SIDEBAR_NAV: [
    { type: 'section', label: 'Menu' },
    { type: 'page', id: 'characters', label: 'Characters', icon: '👥' },
    { type: 'page', id: 'inventory', label: 'Inventory', icon: '🎒' },
    { type: 'page', id: 'storage', label: 'Storage', icon: '📦' },
    { type: 'divider' },
    { type: 'section', label: 'Skills' },
    { type: 'skill', id: 'combat', label: 'Combat', icon: '🗡' },
    { type: 'skill', id: 'mining', label: 'Mining', icon: '⛏' },
    { type: 'skill', id: 'woodcutting', label: 'Woodcutting', icon: '🪓' },
    { type: 'skill', id: 'fishing', label: 'Fishing', icon: '🎣' },
    { type: 'skill', id: 'producing', label: 'Producing', icon: '🏭' },
    { type: 'skill', id: 'smelting', label: 'Smelting', icon: '🔥' },
    { type: 'skill', id: 'crafting', label: 'Crafting', icon: '🧵', comingSoon: true },
    { type: 'divider' },
    { type: 'page', id: 'worldtree', label: 'World Tree', icon: '🌳' },
    { type: 'divider' },
    { type: 'page', id: 'settings', label: 'Settings', icon: '⚙' },
  ],

  CLASSES: {
    warrior: {
      id: 'warrior', name: 'Warrior', icon: '⚔',
      desc: 'Strength scales mining & combat damage',
      combatStat: 'strength', gatherStat: 'strength',
      baseStats: { strength: 5, agility: 2, magic: 2 },
    },
    archer: {
      id: 'archer', name: 'Archer', icon: '🏹',
      desc: 'Agility scales woodcutting & combat damage',
      combatStat: 'agility', gatherStat: 'agility',
      baseStats: { strength: 2, agility: 5, magic: 2 },
    },
    sorcerer: {
      id: 'sorcerer', name: 'Sorcerer', icon: '✦',
      desc: 'Magic scales fishing & combat damage',
      combatStat: 'magic', gatherStat: 'magic',
      baseStats: { strength: 2, agility: 2, magic: 5 },
    },
  },

  SKILLS: {
    combat: { id: 'combat', name: 'Combat', activity: 'combat', icon: '🗡', desc: 'Hunt monsters for XP and loot' },
    mining: { id: 'mining', name: 'Mining', activity: 'mining', icon: '⛏', desc: 'Mine ore from the deep roots', gatherStat: 'strength' },
    woodcutting: { id: 'woodcutting', name: 'Woodcutting', activity: 'woodcutting', icon: '🪓', desc: 'Chop timber from wild groves', gatherStat: 'agility' },
    fishing: { id: 'fishing', name: 'Fishing', activity: 'fishing', icon: '🎣', desc: 'Catch fish from forest streams', gatherStat: 'magic' },
    producing: { id: 'producing', name: 'Producing', icon: '🏭', desc: 'Passively craft supplies — collect into inventory' },
    smelting: { id: 'smelting', name: 'Smelting', icon: '🔥', desc: 'Smelt ore into bars' },
    crafting: { id: 'crafting', name: 'Crafting', icon: '🧵', desc: 'Craft gear and tools', comingSoon: true },
  },

  VEINS: {
    mining: [
      { id: 'copper_vein', name: 'Copper Vein', resource: 'copper', minLevel: 0, icon: '🟤' },
      { id: 'iron_vein', name: 'Iron Vein', resource: 'iron', minLevel: 5, icon: '⬜' },
      { id: 'gold_vein', name: 'Gold Vein', resource: 'gold', minLevel: 10, icon: '🟡' },
      { id: 'platinum_vein', name: 'Platinum Vein', resource: 'platinum', minLevel: 15, icon: '💎' },
    ],
    woodcutting: [
      { id: 'oak_grove', name: 'Oak Grove', resource: 'oak', minLevel: 0, icon: '🌳' },
      { id: 'spruce_grove', name: 'Spruce Grove', resource: 'spruce', minLevel: 5, icon: '🌲' },
      { id: 'birch_grove', name: 'Birch Grove', resource: 'birch', minLevel: 10, icon: '🌿' },
      { id: 'jungle_grove', name: 'Jungle Grove', resource: 'jungle', minLevel: 15, icon: '🌴' },
    ],
    fishing: [
      { id: 'shrimp_spot', name: 'Shrimp Spot', resource: 'shrimp', minLevel: 0, icon: '🦐' },
      { id: 'trout_spot', name: 'Trout Spot', resource: 'trout', minLevel: 5, icon: '🐟' },
      { id: 'salmon_spot', name: 'Salmon Spot', resource: 'salmon', minLevel: 10, icon: '🐠' },
      { id: 'lobster_spot', name: 'Lobster Spot', resource: 'lobster', minLevel: 15, icon: '🦞' },
    ],
  },

  MONSTERS: [
    { id: 'forest_slime', name: 'Forest Slime', level: 0, icon: '🟢', drop: { id: 'slime_gel', name: 'Slime Gel', amount: 1 } },
    { id: 'goblin_scout', name: 'Goblin Scout', level: 5, icon: '👺', drop: { id: 'goblin_ear', name: 'Goblin Ear', amount: 1 } },
    { id: 'dire_wolf', name: 'Dire Wolf', level: 10, icon: '🐺', drop: { id: 'wolf_fur', name: 'Wolf Fur', amount: 1 } },
    { id: 'forest_bandit', name: 'Forest Bandit', level: 15, icon: '🥷', drop: { id: 'bandit_emblem', name: 'Bandit Emblem', amount: 1 } },
  ],

  SMELT_RECIPES: [
    { ore: 'copper', bar: 'copper_bar', name: 'Copper Bar', icon: '🟫' },
    { ore: 'iron', bar: 'iron_bar', name: 'Iron Bar', icon: '▫️' },
    { ore: 'gold', bar: 'gold_bar', name: 'Gold Bar', icon: '🟨' },
    { ore: 'platinum', bar: 'platinum_bar', name: 'Platinum Bar', icon: '⬜' },
  ],

  PRODUCE_ITEMS: [
    { id: 'twine', name: 'Twine', minLevel: 0, icon: '🧶', output: 1, ticks: 8, xp: 8 },
    { id: 'wooden_pegs', name: 'Wooden Pegs', minLevel: 5, icon: '📌', output: 1, ticks: 12, xp: 12 },
    { id: 'iron_nails', name: 'Iron Nails', minLevel: 10, icon: '🔩', output: 1, ticks: 16, xp: 16 },
    { id: 'resin', name: 'Resin', minLevel: 15, icon: '🍯', output: 1, ticks: 20, xp: 20 },
  ],

  ACTIVITIES: [
    { id: 'mining', label: 'Mining', skill: 'mining' },
    { id: 'woodcutting', label: 'Woodcutting', skill: 'woodcutting' },
    { id: 'fishing', label: 'Fishing', skill: 'fishing' },
    { id: 'combat', label: 'Combat', skill: 'combat' },
  ],

  RESOURCE_IDS: [
    'copper', 'iron', 'gold', 'platinum',
    'copper_bar', 'iron_bar', 'gold_bar', 'platinum_bar',
    'oak', 'spruce', 'birch', 'jungle',
    'shrimp', 'trout', 'salmon', 'lobster',
    'slime_gel', 'goblin_ear', 'wolf_fur', 'bandit_emblem',
    'twine', 'wooden_pegs', 'iron_nails', 'resin',
  ],

  RESOURCE_NAMES: {
    copper: 'Copper', iron: 'Iron', gold: 'Gold', platinum: 'Platinum',
    copper_bar: 'Copper Bar', iron_bar: 'Iron Bar', gold_bar: 'Gold Bar', platinum_bar: 'Platinum Bar',
    oak: 'Oak Log', spruce: 'Spruce Log', birch: 'Birch Log', jungle: 'Jungle Log',
    shrimp: 'Shrimp', trout: 'Trout', salmon: 'Salmon', lobster: 'Lobster',
    slime_gel: 'Slime Gel', goblin_ear: 'Goblin Ear', wolf_fur: 'Wolf Fur', bandit_emblem: 'Bandit Emblem',
    twine: 'Twine', wooden_pegs: 'Wooden Pegs', iron_nails: 'Iron Nails', resin: 'Resin',
  },

  RESOURCE_ICONS: {
    copper: '🟤', iron: '⬜', gold: '🟡', platinum: '💎',
    copper_bar: '🟫', iron_bar: '▫️', gold_bar: '🟨', platinum_bar: '⬜',
    oak: '🌳', spruce: '🌲', birch: '🌿', jungle: '🌴',
    shrimp: '🦐', trout: '🐟', salmon: '🐠', lobster: '🦞',
    slime_gel: '🟢', goblin_ear: '👺', wolf_fur: '🐺', bandit_emblem: '🥷',
    twine: '🧶', wooden_pegs: '📌', iron_nails: '🔩', resin: '🍯',
  },

  CARRY_EFFECT_BY_SKILL: {
    mining: 'mining_carry',
    woodcutting: 'woodcutting_carry',
    fishing: 'fishing_carry',
    combat: 'carry_capacity',
  },

  WORLD_TREE_BRANCHES: [
    {
      id: 'combat', name: 'Combat Branch', icon: '⚔',
      nodes: [
        { id: 'base_hp', name: '+ Base HP', effect: 'base_hp', bonusType: 'flat', desc: 'Increases base hit points', costRes: 'slime_gel', baseCost: 15 },
        { id: 'base_mp', name: '+ Base MP', effect: 'base_mp', bonusType: 'flat', desc: 'Increases base mana', costRes: 'trout', baseCost: 15 },
        { id: 'base_damage', name: '+ Base Damage', effect: 'base_damage', bonusType: 'flat', desc: 'Increases base damage', costRes: 'goblin_ear', baseCost: 20 },
        { id: 'pct_damage', name: '+% Damage', effect: 'pct_damage', bonusType: 'percent', desc: 'Increases damage dealt', costRes: 'iron', baseCost: 30 },
        { id: 'base_accuracy', name: '+ Base Accuracy', effect: 'base_accuracy', bonusType: 'flat', desc: 'Increases hit accuracy', costRes: 'copper', baseCost: 25 },
        { id: 'base_defence', name: '+ Base Defence', effect: 'base_defence', bonusType: 'flat', desc: 'Increases base defence', costRes: 'wolf_fur', baseCost: 20 },
        { id: 'crit_damage', name: '+% Crit Damage', effect: 'crit_damage', bonusType: 'percent', desc: 'Increases critical damage', costRes: 'gold', baseCost: 30 },
        { id: 'crit_chance', name: '+% Crit Chance', effect: 'crit_chance', bonusType: 'percent', desc: 'Increases critical chance', costRes: 'platinum', baseCost: 30 },
        { id: 'drop_rate', name: '+% Drop Rate', effect: 'drop_rate', bonusType: 'percent', desc: 'Increases loot drop rate', costRes: 'bandit_emblem', baseCost: 25 },
        { id: 'strength', name: '+ Strength', effect: 'strength', bonusType: 'flat', desc: 'Increases strength', costRes: 'oak', baseCost: 25 },
        { id: 'agility', name: '+ Agility', effect: 'agility', bonusType: 'flat', desc: 'Increases agility', costRes: 'spruce', baseCost: 25 },
        { id: 'magic', name: '+ Magic', effect: 'magic', bonusType: 'flat', desc: 'Increases magic', costRes: 'salmon', baseCost: 25 },
        { id: 'carry_capacity', name: '+% Carrying Capacity', effect: 'carry_capacity', bonusType: 'percent', desc: 'More items per inventory slot', costRes: 'birch', baseCost: 30 },
        { id: 'gold_gain', name: '+% Gold Gain', effect: 'gold_gain', bonusType: 'percent', desc: 'Earn more gold', costRes: 'lobster', baseCost: 20 },
      ],
    },
    {
      id: 'mining', name: 'Mining Branch', icon: '⛏',
      nodes: [
        { id: 'base_mining_eff', name: '+ Base Mining Efficiency', effect: 'mining_yield', bonusType: 'flat', desc: 'Mine more ore per tick', costRes: 'copper', baseCost: 30 },
        { id: 'mining_carry', name: '+% Carrying Capacity', effect: 'mining_carry', bonusType: 'percent', desc: 'More ore per inventory slot', costRes: 'iron', baseCost: 25 },
        { id: 'multi_ore', name: '+% Multi-Ore Chance', effect: 'mining_multi', bonusType: 'percent', desc: 'Chance for extra ore', costRes: 'gold', baseCost: 35 },
        { id: 'mining_xp', name: '+% Mining Exp Gain', effect: 'mining_xp', bonusType: 'percent', desc: 'More mining XP', costRes: 'platinum', baseCost: 30 },
      ],
    },
    {
      id: 'woodcutting', name: 'Woodcutting Branch', icon: '🪓',
      nodes: [
        { id: 'base_wc_eff', name: '+ Base Woodcutting Efficiency', effect: 'woodcutting_yield', bonusType: 'flat', desc: 'Chop more logs per tick', costRes: 'oak', baseCost: 30 },
        { id: 'wc_carry', name: '+% Carrying Capacity', effect: 'woodcutting_carry', bonusType: 'percent', desc: 'More logs per inventory slot', costRes: 'spruce', baseCost: 25 },
        { id: 'multi_log', name: '+% Multi-Log Chance', effect: 'woodcutting_multi', bonusType: 'percent', desc: 'Chance for extra logs', costRes: 'birch', baseCost: 35 },
        { id: 'wc_xp', name: '+% Woodcutting Exp Gain', effect: 'woodcutting_xp', bonusType: 'percent', desc: 'More woodcutting XP', costRes: 'jungle', baseCost: 30 },
      ],
    },
    {
      id: 'fishing', name: 'Fishing Branch', icon: '🎣',
      nodes: [
        { id: 'base_fish_eff', name: '+ Base Fishing Efficiency', effect: 'fishing_yield', bonusType: 'flat', desc: 'Catch more fish per tick', costRes: 'shrimp', baseCost: 30 },
        { id: 'fish_carry', name: '+% Carrying Capacity', effect: 'fishing_carry', bonusType: 'percent', desc: 'More fish per inventory slot', costRes: 'trout', baseCost: 25 },
        { id: 'multi_fish', name: '+% Multi-Catch Chance', effect: 'fishing_multi', bonusType: 'percent', desc: 'Chance for extra fish', costRes: 'salmon', baseCost: 35 },
        { id: 'fish_xp', name: '+% Fishing Exp Gain', effect: 'fishing_xp', bonusType: 'percent', desc: 'More fishing XP', costRes: 'lobster', baseCost: 30 },
      ],
    },
    {
      id: 'utility', name: 'Utility Branch', icon: '✦',
      nodes: [
        { id: 'smelt_speed', name: '+% Smelting Speed', effect: 'smelt_speed', bonusType: 'percent', desc: 'Smelt ore faster', costRes: 'iron_nails', baseCost: 25 },
        { id: 'produce_speed', name: '+% Producing Speed', effect: 'produce_speed', bonusType: 'percent', desc: 'Produce items faster', costRes: 'twine', baseCost: 25 },
        { id: 'smelt_xp', name: '+% Smelting Exp', effect: 'smelt_xp', bonusType: 'percent', desc: 'More smelting XP', costRes: 'copper_bar', baseCost: 30 },
        { id: 'produce_xp', name: '+% Producing Exp', effect: 'produce_xp', bonusType: 'percent', desc: 'More producing XP', costRes: 'wooden_pegs', baseCost: 30 },
        { id: 'multi_smelt', name: '+% Multi Smelting', effect: 'smelt_multi', bonusType: 'percent', desc: 'Chance for extra bars', costRes: 'iron_bar', baseCost: 35 },
        { id: 'multi_produce', name: '+% Multi Producing', effect: 'produce_multi', bonusType: 'percent', desc: 'Chance for extra products', costRes: 'resin', baseCost: 35 },
        { id: 'smelt_capacity', name: '+% Smelting Capacity', effect: 'smelt_capacity', bonusType: 'percent', desc: 'Extra smelting throughput', costRes: 'gold_bar', baseCost: 30 },
        { id: 'produce_capacity', name: '+% Producing Capacity', effect: 'produce_capacity', bonusType: 'percent', desc: 'Extra producing throughput', costRes: 'platinum_bar', baseCost: 30 },
      ],
    },
  ],
};
