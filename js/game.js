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

  SLOT_UNLOCK_AT: [0, 5, 10],
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
/** Worldroot — save/load and state helpers. */

(function () {
  if (!window.WorldrootConfig) {
    console.error('[Worldroot] config.js did not load before state.js');
    return;
  }

  const C = window.WorldrootConfig;
  const { SAVE_KEY, SAVE_KEY_OFFLINE, CLASSES, SLOT_UNLOCK_AT, WORLD_TREE_BRANCHES } = C;

  let playMode = 'offline';

  function getSaveKey() {
    return playMode === 'cloud' ? SAVE_KEY : SAVE_KEY_OFFLINE;
  }

  function setPlayMode(mode) {
    playMode = mode === 'cloud' ? 'cloud' : 'offline';
  }

  function emptySlotArray(count) {
    return Array.from({ length: count }, () => null);
  }

  function emptyUpgrades() {
    const u = {};
    for (const branch of WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) u[node.id] = 0;
    }
    return u;
  }

  function defaultSkill() {
    return { level: 0, xp: 0 };
  }

  function defaultSmeltSlots() {
    return [
      { ore: null, progress: 0, ready: 0, readyBar: null },
      { ore: null, progress: 0, ready: 0, readyBar: null },
      { ore: null, progress: 0, ready: 0, readyBar: null },
      { ore: null, progress: 0, ready: 0, readyBar: null },
    ];
  }

  function defaultProduceSlots() {
    return [
      { item: null, progress: 0, ready: 0 },
      { item: null, progress: 0, ready: 0 },
      { item: null, progress: 0, ready: 0 },
      { item: null, progress: 0, ready: 0 },
    ];
  }

  function defaultRateStats() {
    return { xp: {}, resources: {}, kills: {}, loot: {}, ticks: 0 };
  }

  function createCharacter(classId) {
    return {
      classId,
      skills: {
        combat: defaultSkill(),
        mining: defaultSkill(),
        woodcutting: defaultSkill(),
        fishing: defaultSkill(),
      },
      activity: null,
      target: null,
      inventorySlots: emptySlotArray(C.BASE_INVENTORY_SLOTS),
      extraBagSlots: 0,
    };
  }

  function defaultState() {
    return {
      characters: [],
      gold: 0,
      storageSlots: emptySlotArray(C.BASE_STORAGE_SLOTS),
      upgrades: emptyUpgrades(),
      pendingSlot: 1,
      selectedCharIndex: 0,
      rateStats: defaultRateStats(),
      producing: { skill: defaultSkill(), slots: defaultProduceSlots() },
      smelting: { skill: defaultSkill(), slots: defaultSmeltSlots() },
    };
  }

  function serializeState(state) {
    return {
      characters: state.characters,
      gold: state.gold,
      storageSlots: state.storageSlots,
      upgrades: state.upgrades,
      pendingSlot: state.pendingSlot,
      selectedCharIndex: state.selectedCharIndex,
      rateStats: state.rateStats,
      producing: state.producing,
      smelting: state.smelting,
    };
  }

  function migrateDictToSlots(dict, slotCount) {
    const slots = emptySlotArray(slotCount);
    if (!dict || typeof dict !== 'object') return slots;
    for (const [resourceId, amount] of Object.entries(dict)) {
      if (!amount || amount <= 0) continue;
      let left = amount;
      const max = C.BASE_STACK_SIZE;
      for (let i = 0; i < slots.length && left > 0; i++) {
        if (!slots[i]) {
          const put = Math.min(left, max);
          slots[i] = { resourceId, amount: put };
          left -= put;
        } else if (slots[i].resourceId === resourceId && slots[i].amount < max) {
          const space = max - slots[i].amount;
          const put = Math.min(left, space);
          slots[i].amount += put;
          left -= put;
        }
      }
    }
    return slots;
  }

  function migrateUpgrades(oldUpgrades) {
    const u = emptyUpgrades();
    if (!oldUpgrades || typeof oldUpgrades !== 'object') return u;
    for (const branch of WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        if (oldUpgrades[node.id]) u[node.id] = oldUpgrades[node.id];
      }
    }
    return u;
  }

  function hydrateCharacter(c) {
    let inventorySlots = c.inventorySlots;
    if (!Array.isArray(inventorySlots)) {
      inventorySlots = migrateDictToSlots(c.inventory, C.BASE_INVENTORY_SLOTS);
    }
    while (inventorySlots.length < C.BASE_INVENTORY_SLOTS) inventorySlots.push(null);

    const skills = {
      combat: { ...defaultSkill(), ...c.skills?.combat },
      mining: { ...defaultSkill(), ...c.skills?.mining },
      woodcutting: { ...defaultSkill(), ...c.skills?.woodcutting },
      fishing: { ...defaultSkill(), ...c.skills?.fishing },
    };

    return {
      classId: c.classId,
      activity: c.activity ?? null,
      target: c.target ?? null,
      skills,
      inventorySlots,
      extraBagSlots: c.extraBagSlots ?? 0,
    };
  }

  function hydrateState(data) {
    const state = defaultState();
    state.gold = data.gold ?? 0;

    if (Array.isArray(data.storageSlots)) {
      state.storageSlots = data.storageSlots;
    } else {
      state.storageSlots = migrateDictToSlots(data.storage || data.resources, C.BASE_STORAGE_SLOTS);
    }
    while (state.storageSlots.length < C.BASE_STORAGE_SLOTS) state.storageSlots.push(null);

    state.upgrades = migrateUpgrades(data.upgrades);
    state.pendingSlot = data.pendingSlot ?? (data.characters?.length ? null : 1);
    state.selectedCharIndex = data.selectedCharIndex ?? 0;
    if (data.rateStats) state.rateStats = { ...defaultRateStats(), ...data.rateStats };

    if (data.producing) {
      state.producing = {
        skill: { ...defaultSkill(), ...data.producing.skill },
        slots: (data.producing.slots || defaultProduceSlots()).map((s) => ({
          item: s.item ?? null,
          progress: s.progress ?? 0,
          ready: s.ready ?? 0,
        })),
      };
    }
    if (data.smelting) {
      state.smelting = {
        skill: { ...defaultSkill(), ...data.smelting.skill },
        slots: (data.smelting.slots || defaultSmeltSlots()).map((s) => ({
          ore: s.ore ?? null,
          progress: s.progress ?? 0,
          ready: s.ready ?? 0,
          readyBar: s.readyBar ?? null,
        })),
      };
    }
    if (Array.isArray(data.characters)) {
      state.characters = data.characters.map(hydrateCharacter);
    }
    if (state.selectedCharIndex >= state.characters.length) {
      state.selectedCharIndex = Math.max(0, state.characters.length - 1);
    }
    refreshPendingSlot(state);
    return state;
  }

  function exportSaveData() {
    const raw = localStorage.getItem(getSaveKey());
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    return serializeState(defaultState());
  }

  function importSaveData(data) {
    if (!data || typeof data !== 'object') return;
    localStorage.setItem(getSaveKey(), JSON.stringify(data));
  }

  const XP_BASE = 50;
  const XP_TIER_MULT = [
    { until: 10, mult: 1.35 },
    { until: 20, mult: 1.25 },
    { until: 30, mult: 1.20 },
    { until: 40, mult: 1.15 },
    { until: Infinity, mult: 1.10 },
  ];

  function xpMultiplierForLevel(level) {
    for (const tier of XP_TIER_MULT) {
      if (level < tier.until) return tier.mult;
    }
    return 1.10;
  }

  function xpForLevel(level) {
    let xp = XP_BASE;
    for (let l = 0; l < level; l++) {
      xp *= xpMultiplierForLevel(l);
    }
    return Math.floor(xp);
  }

  function grantXp(skill, amount) {
    skill.xp += amount;
    while (skill.xp >= xpForLevel(skill.level)) {
      skill.xp -= xpForLevel(skill.level);
      skill.level += 1;
    }
  }

  function characterTotalLevel(char) {
    if (!char?.skills) return 0;
    return Object.values(char.skills).reduce((sum, sk) => sum + (sk?.level ?? 0), 0);
  }

  function accountTotalLevel(state) {
    return state.characters.reduce((sum, c) => sum + characterTotalLevel(c), 0);
  }

  function maxUnlockedSlots(accountLevel) {
    let slots = 1;
    for (let i = 1; i < SLOT_UNLOCK_AT.length; i++) {
      if (accountLevel >= SLOT_UNLOCK_AT[i]) slots = i + 1;
    }
    return slots;
  }

  function nextSlotUnlock(accountLevel) {
    for (let i = 1; i < SLOT_UNLOCK_AT.length; i++) {
      if (accountLevel < SLOT_UNLOCK_AT[i]) return { slot: i + 1, at: SLOT_UNLOCK_AT[i] };
    }
    return null;
  }

  function carryEffectForSkill(skillId) {
    return C.CARRY_EFFECT_BY_SKILL[skillId] || 'carry_capacity';
  }

  const RESOURCE_SKILL_MAP = {
    copper: 'mining', iron: 'mining', gold: 'mining', platinum: 'mining',
    copper_bar: 'mining', iron_bar: 'mining', gold_bar: 'mining', platinum_bar: 'mining',
    oak: 'woodcutting', spruce: 'woodcutting', birch: 'woodcutting', jungle: 'woodcutting',
    shrimp: 'fishing', trout: 'fishing', salmon: 'fishing', lobster: 'fishing',
    slime_gel: 'combat', goblin_ear: 'combat', wolf_fur: 'combat', bandit_emblem: 'combat',
    twine: 'producing', wooden_pegs: 'producing', iron_nails: 'producing', resin: 'producing',
  };

  function stackCapacity(state, skillId) {
    const effect = carryEffectForSkill(skillId);
    const bonus = window.WorldrootEngine?.effectBonus(state, effect) || 0;
    return Math.floor(C.BASE_STACK_SIZE * (1 + bonus));
  }

  function stackCapacityForResource(state, resourceId) {
    const skillId = RESOURCE_SKILL_MAP[resourceId] || 'combat';
    return stackCapacity(state, skillId);
  }

  function inventorySlotCount(char) {
    return C.BASE_INVENTORY_SLOTS + (char.extraBagSlots || 0);
  }

  function countInSlots(slots, resourceId) {
    return slots.reduce((sum, s) => (s?.resourceId === resourceId ? sum + s.amount : sum), 0);
  }

  function countEmptySlots(slots) {
    return slots.filter((s) => !s).length;
  }

  function addToSlots(slots, resourceId, amount, maxStack, maxSlots) {
    let left = amount;
    let added = 0;

    for (let i = 0; i < maxSlots && left > 0; i++) {
      const slot = slots[i];
      if (!slot) continue;
      if (slot.resourceId !== resourceId || slot.amount >= maxStack) continue;
      const space = maxStack - slot.amount;
      const put = Math.min(left, space);
      slot.amount += put;
      left -= put;
      added += put;
    }

    for (let i = 0; i < maxSlots && left > 0; i++) {
      if (slots[i]) continue;
      const put = Math.min(left, maxStack);
      slots[i] = { resourceId, amount: put };
      left -= put;
      added += put;
    }

    return { added, lost: left };
  }

  function removeFromSlots(slots, resourceId, amount) {
    let left = amount;
    for (let i = slots.length - 1; i >= 0 && left > 0; i--) {
      const slot = slots[i];
      if (!slot || slot.resourceId !== resourceId) continue;
      const take = Math.min(left, slot.amount);
      slot.amount -= take;
      left -= take;
      if (slot.amount <= 0) slots[i] = null;
    }
    return amount - left;
  }

  function addToInventory(char, state, resourceId, amount, skillId) {
    const maxStack = stackCapacity(state, skillId || RESOURCE_SKILL_MAP[resourceId] || 'combat');
    const slots = char.inventorySlots;
    const maxSlots = inventorySlotCount(char);
    return addToSlots(slots, resourceId, amount, maxStack, maxSlots);
  }

  function addToStorage(state, resourceId, amount) {
    const maxStack = C.BASE_STACK_SIZE;
    return addToSlots(state.storageSlots, resourceId, amount, maxStack, state.storageSlots.length);
  }

  function storageHas(state, resourceId, amount) {
    return countInSlots(state.storageSlots, resourceId) >= amount;
  }

  function removeFromStorage(state, resourceId, amount) {
    return removeFromSlots(state.storageSlots, resourceId, amount);
  }

  function loadState() {
    const keys = [
      getSaveKey(), 'worldroot_save_v3', 'worldroot_save_offline_v3',
      'worldroot_save_v2', 'worldroot_save_offline_v2',
    ];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (key !== getSaveKey()) localStorage.setItem(getSaveKey(), JSON.stringify(data));
        return hydrateState(data);
      } catch { /* try next */ }
    }
    return defaultState();
  }

  function saveState(state) {
    localStorage.setItem(getSaveKey(), JSON.stringify(serializeState(state)));
  }

  function resetState() {
    for (const k of [getSaveKey(), 'worldroot_save_v3', 'worldroot_save_offline_v3', 'worldroot_save_v2', 'worldroot_save_offline_v2']) {
      localStorage.removeItem(k);
    }
    return defaultState();
  }

  function refreshPendingSlot(state) {
    if (state.pendingSlot) return;
    const account = accountTotalLevel(state);
    const allowed = maxUnlockedSlots(account);
    if (state.characters.length < allowed) state.pendingSlot = state.characters.length + 1;
  }

  function addCharacter(state, classId) {
    if (!CLASSES[classId]) return false;
    state.characters.push(createCharacter(classId));
    if (state.characters.length === 1) state.selectedCharIndex = 0;
    state.pendingSlot = null;
    refreshPendingSlot(state);
    saveState(state);
    return true;
  }

  function selectCharacter(state, index) {
    if (index < 0 || index >= state.characters.length) return;
    state.selectedCharIndex = index;
    saveState(state);
  }

  function getSelectedCharacter(state) {
    return state.characters[state.selectedCharIndex] ?? null;
  }

  function setActivity(state, charIndex, activityId, targetId) {
    const char = state.characters[charIndex];
    if (!char) return;
    char.activity = activityId;
    char.target = targetId ?? null;
    saveState(state);
  }

  function stopActivity(state, charIndex) {
    const char = state.characters[charIndex];
    if (!char) return;
    char.activity = null;
    char.target = null;
    saveState(state);
  }

  function recordRateEvent(state, event) {
    const rs = state.rateStats;
    const win = C.RATE_WINDOW_TICKS;
    if (event.xpGain && event.skill) rs.xp[event.skill] = (rs.xp[event.skill] || 0) + event.xpGain;
    if (event.resource && event.resourceAmount) rs.resources[event.resource] = (rs.resources[event.resource] || 0) + event.resourceAmount;
    if (event.kill && event.monster) rs.kills[event.monster] = (rs.kills[event.monster] || 0) + 1;
    if (event.loot && event.lootAmount) rs.loot[event.loot] = (rs.loot[event.loot] || 0) + event.lootAmount;
    rs.ticks += 1;
    if (rs.ticks >= win) {
      rs.xp = {};
      rs.resources = {};
      rs.kills = {};
      rs.loot = {};
      rs.ticks = 0;
    }
  }

  window.WorldrootState = {
    defaultState, loadState, saveState, resetState, exportSaveData, importSaveData,
    setPlayMode, getSaveKey, createCharacter, xpForLevel, grantXp,
    characterTotalLevel, accountTotalLevel, maxUnlockedSlots, nextSlotUnlock,
    refreshPendingSlot, addCharacter, selectCharacter, getSelectedCharacter,
    setActivity, stopActivity, emptyUpgrades, recordRateEvent, migrateUpgrades,
    defaultSmeltSlots, defaultProduceSlots, emptySlotArray,
    stackCapacity, inventorySlotCount, countInSlots, countEmptySlots,
    addToInventory, addToStorage, removeFromStorage, storageHas,
    addToSlots, removeFromSlots, carryEffectForSkill, stackCapacityForResource,
  };
})();
/** Worldroot — tick logic, resources, upgrades. */

(function () {
  if (!window.WorldrootConfig) {
    console.error('[Worldroot] config.js did not load before engine.js');
    return;
  }

  const C = window.WorldrootConfig;
  const S = window.WorldrootState;

  function upgradeLevel(state, nodeId) {
    return state.upgrades[nodeId] || 0;
  }

  function upgradeCosts(nodeId, currentLevel) {
    const found = findUpgradeNode(nodeId);
    if (!found) return {};
    const { node } = found;
    const scale = 1 + currentLevel * 0.15;
    return { [node.costRes]: Math.max(1, Math.floor(node.baseCost * scale)) };
  }

  function upgradeBonusDisplay(state, node) {
    const lv = upgradeLevel(state, node.id);
    if (node.bonusType === 'flat') {
      return { text: `+${lv * C.UPGRADE_FLAT_PER_LEVEL}`, isPercent: false };
    }
    return { text: `+${(lv * C.UPGRADE_BONUS_PER_LEVEL * 100).toFixed(0)}%`, isPercent: true };
  }

  function upgradeBonusPercent(state, nodeId) {
    const node = findUpgradeNode(nodeId)?.node;
    if (!node) return 0;
    const d = upgradeBonusDisplay(state, node);
    return d.isPercent ? parseFloat(d.text) : upgradeLevel(state, nodeId) * C.UPGRADE_FLAT_PER_LEVEL;
  }

  function effectBonus(state, effectType) {
    let bonus = 0;
    for (const branch of C.WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        if (node.effect !== effectType) continue;
        if (node.bonusType === 'flat') {
          bonus += upgradeLevel(state, node.id) * C.UPGRADE_FLAT_PER_LEVEL;
        } else {
          bonus += upgradeLevel(state, node.id) * C.UPGRADE_BONUS_PER_LEVEL;
        }
      }
    }
    return bonus;
  }

  function skillXpBonus(state, skillId) {
    return effectBonus(state, `${skillId}_xp`);
  }

  function skillYieldBonus(state, skillId) {
    return effectBonus(state, `${skillId}_yield`);
  }

  function skillMultiBonus(state, skillId) {
    return effectBonus(state, `${skillId}_multi`);
  }

  function charStat(state, char, statName) {
    const cls = C.CLASSES[char.classId];
    const base = cls?.baseStats?.[statName] ?? 0;
    return base + effectBonus(state, statName);
  }

  function gatherStatMult(state, char, skillId) {
    const sk = C.SKILLS[skillId];
    const statName = sk?.gatherStat || C.CLASSES[char.classId]?.gatherStat || 'strength';
    const stat = charStat(state, char, statName);
    return 1 + stat * C.STAT_SCALE;
  }

  function combatDamageMult(state, char) {
    const cls = C.CLASSES[char.classId];
    const statName = cls?.combatStat || 'strength';
    const stat = charStat(state, char, statName);
    const baseDmg = effectBonus(state, 'base_damage');
    const pctDmg = effectBonus(state, 'pct_damage');
    return (1 + stat * C.STAT_SCALE) * (1 + pctDmg) + baseDmg * 0.01;
  }

  function findVein(skillId, targetId) {
    const veins = C.VEINS[skillId];
    if (!veins) return null;
    return veins.find((v) => v.id === targetId) ?? veins[0];
  }

  function findMonster(targetId) {
    return C.MONSTERS.find((m) => m.id === targetId) ?? C.MONSTERS[0];
  }

  function canAffordUpgrade(state, nodeId) {
    const costs = upgradeCosts(nodeId, upgradeLevel(state, nodeId));
    return Object.entries(costs).every(([res, amt]) => S.storageHas(state, res, amt));
  }

  function skillSpeed(state, skillId, char) {
    const skill = char.skills[skillId];
    const lv = skill?.level ?? 0;
    const yieldB = skillYieldBonus(state, skillId);
    const statM = gatherStatMult(state, char, skillId);
    return Math.floor((1 + lv * 0.05 + yieldB) * statM * 100) / 100;
  }

  function smeltSlotsUnlocked(state) {
    return C.SMELT_SLOT_UNLOCKS.filter((req) => state.smelting.skill.level >= req).length;
  }

  function produceSlotsUnlocked(state) {
    return C.UNLOCK_LEVELS.filter((req) => state.producing.skill.level >= req).length;
  }

  function tickSmelting(state) {
    const slotsOpen = smeltSlotsUnlocked(state);
    const speedMult = 1 + effectBonus(state, 'smelt_speed');
    const xpMult = 1 + effectBonus(state, 'smelt_xp');
    const multiMult = effectBonus(state, 'smelt_multi');

    for (let i = 0; i < slotsOpen; i++) {
      const slot = state.smelting.slots[i];
      if (!slot.ore) continue;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      if (!recipe) continue;

      const ticksNeeded = Math.max(3, Math.floor(C.SMELT_TICKS_PER_ORE / speedMult));
      slot.progress += 1;
      if (slot.progress < ticksNeeded) continue;

      if (!S.storageHas(state, slot.ore, 1)) {
        slot.progress = 0;
        continue;
      }

      S.removeFromStorage(state, slot.ore, 1);
      let bars = 1;
      if (Math.random() < multiMult * 0.1) bars += 1;
      slot.ready = (slot.ready || 0) + bars;
      slot.readyBar = recipe.bar;
      S.grantXp(state.smelting.skill, Math.floor(C.BASE_XP_PER_TICK * xpMult));
      slot.progress = 0;
    }
  }

  function tickProducing(state) {
    const slotsOpen = produceSlotsUnlocked(state);
    const speedMult = 1 + effectBonus(state, 'produce_speed');
    const xpMult = 1 + effectBonus(state, 'produce_xp');
    const multiMult = effectBonus(state, 'produce_multi');
    const capMult = 1 + effectBonus(state, 'produce_capacity');

    for (let i = 0; i < slotsOpen; i++) {
      const slot = state.producing.slots[i];
      if (!slot.item) continue;
      const def = C.PRODUCE_ITEMS.find((p) => p.id === slot.item);
      if (!def || state.producing.skill.level < def.minLevel) continue;

      const ticksNeeded = Math.max(3, Math.floor(def.ticks / (speedMult * capMult)));
      slot.progress += 1;
      if (slot.progress < ticksNeeded) continue;

      let output = def.output;
      if (Math.random() < multiMult * 0.1) output += 1;
      slot.ready = (slot.ready || 0) + output;
      S.grantXp(state.producing.skill, Math.floor(def.xp * xpMult));
      slot.progress = 0;
    }
  }

  function tickCharacter(state, char) {
    if (!char.activity) return null;

    const activity = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!activity) return null;

    const skillId = activity.skill;
    const skill = char.skills[skillId];
    if (!skill) return null;

    const xpMult = 1 + skillXpBonus(state, skillId);
    const xpGain = Math.floor(C.BASE_XP_PER_TICK * xpMult);
    S.grantXp(skill, xpGain);

    const event = {
      charClass: char.classId, activity: char.activity, target: char.target,
      xpGain, skill: skillId, resource: null, resourceAmount: 0, gold: 0,
      kill: false, monster: null, loot: null, lootAmount: 0, lost: 0,
    };

    if (char.activity === 'combat') {
      const monster = findMonster(char.target);
      if (skill.level < monster.level) return event;

      const goldMult = 1 + effectBonus(state, 'gold_gain');
      const dropMult = 1 + effectBonus(state, 'drop_rate');
      event.kill = true;
      event.monster = monster.id;

      if (monster.drop) {
        const dropAmt = Math.max(1, Math.floor(monster.drop.amount * dropMult));
        const result = S.addToInventory(char, state, monster.drop.id, dropAmt, 'combat');
        event.loot = monster.drop.id;
        event.lootAmount = result.added;
        event.lost = result.lost;
      }

      const dmgM = combatDamageMult(state, char);
      const goldGain = Math.floor((monster.level + 1) * 0.5 * goldMult * dmgM);
      if (goldGain > 0) {
        state.gold += goldGain;
        event.gold = goldGain;
      }
      return event;
    }

    const vein = findVein(skillId, char.target);
    if (!vein || skill.level < vein.minLevel) return event;

    const speed = skillSpeed(state, skillId, char);
    const multiMult = skillMultiBonus(state, skillId);
    let amount = Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * speed));
    if (Math.random() < multiMult * 0.1) {
      amount += Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * gatherStatMult(state, char, skillId)));
    }

    const result = S.addToInventory(char, state, vein.resource, amount, skillId);
    event.resource = vein.resource;
    event.resourceAmount = result.added;
    event.lost = result.lost;
    return event;
  }

  function tick(state) {
    S.refreshPendingSlot(state);
    tickSmelting(state);
    tickProducing(state);
    const events = [];
    for (const char of state.characters) {
      const ev = tickCharacter(state, char);
      if (ev) {
        S.recordRateEvent(state, ev);
        events.push(ev);
      }
    }
    S.saveState(state);
    return events;
  }

  function buyUpgrade(state, nodeId) {
    const current = upgradeLevel(state, nodeId);
    const costs = upgradeCosts(nodeId, current);
    if (!Object.keys(costs).length) return false;
    for (const [res, amt] of Object.entries(costs)) {
      if (!S.storageHas(state, res, amt)) return false;
    }
    for (const [res, amt] of Object.entries(costs)) S.removeFromStorage(state, res, amt);
    state.upgrades[nodeId] = current + 1;
    S.saveState(state);
    return true;
  }

  function getRatePerHour(state, bucket, key) {
    const rs = state.rateStats;
    const ticks = Math.max(rs.ticks, 1);
    const perTick = (rs[bucket]?.[key] || 0) / ticks;
    return Math.floor(perTick * (3600000 / C.TICK_MS));
  }

  function findUpgradeNode(nodeId) {
    for (const branch of C.WORLD_TREE_BRANCHES) {
      const node = branch.nodes.find((n) => n.id === nodeId);
      if (node) return { branch, node };
    }
    return null;
  }

  function setSmeltSlot(state, slotIndex, oreId) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot) return false;
    slot.ore = oreId;
    slot.progress = 0;
    slot.ready = 0;
    slot.readyBar = null;
    S.saveState(state);
    return true;
  }

  function setProduceSlot(state, slotIndex, itemId) {
    const slot = state.producing.slots[slotIndex];
    if (!slot) return false;
    slot.item = itemId;
    slot.progress = 0;
    slot.ready = 0;
    S.saveState(state);
    return true;
  }

  function clearSmeltSlot(state, slotIndex) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot) return;
    slot.ore = null;
    slot.progress = 0;
    slot.ready = 0;
    slot.readyBar = null;
    S.saveState(state);
  }

  function clearProduceSlot(state, slotIndex) {
    const slot = state.producing.slots[slotIndex];
    if (!slot) return;
    slot.item = null;
    slot.progress = 0;
    slot.ready = 0;
    S.saveState(state);
  }

  function collectProduce(state, slotIndex, charIndex) {
    const slot = state.producing.slots[slotIndex];
    const char = state.characters[charIndex];
    if (!slot?.ready || !char || !slot.item) return { collected: 0, lost: 0 };

    const result = S.addToInventory(char, state, slot.item, slot.ready, 'producing');
    const collected = result.added;
    slot.ready -= collected;
    if (slot.ready <= 0) slot.ready = 0;
    S.saveState(state);
    return { collected, lost: result.lost };
  }

  function collectSmelt(state, slotIndex) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot?.ready || !slot.readyBar) return 0;
    const result = S.addToStorage(state, slot.readyBar, slot.ready);
    const collected = result.added;
    slot.ready -= collected;
    if (slot.ready <= 0) {
      slot.ready = 0;
      slot.readyBar = null;
    }
    S.saveState(state);
    return collected;
  }

  window.WorldrootEngine = {
    upgradeLevel, upgradeCosts, upgradeBonusDisplay, upgradeBonusPercent, effectBonus,
    skillXpBonus, skillYieldBonus, skillMultiBonus, skillSpeed,
    charStat, gatherStatMult, combatDamageMult,
    tick, buyUpgrade, canAffordUpgrade, findVein, findMonster,
    getRatePerHour, findUpgradeNode, smeltSlotsUnlocked, produceSlotsUnlocked,
    setSmeltSlot, setProduceSlot, clearSmeltSlot, clearProduceSlot,
    collectProduce, collectSmelt,
  };
})();
/** Worldroot — sidebar Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const SIDEBAR_NAV = C?.SIDEBAR_NAV ?? [];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activePage = 'characters';
  let selectedUpgradeId = null;
  let logBuffer = [];

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.floor(n).toLocaleString(); }
  function resName(id) { return C.RESOURCE_NAMES?.[id] ?? id; }
  function resIcon(id) { return C.RESOURCE_ICONS?.[id] ?? '📦'; }
  function skillName(id) { return C.SKILLS[id]?.name ?? id; }

  function renderSlotGrid(slots, maxSlots, isInventory) {
    let html = '';
    for (let i = 0; i < maxSlots; i++) {
      const slot = slots[i];
      if (!slot) {
        html += `<div class="item-slot empty"><span class="item-slot-empty">+</span></div>`;
      } else {
        const maxStack = isInventory
          ? S.stackCapacityForResource(state, slot.resourceId)
          : C.BASE_STACK_SIZE;
        html += `
          <div class="item-slot filled" title="${resName(slot.resourceId)}">
            <span class="item-slot-qty">${fmt(slot.amount)}</span>
            <span class="item-slot-icon">${resIcon(slot.resourceId)}</span>
            <span class="item-slot-name">${resName(slot.resourceId)}</span>
            <span class="item-slot-max">/${maxStack}</span>
          </div>`;
      }
    }
    return `<div class="item-slot-grid">${html}</div>`;
  }

  function selectedIndex() {
    return state?.selectedCharIndex ?? 0;
  }

  function selectedChar() {
    return S.getSelectedCharacter(state);
  }

  function charLabel(char) {
    const cls = C.CLASSES[char.classId];
    return cls ? `${cls.icon} ${cls.name}` : 'Character';
  }

  function activityLabel(char) {
    if (!char?.activity) return 'Idle';
    const act = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!act) return 'Idle';
    if (char.activity === 'combat' && char.target) {
      const mob = C.MONSTERS.find((m) => m.id === char.target);
      return mob ? `Fighting ${mob.name}` : act.label;
    }
    const veins = C.VEINS[char.activity];
    const vein = veins?.find((v) => v.id === char.target);
    return vein ? vein.name : act.label;
  }

  function bestSkillLevel(skillId) {
    if (!state.characters.length) return 0;
    return Math.max(...state.characters.map((c) => c.skills[skillId]?.level ?? 0));
  }

  function charSkillLevel(char, skillId) {
    return char?.skills[skillId]?.level ?? 0;
  }

  function xpProgress(skill) {
    const needed = S.xpForLevel(skill.level);
    return needed ? Math.min(100, (skill.xp / needed) * 100) : 0;
  }

  function addLog(text) {
    logBuffer.unshift(text);
    if (logBuffer.length > 20) logBuffer.length = 20;
    const log = $('activity-log');
    if (log) log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  function renderLogEl() {
    const log = $('activity-log');
    if (log) log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  /* ── Navigation ── */

  function switchPage(pageId) {
    const item = SIDEBAR_NAV.find((n) => n.id === pageId);
    if (item?.comingSoon) return;
    activePage = pageId;
    renderSidebar();
    renderMainPanel();
  }

  function renderSidebar() {
    const el = $('sidebar');
    if (!el) return;
    let html = '';
    let section = '';
    for (const item of SIDEBAR_NAV) {
      if (item.type === 'section') {
        section = item.label;
        html += `<div class="sidebar-section-label">${item.label}</div>`;
        continue;
      }
      if (item.type === 'divider') {
        html += '<div class="sidebar-divider"></div>';
        continue;
      }
      const isActive = item.id === activePage;
      const soon = item.comingSoon ? ' coming-soon' : '';
      const badge = item.comingSoon ? '<span class="sidebar-btn-badge">Soon</span>' : '';
      const sel = item.id === 'characters' && selectedChar()
        ? `<span class="sidebar-btn-badge">${charLabel(selectedChar()).split(' ')[0]}</span>` : '';
      html += `
        <button type="button" class="sidebar-btn${isActive ? ' active' : ''}${soon}"
          data-action="switch-page" data-page="${item.id}" ${item.comingSoon ? 'disabled' : ''}>
          <span class="sidebar-btn-icon">${item.icon}</span>
          <span class="sidebar-btn-label">${item.label}</span>
          ${badge || sel}
        </button>`;
    }
    el.innerHTML = html;
  }

  function renderHud() {
    const acct = $('account-level');
    const gold = $('gold-total');
    const notif = $('notification-count');
    if (acct) acct.textContent = fmt(S.accountTotalLevel(state));
    if (gold) gold.textContent = fmt(state.gold);
    if (notif) notif.textContent = state.pendingSlot ? '1' : '0';
  }

  function assignSelected(activity, targetId) {
    const idx = selectedIndex();
    if (!state.characters[idx]) return;
    S.setActivity(state, idx, activity, targetId);
    addLog(`${charLabel(state.characters[idx])} → ${activityLabel(state.characters[idx])}`);
    render();
  }

  function renderAssignBtn(activity, targetId, locked) {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character first.</p>';
    if (locked) return '';
    const on = char.activity === activity && char.target === targetId;
    return `<button type="button" class="btn-sm ${on ? 'active' : 'primary'}"
      data-action="assign-selected" data-activity="${activity}" data-target="${targetId}">
      ${on ? 'Active ✓' : `Assign ${charLabel(char)}`}
    </button>`;
  }

  /* ── Characters ── */

  function renderCharactersPanel() {
    const sel = selectedIndex();
    const rail = state.characters.map((char, i) => {
      const cls = C.CLASSES[char.classId];
      const active = i === sel;
      return `
        <button type="button" class="char-rail-btn${active ? ' active' : ''}"
          data-action="select-char" data-char="${i}">
          <span class="char-rail-icon">${cls.icon}</span>
          <span class="char-rail-name">${cls.name}</span>
          <span class="char-rail-lv">Lv ${S.characterTotalLevel(char)}</span>
        </button>`;
    }).join('');

    const char = selectedChar();
    let detail = '<p class="empty-msg">Choose a class to begin.</p>';
    if (char) {
      const cls = C.CLASSES[char.classId];
      const skills = ['combat', 'mining', 'woodcutting', 'fishing'].map((sid) => {
        const sk = C.SKILLS[sid];
        const lv = charSkillLevel(char, sid);
        return `
          <div class="char-skill-item">
            <span class="char-skill-icon">${sk.icon}</span>
            <span class="char-skill-name">${sk.name}</span>
            <span class="char-skill-lv">${lv}</span>
            <div class="progress-bar mini"><div class="progress-bar-fill" style="width:${xpProgress(char.skills[sid])}%"></div></div>
          </div>`;
      }).join('');

      const str = E.charStat(state, char, 'strength').toFixed(1);
      const agi = E.charStat(state, char, 'agility').toFixed(1);
      const mag = E.charStat(state, char, 'magic').toFixed(1);

      detail = `
        <div class="char-detail-head">
          <div class="char-portrait lg">${cls.icon}</div>
          <div>
            <h2>${cls.name}</h2>
            <p class="char-meta">${cls.desc}</p>
            <div class="char-activity-pill ${char.activity ? 'active' : ''}">▶ ${activityLabel(char)}</div>
          </div>
          <div class="char-total-badge"><span>Total</span><strong>${S.characterTotalLevel(char)}</strong></div>
        </div>
        <div class="char-stats-row" style="margin-bottom:12px">
          <span class="char-stat"><em>STR</em> ${str}</span>
          <span class="char-stat"><em>AGI</em> ${agi}</span>
          <span class="char-stat"><em>MAG</em> ${mag}</span>
        </div>
        <div class="char-skills-grid">${skills}</div>
        <p class="hint-bar">Select this hero, then open a skill page to assign them. Full inventory = lost loot.</p>
        <button type="button" class="btn-xs ghost" data-action="stop-selected">Stop activity</button>`;
    }

    const account = S.accountTotalLevel(state);
    const slots = [];
    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
      if (state.characters.length >= slot) continue;
      const unlockAt = C.SLOT_UNLOCK_AT[slot - 1] ?? 999;
      const ready = account >= unlockAt && state.characters.length === slot - 1;
      slots.push(ready && state.pendingSlot === slot
        ? `<div class="slot-locked slot-ready"><span>Slot ${slot}</span>
            <button type="button" class="btn-xs primary" data-action="open-class" data-slot="${slot}">Choose class</button></div>`
        : `<div class="slot-locked"><span>🔒 Slot ${slot}</span><span class="slot-req">Acct Lv ${unlockAt}</span></div>`);
    }

    return `
      <header class="page-header">
        <span class="page-header-icon">👥</span>
        <div class="page-header-text"><h1>Characters</h1><p>Select a hero to control their activities</p></div>
      </header>
      <div class="char-layout">
        <aside class="char-rail">${rail || '<p class="empty-msg">No heroes yet</p>'}</aside>
        <section class="char-detail">${detail}</section>
      </div>
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── Inventory & Storage ── */

  function renderInventoryPanel() {
    const char = selectedChar();
    if (!char) return '<p class="empty-msg">Select a character from the Characters page.</p>';
    const slotCount = S.inventorySlotCount(char);
    const filled = char.inventorySlots.filter(Boolean).length;
    return `
      <header class="page-header">
        <span class="page-header-icon">🎒</span>
        <div class="page-header-text">
          <h1>${charLabel(char)}'s Inventory</h1>
          <p>${filled} / ${slotCount} slots · overflow is lost</p>
        </div>
      </header>
      ${renderSlotGrid(char.inventorySlots, slotCount, true)}`;
  }

  function renderStoragePanel() {
    const filled = state.storageSlots.filter(Boolean).length;

    return `
      <header class="page-header">
        <span class="page-header-icon">📦</span>
        <div class="page-header-text">
          <h1>Storage</h1>
          <p>${filled} / ${state.storageSlots.length} slots · shared by all characters</p>
        </div>
      </header>
      ${renderSlotGrid(state.storageSlots, state.storageSlots.length, false)}`;
  }

  /* ── Combat ── */

  function renderCombatPage(sk) {
    const char = selectedChar();
    const best = char ? charSkillLevel(char, 'combat') : bestSkillLevel('combat');
    const cards = C.MONSTERS.map((mob) => {
      const xpHr = E.getRatePerHour(state, 'xp', 'combat');
      const killsHr = E.getRatePerHour(state, 'kills', mob.id);
      const lootHr = mob.drop ? E.getRatePerHour(state, 'loot', mob.drop.id) : 0;
      const locked = best < mob.level;
      const on = char?.activity === 'combat' && char?.target === mob.id;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${mob.icon}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Lv ${mob.level}${mob.drop ? ` · ${mob.drop.name}` : ''}</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(xpHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Kills/hr</span><span class="activity-stat-value">${fmt(killsHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">Loot/hr</span><span class="activity-stat-value">${fmt(lootHr)}</span></div>
          </div>
          ${locked ? `<p class="empty-msg">Requires Combat Lv ${mob.level}</p>` : `<div class="activity-actions">${renderAssignBtn('combat', mob.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Active on selected hero</strong></p>' : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc}</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Combat Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Gathering ── */

  function renderGatheringPage(sk) {
    const veins = C.VEINS[sk.id] ?? [];
    const char = selectedChar();
    const best = char ? charSkillLevel(char, sk.id) : bestSkillLevel(sk.id);
    const speed = char ? E.skillSpeed(state, sk.id, char) : 1;

    const cards = veins.map((vein) => {
      const xpHr = E.getRatePerHour(state, 'xp', sk.id);
      const resHr = E.getRatePerHour(state, 'resources', vein.resource);
      const locked = best < vein.minLevel;
      const on = char?.activity === sk.activity && char?.target === vein.id;
      const pct = char ? xpProgress(char.skills[sk.id]) : 0;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${vein.icon}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>${resName(vein.resource)} · Lv ${vein.minLevel}</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat"><span class="activity-stat-label">${sk.name} Speed</span><span class="activity-stat-value">${speed.toFixed(2)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">XP/hr</span><span class="activity-stat-value">${fmt(xpHr)}</span></div>
            <div class="activity-stat"><span class="activity-stat-label">${resName(vein.resource)}/hr</span><span class="activity-stat-value">${fmt(resHr)}</span></div>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          ${locked ? `<p class="empty-msg">Requires ${sk.name} Lv ${vein.minLevel}</p>` : `<div class="activity-actions">${renderAssignBtn(sk.activity, vein.id, false)}</div>`}
          ${on ? '<p class="activity-assigned"><strong>Active on selected hero</strong></p>' : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>${sk.desc}</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">${sk.name} Lv</span><span class="page-header-stat-value">${best}</span></div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Smelting ── */

  function renderSmeltingPage(sk) {
    const lv = state.smelting.skill.level;
    const slotsOpen = E.smeltSlotsUnlocked(state);
    const slotCards = state.smelting.slots.map((slot, i) => {
      const locked = i >= slotsOpen;
      if (locked) return `<div class="activity-card locked"><strong>Slot ${i + 1}</strong><p class="empty-msg">Unlocks at Smelting Lv ${C.SMELT_SLOT_UNLOCKS[i]}</p></div>`;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      const pct = slot.ore ? Math.min(100, (slot.progress / C.SMELT_TICKS_PER_ORE) * 100) : 0;
      const oreOpts = C.SMELT_RECIPES.map((r) =>
        `<option value="${r.ore}" ${slot.ore === r.ore ? 'selected' : ''}>${r.name}</option>`
      ).join('');

      const readyBtn = slot.ready > 0
        ? `<button type="button" class="btn-sm primary" data-action="collect-smelt" data-slot="${i}">
            Collect ${fmt(slot.ready)} ${resName(slot.readyBar)} → Storage
          </button>` : '';

      return `
        <article class="activity-card">
          <strong>Smelter Slot ${i + 1}</strong>
          <select class="slot-select" data-action="set-smelt" data-slot="${i}">
            <option value="">— Select ore —</option>${oreOpts}
          </select>
          ${slot.ore ? `<div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Smelting ${recipe?.name ?? slot.ore}… (uses Storage ore)</p>` : ''}
          ${readyBtn}
          ${slot.ore ? `<button type="button" class="btn-xs ghost" data-action="clear-smelt" data-slot="${i}">Clear</button>` : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Smelt ore into bars — runs passively while heroes work elsewhere</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Smelting Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      <div class="activity-grid">${slotCards}</div>`;
  }

  /* ── Producing ── */

  function renderProducingPage(sk) {
    const lv = state.producing.skill.level;
    const slotsOpen = E.produceSlotsUnlocked(state);
    const slotCards = state.producing.slots.map((slot, i) => {
      const locked = i >= slotsOpen;
      if (locked) return `<div class="activity-card locked"><strong>Slot ${i + 1}</strong><p class="empty-msg">Unlocks at Producing Lv ${C.UNLOCK_LEVELS[i]}</p></div>`;
      const def = C.PRODUCE_ITEMS.find((p) => p.id === slot.item);
      const pct = slot.item && def ? Math.min(100, (slot.progress / def.ticks) * 100) : 0;
      const itemOpts = C.PRODUCE_ITEMS.map((p) => {
        const ok = lv >= p.minLevel;
        return `<option value="${p.id}" ${slot.item === p.id ? 'selected' : ''} ${ok ? '' : 'disabled'}>${p.name} (Lv ${p.minLevel})</option>`;
      }).join('');

      const readyBtn = slot.ready > 0
        ? `<button type="button" class="btn-sm primary" data-action="collect-produce" data-slot="${i}">
            Collect ${fmt(slot.ready)} ${def?.name ?? slot.item} → Inventory
          </button>` : '';

      return `
        <article class="activity-card">
          <strong>Producer Slot ${i + 1}</strong>
          <select class="slot-select" data-action="set-produce" data-slot="${i}">
            <option value="">— Select product —</option>${itemOpts}
          </select>
          ${slot.item ? `<div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            <p class="empty-msg">Producing ${def?.name ?? slot.item}…${slot.ready ? ` · ${slot.ready} ready` : ''}</p>` : ''}
          ${readyBtn}
          ${slot.item ? `<button type="button" class="btn-xs ghost" data-action="clear-produce" data-slot="${i}">Clear</button>` : ''}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text"><h1>${sk.name}</h1><p>Passive production — collect items into your selected hero's inventory</p></div>
        <div class="page-header-stat"><span class="page-header-stat-label">Producing Lv</span><span class="page-header-stat-value">${lv}</span></div>
      </header>
      <div class="activity-grid">${slotCards}</div>`;
  }

  function renderComingSoon(sk) {
    return `<div class="coming-soon-panel"><span class="coming-soon-icon">${sk.icon}</span><h2>${sk.name}</h2><p>${sk.desc}</p><p style="margin-top:12px">Coming in a future update.</p></div>`;
  }

  function renderSkillPage(skillId) {
    const sk = C.SKILLS[skillId];
    if (!sk) return '<p class="empty-msg">Unknown skill.</p>';
    if (sk.comingSoon) return renderComingSoon(sk);
    if (skillId === 'combat') return renderCombatPage(sk);
    if (skillId === 'smelting') return renderSmeltingPage(sk);
    if (skillId === 'producing') return renderProducingPage(sk);
    return renderGatheringPage(sk);
  }

  /* ── World Tree ── */

  function renderWorldTreePanel() {
    const branches = C.WORLD_TREE_BRANCHES.map((branch) => {
      const cards = branch.nodes.map((node) => {
        const lv = E.upgradeLevel(state, node.id);
        const bonus = E.upgradeBonusDisplay(state, node);
        const bonusClass = bonus.isPercent ? 'upgrade-card-bonus' : 'upgrade-card-bonus flat';
        return `
          <button type="button" class="upgrade-card" data-action="open-upgrade" data-upgrade="${node.id}">
            <span class="upgrade-card-name">${node.name}</span>
            <span class="upgrade-card-level">Lv ${lv}</span>
            <span class="${bonusClass}">${bonus.text}</span>
          </button>`;
      }).join('');
      return `<section class="branch-section"><div class="branch-header"><span class="branch-icon">${branch.icon}</span><h2>${branch.name}</h2></div><div class="upgrade-grid">${cards}</div></section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">🌳</span>
        <div class="page-header-text"><h1>World Tree</h1><p>Each upgrade costs a single resource type</p></div>
      </header>
      <div class="branch-grid">${branches}</div>`;
  }

  function renderUpgradeModal() {
    const modal = $('upgrade-modal');
    const content = $('upgrade-modal-content');
    if (!modal || !content || !selectedUpgradeId) { if (modal) modal.hidden = true; return; }

    const found = E.findUpgradeNode(selectedUpgradeId);
    if (!found) { modal.hidden = true; return; }
    const { branch, node } = found;
    const lv = E.upgradeLevel(state, node.id);
    const costs = E.upgradeCosts(node.id, lv);
    const canBuy = E.canAffordUpgrade(state, node.id);
    const currentBonus = E.upgradeBonusDisplay(state, node);
    const nextBonusText = node.bonusType === 'flat'
      ? `+${(lv + 1) * C.UPGRADE_FLAT_PER_LEVEL}`
      : `+${((lv + 1) * C.UPGRADE_BONUS_PER_LEVEL * 100).toFixed(0)}%`;

    const reqList = Object.entries(costs).map(([res, amt]) => {
      const owned = S.countInSlots(state.storageSlots, res);
      return `<li class="${owned >= amt ? 'met' : 'unmet'}"><span>${resIcon(res)} ${resName(res)}</span><span>${fmt(owned)} / ${fmt(amt)}</span></li>`;
    }).join('');

    content.innerHTML = `
      <div class="upgrade-modal-head"><h2>${node.name}</h2><p>${branch.name} · ${node.desc}</p></div>
      <div class="upgrade-detail-row"><span class="upgrade-detail-label">Current Level</span><span class="upgrade-detail-value">${lv}</span></div>
      <div class="upgrade-detail-row"><span class="upgrade-detail-label">Current Bonus</span><span class="upgrade-detail-value bonus">${currentBonus.text}</span></div>
      <div class="upgrade-detail-row"><span class="upgrade-detail-label">Next Level Bonus</span><span class="upgrade-detail-value bonus">${nextBonusText}</span></div>
      <div class="upgrade-requirements"><h3>Requirement</h3><ul class="req-list">${reqList}</ul></div>
      <div class="upgrade-modal-actions">
        <button type="button" class="btn-sm primary ${canBuy ? '' : 'disabled'}" data-action="buy-upgrade" data-upgrade="${node.id}" ${canBuy ? '' : 'disabled'}>Upgrade</button>
        <button type="button" class="btn-sm ghost" data-action="close-upgrade-modal">Close</button>
      </div>`;
    modal.hidden = false;
  }

  /* ── Settings ── */

  function renderSettingsPanel() {
    const session = window.WorldrootSession;
    const sessionText = session?.isCloud ? `Cloud save · ${session.displayName}` : 'Offline · this device only';
    return `
      <header class="page-header">
        <span class="page-header-icon">⚙</span>
        <div class="page-header-text"><h1>Settings</h1><p>Save data and account options</p></div>
      </header>
      <div class="settings-grid">
        <section class="detail-box"><h3>Save</h3><p class="settings-line">${sessionText}</p>
          <div class="btn-row">
            <button type="button" class="btn-sm ghost" data-action="go-menu">Main menu</button>
            <button type="button" class="btn-sm danger" data-action="reset-save">Reset save</button>
          </div>
        </section>
        <section class="detail-box"><h3>Account</h3>
          <p class="settings-line">Account Level: <strong>${fmt(S.accountTotalLevel(state))}</strong></p>
          <p class="settings-line">Characters: <strong>${state.characters.length} / ${MAX_SLOTS}</strong></p>
        </section>
        <section class="detail-box"><h3>Activity log</h3><ul id="activity-log" class="log"></ul></section>
      </div>`;
  }

  function renderMainPanel() {
    const el = $('panel-main');
    if (!el) return;
    const skill = C.SKILLS[activePage];
    if (activePage === 'characters') el.innerHTML = renderCharactersPanel();
    else if (activePage === 'inventory') el.innerHTML = renderInventoryPanel();
    else if (activePage === 'storage') el.innerHTML = renderStoragePanel();
    else if (activePage === 'worldtree') el.innerHTML = renderWorldTreePanel();
    else if (activePage === 'settings') { el.innerHTML = renderSettingsPanel(); renderLogEl(); }
    else if (skill && !skill.comingSoon) el.innerHTML = renderSkillPage(activePage);
    else if (skill?.comingSoon) el.innerHTML = renderComingSoon(skill);
    else el.innerHTML = '<p class="empty-msg">Select a page.</p>';
  }

  function renderClassModal() {
    const modal = $('class-modal');
    if (!modal) return;
    modal.hidden = !state.pendingSlot;
    if (!state.pendingSlot) return;
    $('class-modal-title').textContent = `Choose a class — Slot ${state.pendingSlot}`;
    $('class-options').innerHTML = Object.values(C.CLASSES).map((cls) => `
      <button type="button" class="class-pick" data-action="pick-class" data-class="${cls.id}">
        <span class="class-pick-icon">${cls.icon}</span>
        <span class="class-pick-name">${cls.name}</span>
        <span class="class-pick-desc">${cls.desc}</span>
      </button>`).join('');
  }

  function render() {
    renderHud();
    renderSidebar();
    renderMainPanel();
    renderClassModal();
    renderUpgradeModal();
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'switch-page') { switchPage(btn.dataset.page); return; }
    if (action === 'select-char') { S.selectCharacter(state, Number(btn.dataset.char)); render(); return; }
    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined.`);
      render(); return;
    }
    if (action === 'open-class') { state.pendingSlot = Number(btn.dataset.slot); renderClassModal(); return; }
    if (action === 'assign-selected') {
      assignSelected(btn.dataset.activity, btn.dataset.target); return;
    }
    if (action === 'stop-selected') {
      const idx = selectedIndex();
      S.stopActivity(state, idx);
      addLog(`${charLabel(state.characters[idx])} stopped.`);
      render(); return;
    }
    if (action === 'open-upgrade') { selectedUpgradeId = btn.dataset.upgrade; renderUpgradeModal(); return; }
    if (action === 'close-upgrade-modal') { selectedUpgradeId = null; renderUpgradeModal(); return; }
    if (action === 'buy-upgrade') {
      const found = E.findUpgradeNode(btn.dataset.upgrade);
      if (found && E.buyUpgrade(state, btn.dataset.upgrade)) {
        addLog(`Upgraded ${found.node.name} to Lv ${E.upgradeLevel(state, btn.dataset.upgrade)}.`);
        render();
      }
      return;
    }

    if (action === 'collect-produce') {
      const result = E.collectProduce(state, Number(btn.dataset.slot), selectedIndex());
      if (result.collected > 0) {
        addLog(`Collected ${result.collected} items into inventory.`);
        if (result.lost > 0) addLog(`${result.lost} items lost — inventory full.`);
      }
      render();
      return;
    }

    if (action === 'collect-smelt') {
      const n = E.collectSmelt(state, Number(btn.dataset.slot));
      if (n > 0) addLog(`Collected ${n} bars into storage.`);
      render();
      return;
    }
    if (action === 'reset-save') {
      if (confirm('Reset all progress?')) {
        state = S.resetState();
        selectedUpgradeId = null;
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
        addLog('Save cleared.');
        render();
      }
      return;
    }
    if (action === 'go-menu' && window.WorldrootGoMenu) window.WorldrootGoMenu();
  }

  function handleChange(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (el.dataset.action === 'set-smelt') {
      const idx = Number(el.dataset.slot);
      const ore = el.value || null;
      if (ore) E.setSmeltSlot(state, idx, ore);
      else E.clearSmeltSlot(state, idx);
      render();
    }
    if (el.dataset.action === 'set-produce') {
      const idx = Number(el.dataset.slot);
      const item = el.value || null;
      if (item) E.setProduceSlot(state, idx, item);
      else E.clearProduceSlot(state, idx);
      render();
    }
  }

  function init(initialState) {
    state = initialState;
    document.body.addEventListener('click', handleClick);
    document.body.addEventListener('change', handleChange);
    renderSidebar();
    switchPage(state.characters.length ? 'characters' : 'combat');
    if (!state.characters.length) renderClassModal();
  }

  window.WorldrootUI = {
    init, render, refresh: render, addLog,
    getState: () => state,
    setState: (next) => { state = next; },
    setSessionBadge: () => { if (activePage === 'settings') renderMainPanel(); },
  };

  function showBootError(msg) {
    const panel = $('panel-main');
    if (panel) panel.innerHTML = `<p class="empty-msg" style="color:#e8a0a0">${msg}</p>`;
  }

  function autoBoot() {
    try {
      if (!window.WorldrootState || !window.WorldrootEngine) {
        showBootError('Game failed to load. Hard refresh or Play offline from home.');
        return;
      }
      const mode = sessionStorage.getItem('worldroot_play_mode');
      window.WorldrootState.setPlayMode(mode === 'cloud' ? 'cloud' : 'offline');
      window.WorldrootSession = window.WorldrootSession || { isCloud: mode === 'cloud', isOffline: mode !== 'cloud', displayName: 'Offline' };
      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;
      init(window.WorldrootState.loadState());
      addLog(state.characters.length ? 'Welcome back to Worldroot.' : 'Welcome to Worldroot. Choose your first class.');
      setInterval(() => {
        window.WorldrootEngine.tick(window.WorldrootUI.getState());
        window.WorldrootState.refreshPendingSlot(window.WorldrootUI.getState());
        window.WorldrootUI.refresh();
      }, C?.TICK_MS ?? 1000);
      window.addEventListener('beforeunload', () => {
        window.WorldrootState.saveState(window.WorldrootUI.getState());
        if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}`);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoBoot);
  else autoBoot();
})();
