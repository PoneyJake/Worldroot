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
/** Worldroot — save/load and state helpers. */

(function () {
  if (!window.WorldrootConfig) {
    console.error('[Worldroot] config.js did not load before state.js');
    return;
  }

  const { SAVE_KEY, SAVE_KEY_OFFLINE, RESOURCE_IDS, CLASSES, SLOT_UNLOCK_AT, WORLD_TREE_BRANCHES } =
    window.WorldrootConfig;

  let playMode = 'offline';

  function getSaveKey() {
    return playMode === 'cloud' ? SAVE_KEY : SAVE_KEY_OFFLINE;
  }

  function setPlayMode(mode) {
    playMode = mode === 'cloud' ? 'cloud' : 'offline';
  }

  function serializeState(state) {
    return {
      characters: state.characters,
      gold: state.gold,
      resources: state.resources,
      upgrades: state.upgrades,
      pendingSlot: state.pendingSlot,
      rateStats: state.rateStats,
    };
  }

  function emptyUpgrades() {
    const u = {};
    for (const branch of WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        u[node.id] = 0;
      }
    }
    return u;
  }

  const LEGACY_UPGRADES = [
    { id: 'coal', nodes: [{ effect: 'woodcutting_yield' }, { effect: 'storage' }, { effect: 'mining_xp' }] },
    { id: 'copper', nodes: [{ effect: 'mining_yield' }, { effect: 'storage' }, { effect: 'mining_xp' }] },
    { id: 'iron', nodes: [{ effect: 'mining_yield' }, { effect: 'storage' }, { effect: 'mining_xp' }] },
    { id: 'gold', nodes: [{ effect: 'mining_yield' }, { effect: 'storage' }, { effect: 'combat_gold' }] },
    { id: 'oak', nodes: [{ effect: 'mining_yield' }, { effect: 'combat_hp' }, { effect: 'woodcutting_xp' }] },
    { id: 'spruce', nodes: [{ effect: 'woodcutting_yield' }, { effect: 'storage' }, { effect: 'woodcutting_xp' }] },
    { id: 'birch', nodes: [{ effect: 'woodcutting_yield' }, { effect: 'storage' }, { effect: 'woodcutting_xp' }] },
    { id: 'jungle', nodes: [{ effect: 'woodcutting_yield' }, { effect: 'storage' }, { effect: 'fishing_xp' }] },
    { id: 'shrimp', nodes: [{ effect: 'fishing_yield' }, { effect: 'storage' }, { effect: 'fishing_xp' }] },
    { id: 'trout', nodes: [{ effect: 'fishing_yield' }, { effect: 'storage' }, { effect: 'fishing_xp' }] },
    { id: 'salmon', nodes: [{ effect: 'fishing_yield' }, { effect: 'storage' }, { effect: 'fishing_xp' }] },
    { id: 'lobster', nodes: [{ effect: 'fishing_yield' }, { effect: 'storage' }, { effect: 'combat_xp' }] },
  ];

  function migrateUpgrades(oldUpgrades) {
    const u = emptyUpgrades();
    if (!oldUpgrades || typeof oldUpgrades !== 'object') return u;

    const effectTotals = {};
    for (const res of LEGACY_UPGRADES) {
      res.nodes.forEach((node, i) => {
        const key = `${res.id}_${i}`;
        const lv = oldUpgrades[key] || 0;
        if (lv > 0) {
          effectTotals[node.effect] = (effectTotals[node.effect] || 0) + lv;
        }
      });
    }

    if (effectTotals.combat_gold) {
      effectTotals.gold_gain = (effectTotals.gold_gain || 0) + effectTotals.combat_gold;
    }
    if (effectTotals.combat_xp) {
      effectTotals.damage = (effectTotals.damage || 0) + Math.floor(effectTotals.combat_xp / 2);
    }

    for (const branch of WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        if (effectTotals[node.effect]) {
          u[node.id] = Math.min(effectTotals[node.effect], 50);
        }
      }
    }

    for (const [key, val] of Object.entries(oldUpgrades)) {
      if (WORLD_TREE_BRANCHES.some((b) => b.nodes.some((n) => n.id === key))) {
        u[key] = Math.max(u[key] || 0, val);
      }
    }

    return u;
  }

  function hydrateState(data) {
    const state = defaultState();
    state.gold = data.gold ?? 0;
    state.resources = { ...state.resources, ...(data.resources || {}) };
    state.upgrades = migrateUpgrades(data.upgrades);
    state.pendingSlot = data.pendingSlot ?? (data.characters?.length ? null : 1);
    if (data.rateStats) {
      state.rateStats = { ...defaultRateStats(), ...data.rateStats };
    }
    if (Array.isArray(data.characters)) {
      state.characters = data.characters.map((c) => ({
        classId: c.classId,
        activity: c.activity ?? null,
        target: c.target ?? null,
        skills: {
          combat: { ...defaultSkill(), ...c.skills?.combat },
          mining: { ...defaultSkill(), ...c.skills?.mining },
          woodcutting: { ...defaultSkill(), ...c.skills?.woodcutting },
          fishing: { ...defaultSkill(), ...c.skills?.fishing },
        },
      }));
    }
    refreshPendingSlot(state);
    return state;
  }

  function exportSaveData() {
    const raw = localStorage.getItem(getSaveKey());
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        /* fall through */
      }
    }
    return serializeState(defaultState());
  }

  function importSaveData(data) {
    if (!data || typeof data !== 'object') return;
    localStorage.setItem(getSaveKey(), JSON.stringify(data));
  }

  function emptyResources() {
    const r = {};
    for (const id of RESOURCE_IDS) r[id] = 0;
    return r;
  }

  function defaultSkill() {
    return { level: 1, xp: 0 };
  }

  function defaultRateStats() {
    return {
      xp: {},
      resources: {},
      kills: {},
      loot: {},
      ticks: 0,
    };
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
    };
  }

  function defaultState() {
    return {
      characters: [],
      gold: 0,
      resources: emptyResources(),
      upgrades: emptyUpgrades(),
      pendingSlot: 1,
      rateStats: defaultRateStats(),
    };
  }

  function xpForLevel(level) {
    return 100 * level;
  }

  function characterTotalLevel(char) {
    if (!char?.skills) return 0;
    return Object.values(char.skills).reduce((sum, sk) => sum + (sk?.level ?? 1), 0);
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
      if (accountLevel < SLOT_UNLOCK_AT[i]) {
        return { slot: i + 1, at: SLOT_UNLOCK_AT[i] };
      }
    }
    return null;
  }

  function grantXp(skill, amount) {
    skill.xp += amount;
    while (skill.xp >= xpForLevel(skill.level)) {
      skill.xp -= xpForLevel(skill.level);
      skill.level += 1;
    }
  }

  function loadState() {
    const keys = [getSaveKey(), 'worldroot_save_v1', 'worldroot_save_offline_v1'];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (key !== getSaveKey()) {
          localStorage.setItem(getSaveKey(), JSON.stringify(data));
        }
        return hydrateState(data);
      } catch {
        /* try next key */
      }
    }
    return defaultState();
  }

  function saveState(state) {
    localStorage.setItem(getSaveKey(), JSON.stringify(serializeState(state)));
  }

  function resetState() {
    localStorage.removeItem(getSaveKey());
    localStorage.removeItem('worldroot_save_v1');
    localStorage.removeItem('worldroot_save_offline_v1');
    return defaultState();
  }

  function refreshPendingSlot(state) {
    if (state.pendingSlot) return;
    const account = accountTotalLevel(state);
    const allowed = maxUnlockedSlots(account);
    if (state.characters.length < allowed) {
      state.pendingSlot = state.characters.length + 1;
    }
  }

  function addCharacter(state, classId) {
    if (!CLASSES[classId]) return false;
    state.characters.push(createCharacter(classId));
    state.pendingSlot = null;
    refreshPendingSlot(state);
    saveState(state);
    return true;
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
    const window = window.WorldrootConfig.RATE_WINDOW_TICKS;

    if (event.xpGain && event.skill) {
      rs.xp[event.skill] = (rs.xp[event.skill] || 0) + event.xpGain;
    }
    if (event.resource && event.resourceAmount) {
      rs.resources[event.resource] = (rs.resources[event.resource] || 0) + event.resourceAmount;
    }
    if (event.kill && event.monster) {
      rs.kills[event.monster] = (rs.kills[event.monster] || 0) + 1;
    }
    if (event.loot && event.lootAmount) {
      rs.loot[event.loot] = (rs.loot[event.loot] || 0) + event.lootAmount;
    }

    rs.ticks += 1;
    if (rs.ticks >= window) {
      rs.xp = {};
      rs.resources = {};
      rs.kills = {};
      rs.loot = {};
      rs.ticks = 0;
    }
  }

  window.WorldrootState = {
    defaultState,
    loadState,
    saveState,
    resetState,
    exportSaveData,
    importSaveData,
    setPlayMode,
    getSaveKey,
    createCharacter,
    xpForLevel,
    characterTotalLevel,
    accountTotalLevel,
    maxUnlockedSlots,
    nextSlotUnlock,
    grantXp,
    refreshPendingSlot,
    addCharacter,
    setActivity,
    stopActivity,
    emptyResources,
    emptyUpgrades,
    recordRateEvent,
    migrateUpgrades,
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
    const base = C.UPGRADE_BASE_COSTS[nodeId];
    if (!base) return {};
    const scale = 1 + currentLevel * 0.15;
    const costs = {};
    for (const [res, amt] of Object.entries(base)) {
      costs[res] = Math.max(1, Math.floor(amt * scale));
    }
    return costs;
  }

  function upgradeBonusPercent(state, nodeId) {
    return upgradeLevel(state, nodeId) * C.UPGRADE_BONUS_PER_LEVEL * 100;
  }

  function effectBonus(state, effectType) {
    let bonus = 0;
    for (const branch of C.WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        if (node.effect !== effectType) continue;
        bonus += upgradeLevel(state, node.id) * C.UPGRADE_BONUS_PER_LEVEL;
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

  function hasSpecialty(char, skillId) {
    const cls = C.CLASSES[char.classId];
    return cls?.specialty === skillId;
  }

  function specialtyMult(char, skillId) {
    return hasSpecialty(char, skillId) ? 1 + C.SPECIALTY_BONUS : 1;
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
    const lv = upgradeLevel(state, nodeId);
    const costs = upgradeCosts(nodeId, lv);
    return Object.entries(costs).every(([res, amt]) => (state.resources[res] || 0) >= amt);
  }

  function tickCharacter(state, char) {
    if (!char.activity) return null;

    const activity = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!activity) return null;

    const skillId = activity.skill;
    const skill = char.skills[skillId];
    if (!skill) return null;

    const xpMult = 1 + skillXpBonus(state, skillId);
    const spec = specialtyMult(char, skillId);
    const xpGain = Math.floor(C.BASE_XP_PER_TICK * xpMult * spec);
    S.grantXp(skill, xpGain);

    const event = {
      charClass: char.classId,
      activity: char.activity,
      target: char.target,
      xpGain,
      skill: skillId,
      resource: null,
      resourceAmount: 0,
      gold: 0,
      kill: false,
      monster: null,
      loot: null,
      lootAmount: 0,
    };

    if (char.activity === 'combat') {
      const monster = findMonster(char.target);
      const dropMult = 1 + effectBonus(state, 'combat_drop_rate');
      const goldMult = 1 + effectBonus(state, 'gold_gain');

      event.kill = true;
      event.monster = monster.id;

      if (monster.drop) {
        const dropAmt = Math.max(1, Math.floor(monster.drop.amount * dropMult));
        state.resources[monster.drop.id] = (state.resources[monster.drop.id] || 0) + dropAmt;
        event.loot = monster.drop.id;
        event.lootAmount = dropAmt;
      }

      const goldGain = Math.floor(monster.level * 0.5 * goldMult);
      if (goldGain > 0) {
        state.gold += goldGain;
        event.gold = goldGain;
      }

      return event;
    }

    const vein = findVein(skillId, char.target);
    if (!vein || skill.level < vein.minLevel) return event;

    const yieldMult = 1 + skillYieldBonus(state, skillId);
    const multiMult = 1 + skillMultiBonus(state, skillId);
    let amount = Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * yieldMult * spec));

    if (Math.random() < multiMult * 0.1) {
      amount += Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * spec));
    }

    state.resources[vein.resource] = (state.resources[vein.resource] || 0) + amount;
    event.resource = vein.resource;
    event.resourceAmount = amount;
    return event;
  }

  function tick(state) {
    S.refreshPendingSlot(state);
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
      if ((state.resources[res] || 0) < amt) return false;
    }

    for (const [res, amt] of Object.entries(costs)) {
      state.resources[res] -= amt;
    }
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

  window.WorldrootEngine = {
    upgradeLevel,
    upgradeCosts,
    upgradeBonusPercent,
    effectBonus,
    skillXpBonus,
    skillYieldBonus,
    skillMultiBonus,
    tick,
    buyUpgrade,
    canAffordUpgrade,
    findVein,
    findMonster,
    getRatePerHour,
    findUpgradeNode,
  };
})();
/** Worldroot — sidebar Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const SIDEBAR_NAV = C?.SIDEBAR_NAV ?? [];
  const SKILL_ORDER = C?.SKILL_ORDER ?? ['combat', 'mining', 'woodcutting', 'fishing'];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activePage = 'combat';
  let selectedUpgradeId = null;
  let logBuffer = [];

  function $(id) {
    return document.getElementById(id);
  }

  function fmt(n) {
    return Math.floor(n).toLocaleString();
  }

  function skillName(id) {
    return C.SKILLS[id]?.name ?? id;
  }

  function resName(id) {
    if (C.LOOT_NAMES?.[id]) return C.LOOT_NAMES[id];
    for (const sk of Object.values(C.SKILLS)) {
      const r = sk.resources?.find((x) => x.id === id);
      if (r) return r.name;
    }
    return id;
  }

  function activityLabel(char) {
    if (!char.activity) return 'Idle';
    const act = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!act) return 'Idle';
    if (char.activity === 'combat' && char.target) {
      const mob = C.MONSTERS.find((m) => m.id === char.target);
      return mob ? `Fighting ${mob.name}` : act.label;
    }
    if (char.target) {
      const veins = C.VEINS[char.activity];
      const vein = veins?.find((v) => v.id === char.target);
      if (vein) return vein.name;
    }
    return act.label;
  }

  function charLabel(char) {
    const cls = C.CLASSES[char.classId];
    return cls ? `${cls.icon} ${cls.name}` : 'Character';
  }

  function bestSkillLevel(skillId) {
    if (!state.characters.length) return 1;
    return Math.max(...state.characters.map((c) => c.skills[skillId]?.level ?? 1));
  }

  function charsOnTarget(activity, targetId) {
    return state.characters
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.activity === activity && c.target === targetId);
  }

  function xpProgress(skill) {
    const needed = S.xpForLevel(skill.level);
    return Math.min(100, (skill.xp / needed) * 100);
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

    let html = '<div class="sidebar-section-label">Skills</div>';
    for (const item of SIDEBAR_NAV) {
      if (item.type === 'divider') {
        html += '<div class="sidebar-divider"></div><div class="sidebar-section-label">Menu</div>';
        continue;
      }
      const isActive = item.id === activePage;
      const soon = item.comingSoon ? ' coming-soon' : '';
      const badge = item.comingSoon ? '<span class="sidebar-btn-badge">Soon</span>' : '';
      html += `
        <button type="button" class="sidebar-btn${isActive ? ' active' : ''}${soon}"
          data-action="switch-page" data-page="${item.id}" ${item.comingSoon ? 'disabled' : ''}>
          <span class="sidebar-btn-icon">${item.icon}</span>
          <span class="sidebar-btn-label">${item.label}</span>
          ${badge}
        </button>`;
    }
    el.innerHTML = html;
  }

  /* ── Top Bar ── */

  function renderHud() {
    const acct = $('account-level');
    const gold = $('gold-total');
    const notif = $('notification-count');
    if (acct) acct.textContent = fmt(S.accountTotalLevel(state));
    if (gold) gold.textContent = fmt(state.gold);
    if (notif) notif.textContent = state.pendingSlot ? '1' : '0';
  }

  /* ── Skill Pages ── */

  function renderSkillPage(skillId) {
    const sk = C.SKILLS[skillId];
    if (!sk) return '<p class="empty-msg">Unknown skill.</p>';
    if (sk.comingSoon) return renderComingSoon(sk);

    if (skillId === 'combat') return renderCombatPage(sk);
    return renderGatheringPage(sk);
  }

  function renderComingSoon(sk) {
    return `
      <div class="coming-soon-panel">
        <span class="coming-soon-icon">${sk.icon}</span>
        <h2>${sk.name}</h2>
        <p>${sk.desc}</p>
        <p style="margin-top:12px;font-size:0.85rem">Coming in a future update.</p>
      </div>`;
  }

  function renderCombatPage(sk) {
    const best = bestSkillLevel('combat');
    const cards = C.MONSTERS.map((mob) => {
      const assigned = charsOnTarget('combat', mob.id);
      const xpHr = E.getRatePerHour(state, 'xp', 'combat');
      const killsHr = E.getRatePerHour(state, 'kills', mob.id);
      const lootHr = mob.drop ? E.getRatePerHour(state, 'loot', mob.drop.id) : 0;
      const locked = best < mob.level;

      const assignBtns = state.characters.length
        ? state.characters
            .map((char, i) => {
              const on = char.activity === 'combat' && char.target === mob.id;
              return `<button type="button" class="btn-xs ${on ? 'active' : ''}"
                data-action="assign" data-char="${i}" data-activity="combat" data-target="${mob.id}">
                ${charLabel(char)}${on ? ' ✓' : ''}
              </button>`;
            })
            .join('')
        : '';

      const assignedNames = assigned.length
        ? assigned.map(({ c }) => charLabel(c)).join(', ')
        : 'None';

      return `
        <article class="activity-card ${mob.boss ? 'boss' : ''} ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${mob.icon}</span>
            <div class="activity-card-title">
              <strong>${mob.name}</strong>
              <span>Level ${mob.level}${mob.drop ? ` · Drops ${mob.drop.name}` : ''}</span>
            </div>
            ${mob.boss ? '<span class="activity-card-badge">BOSS</span>' : ''}
          </div>
          <div class="activity-stats">
            <div class="activity-stat">
              <span class="activity-stat-label">XP/hr</span>
              <span class="activity-stat-value">${fmt(xpHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Kills/hr</span>
              <span class="activity-stat-value">${fmt(killsHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Loot/hr</span>
              <span class="activity-stat-value">${fmt(lootHr)}</span>
            </div>
          </div>
          <p class="activity-assigned">Assigned: <strong>${assignedNames}</strong></p>
          ${locked
            ? `<p class="empty-msg">Requires Combat Level ${mob.level}</p>`
            : `<div class="activity-actions">${assignBtns}</div>`}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text">
          <h1>${sk.name}</h1>
          <p>${sk.desc}</p>
        </div>
        <div class="page-header-stat">
          <span class="page-header-stat-label">Combat Level</span>
          <span class="page-header-stat-value">${best}</span>
        </div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  function renderGatheringPage(sk) {
    const veins = C.VEINS[sk.id] ?? [];
    const best = bestSkillLevel(sk.id);

    const cards = veins.map((vein) => {
      const assigned = charsOnTarget(sk.activity, vein.id);
      const xpHr = E.getRatePerHour(state, 'xp', sk.id);
      const resHr = E.getRatePerHour(state, 'resources', vein.resource);
      const locked = best < vein.minLevel;
      const owned = state.resources[vein.resource] || 0;

      const assignBtns = state.characters.length
        ? state.characters
            .map((char, i) => {
              const on = char.activity === sk.activity && char.target === vein.id;
              return `<button type="button" class="btn-xs ${on ? 'active' : ''}"
                data-action="assign" data-char="${i}" data-activity="${sk.activity}" data-target="${vein.id}">
                ${charLabel(char)}${on ? ' ✓' : ''}
              </button>`;
            })
            .join('')
        : '';

      const assignedNames = assigned.length
        ? assigned.map(({ c }) => charLabel(c)).join(', ')
        : 'None';

      const progressPct = assigned.length
        ? xpProgress(assigned[0].c.skills[sk.id])
        : 0;

      return `
        <article class="activity-card ${locked ? 'locked' : ''}">
          <div class="activity-card-head">
            <span class="activity-card-icon">${vein.icon}</span>
            <div class="activity-card-title">
              <strong>${vein.name}</strong>
              <span>${resName(vein.resource)} · Lv ${vein.minLevel} required</span>
            </div>
          </div>
          <div class="activity-stats">
            <div class="activity-stat">
              <span class="activity-stat-label">XP/hr</span>
              <span class="activity-stat-value">${fmt(xpHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">${resName(vein.resource)}/hr</span>
              <span class="activity-stat-value">${fmt(resHr)}</span>
            </div>
            <div class="activity-stat">
              <span class="activity-stat-label">Owned</span>
              <span class="activity-stat-value">${fmt(owned)}</span>
            </div>
          </div>
          <div class="progress-bar" title="XP progress">
            <div class="progress-bar-fill" style="width:${progressPct}%"></div>
          </div>
          <p class="activity-assigned">Assigned: <strong>${assignedNames}</strong></p>
          ${locked
            ? `<p class="empty-msg">Requires ${sk.name} Level ${vein.minLevel}</p>`
            : `<div class="activity-actions">${assignBtns}</div>`}
        </article>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">${sk.icon}</span>
        <div class="page-header-text">
          <h1>${sk.name}</h1>
          <p>${sk.desc}</p>
        </div>
        <div class="page-header-stat">
          <span class="page-header-stat-label">${sk.name} Level</span>
          <span class="page-header-stat-value">${best}</span>
        </div>
      </header>
      <div class="activity-grid">${cards}</div>`;
  }

  /* ── Characters Page ── */

  function renderCharactersPanel() {
    const account = S.accountTotalLevel(state);
    const next = S.nextSlotUnlock(account);
    let unlockHint = '';
    if (next) {
      unlockHint = `<p class="hint-bar">Next slot unlocks at Account Level <strong>${next.at}</strong></p>`;
    }

    const cards = state.characters.map((char, i) => {
      const cls = C.CLASSES[char.classId];
      const total = S.characterTotalLevel(char);
      const combatLv = char.skills.combat?.level ?? 1;

      const skillItems = [
        { id: 'combat', icon: '🗡' },
        { id: 'mining', icon: '⛏' },
        { id: 'woodcutting', icon: '🪓' },
        { id: 'fishing', icon: '🎣' },
      ]
        .map(
          (s) => `
          <div class="char-skill-item">
            <span class="char-skill-icon">${s.icon}</span>
            <span class="char-skill-name">${skillName(s.id)}</span>
            <span class="char-skill-lv">${char.skills[s.id]?.level ?? 1}</span>
          </div>`
        )
        .join('');

      return `
        <article class="char-card" data-class="${char.classId}">
          <div class="char-card-top">
            <div class="char-portrait">${cls.icon}</div>
            <div class="char-card-title">
              <strong>${cls.name}</strong>
              <span class="char-meta">${cls.desc}</span>
            </div>
            <div class="char-total-badge">
              <span>Total</span>
              <strong>${total}</strong>
            </div>
          </div>
          <div class="char-activity-pill ${char.activity ? 'active' : ''}">
            ${char.activity ? '▶' : '○'} ${activityLabel(char)}
          </div>
          <div class="char-skills-grid">${skillItems}</div>
          <div style="font-size:0.78rem;color:#6a7a66;margin-bottom:10px">
            Combat Level: <strong style="color:#a8d5a2">${combatLv}</strong>
          </div>
          <button type="button" class="btn-xs ghost" data-action="stop" data-char="${i}">Stop activity</button>
        </article>`;
    });

    const slots = [];
    for (let slot = 1; slot <= MAX_SLOTS; slot++) {
      if (state.characters.length >= slot) continue;
      const unlockAt = C.SLOT_UNLOCK_AT[slot - 1] ?? 999;
      const ready = account >= unlockAt && state.characters.length === slot - 1;

      if (ready && state.pendingSlot === slot) {
        slots.push(`
          <div class="slot-locked slot-ready">
            <span>Slot ${slot} ready</span>
            <button type="button" class="btn-xs primary" data-action="open-class" data-slot="${slot}">Choose class</button>
          </div>`);
      } else {
        slots.push(`
          <div class="slot-locked">
            <span>🔒 Slot ${slot}</span>
            <span class="slot-req">Acct Lv ${unlockAt}</span>
          </div>`);
      }
    }

    return `
      <header class="page-header">
        <span class="page-header-icon">👥</span>
        <div class="page-header-text">
          <h1>Characters</h1>
          <p>Manage your party and view skill levels</p>
        </div>
        <div class="page-header-stat">
          <span class="page-header-stat-label">Party</span>
          <span class="page-header-stat-value">${state.characters.length}/${MAX_SLOTS}</span>
        </div>
      </header>
      ${unlockHint}
      <div class="char-grid">${cards.join('') || '<p class="empty-msg">Choose a class to begin your party.</p>'}</div>
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── World Tree ── */

  function renderWorldTreePanel() {
    const branches = C.WORLD_TREE_BRANCHES.map((branch) => {
      const cards = branch.nodes
        .map((node) => {
          const lv = E.upgradeLevel(state, node.id);
          const bonus = E.upgradeBonusPercent(state, node.id).toFixed(0);
          return `
            <button type="button" class="upgrade-card" data-action="open-upgrade" data-upgrade="${node.id}">
              <span class="upgrade-card-name">${node.name}</span>
              <span class="upgrade-card-level">Level ${lv}</span>
              <span class="upgrade-card-bonus">+${bonus}%</span>
            </button>`;
        })
        .join('');

      return `
        <section class="branch-section">
          <div class="branch-header">
            <span class="branch-icon">${branch.icon}</span>
            <h2>${branch.name}</h2>
          </div>
          <div class="upgrade-grid">${cards}</div>
        </section>`;
    }).join('');

    return `
      <header class="page-header">
        <span class="page-header-icon">🌳</span>
        <div class="page-header-text">
          <h1>World Tree</h1>
          <p>Grow the ancient tree to unlock powerful bonuses across all skills</p>
        </div>
      </header>
      <div class="branch-grid">${branches}</div>`;
  }

  function renderUpgradeModal() {
    const modal = $('upgrade-modal');
    const content = $('upgrade-modal-content');
    if (!modal || !content) return;

    if (!selectedUpgradeId) {
      modal.hidden = true;
      return;
    }

    const found = E.findUpgradeNode(selectedUpgradeId);
    if (!found) {
      modal.hidden = true;
      return;
    }

    const { branch, node } = found;
    const lv = E.upgradeLevel(state, node.id);
    const currentBonus = E.upgradeBonusPercent(state, node.id).toFixed(0);
    const nextBonus = ((lv + 1) * C.UPGRADE_BONUS_PER_LEVEL * 100).toFixed(0);
    const costs = E.upgradeCosts(node.id, lv);
    const canBuy = E.canAffordUpgrade(state, node.id);

    const reqList = Object.entries(costs)
      .map(([res, amt]) => {
        const owned = state.resources[res] || 0;
        const met = owned >= amt;
        return `<li class="${met ? 'met' : 'unmet'}">
          <span>${resName(res)}</span>
          <span>${fmt(owned)} / ${fmt(amt)}</span>
        </li>`;
      })
      .join('');

    content.innerHTML = `
      <div class="upgrade-modal-head">
        <h2>${node.name}</h2>
        <p>${branch.name} · ${node.desc}</p>
      </div>
      <div class="upgrade-detail-row">
        <span class="upgrade-detail-label">Current Level</span>
        <span class="upgrade-detail-value">${lv}</span>
      </div>
      <div class="upgrade-detail-row">
        <span class="upgrade-detail-label">Current Bonus</span>
        <span class="upgrade-detail-value bonus">+${currentBonus}%</span>
      </div>
      <div class="upgrade-detail-row">
        <span class="upgrade-detail-label">Next Level Bonus</span>
        <span class="upgrade-detail-value bonus">+${nextBonus}%</span>
      </div>
      <div class="upgrade-requirements">
        <h3>Requirements</h3>
        <ul class="req-list">${reqList || '<li>No cost defined</li>'}</ul>
      </div>
      <div class="upgrade-modal-actions">
        <button type="button" class="btn-sm primary ${canBuy ? '' : 'disabled'}"
          data-action="buy-upgrade" data-upgrade="${node.id}" ${canBuy ? '' : 'disabled'}>
          Upgrade
        </button>
        <button type="button" class="btn-sm ghost" data-action="close-upgrade-modal">Close</button>
      </div>`;

    modal.hidden = false;
  }

  /* ── Settings ── */

  function renderSettingsPanel() {
    const session = window.WorldrootSession;
    const sessionText = session?.isCloud
      ? `Cloud save · ${session.displayName}`
      : 'Offline · this device only';

    return `
      <header class="page-header">
        <span class="page-header-icon">⚙</span>
        <div class="page-header-text">
          <h1>Settings</h1>
          <p>Save data and account options</p>
        </div>
      </header>
      <div class="settings-grid">
        <section class="detail-box">
          <h3>Save</h3>
          <p class="settings-line">${sessionText}</p>
          <div class="btn-row">
            <button type="button" class="btn-sm ghost" data-action="go-menu">Main menu</button>
            <button type="button" class="btn-sm danger" data-action="reset-save">Reset save</button>
          </div>
        </section>
        <section class="detail-box">
          <h3>Account</h3>
          <p class="settings-line">Account Level: <strong>${fmt(S.accountTotalLevel(state))}</strong></p>
          <p class="settings-line">Characters: <strong>${state.characters.length} / ${MAX_SLOTS}</strong></p>
          <p class="settings-line">Gold: <strong>${fmt(state.gold)}</strong></p>
        </section>
        <section class="detail-box">
          <h3>Activity log</h3>
          <ul id="activity-log" class="log"></ul>
        </section>
      </div>`;
  }

  /* ── Main Panel ── */

  function renderMainPanel() {
    const el = $('panel-main');
    if (!el) return;

    const skill = C.SKILLS[activePage];
    if (skill && !skill.comingSoon) {
      el.innerHTML = renderSkillPage(activePage);
    } else if (activePage === 'characters') {
      el.innerHTML = renderCharactersPanel();
    } else if (activePage === 'worldtree') {
      el.innerHTML = renderWorldTreePanel();
    } else if (activePage === 'settings') {
      el.innerHTML = renderSettingsPanel();
      renderLogEl();
    } else if (skill?.comingSoon) {
      el.innerHTML = renderComingSoon(skill);
    } else {
      el.innerHTML = '<p class="empty-msg">Select a page from the sidebar.</p>';
    }
  }

  /* ── Class Modal ── */

  function renderClassModal() {
    const modal = $('class-modal');
    if (!modal) return;
    const show = !!state.pendingSlot;
    modal.hidden = !show;
    if (!show) return;

    $('class-modal-title').textContent = `Choose a class — Slot ${state.pendingSlot}`;
    $('class-options').innerHTML = Object.values(C.CLASSES)
      .map(
        (cls) => `
        <button type="button" class="class-pick" data-action="pick-class" data-class="${cls.id}">
          <span class="class-pick-icon">${cls.icon}</span>
          <span class="class-pick-name">${cls.name}</span>
          <span class="class-pick-desc">${cls.desc}</span>
        </button>`
      )
      .join('');
  }

  function render() {
    renderHud();
    renderSidebar();
    renderMainPanel();
    renderClassModal();
    renderUpgradeModal();
  }

  /* ── Events ── */

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'switch-page') {
      switchPage(btn.dataset.page);
      return;
    }

    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined the party.`);
      render();
      return;
    }

    if (action === 'open-class') {
      state.pendingSlot = Number(btn.dataset.slot);
      renderClassModal();
      return;
    }

    if (action === 'assign') {
      const idx = Number(btn.dataset.char);
      S.setActivity(state, idx, btn.dataset.activity, btn.dataset.target);
      addLog(`${charLabel(state.characters[idx])} → ${activityLabel(state.characters[idx])}`);
      render();
      return;
    }

    if (action === 'stop') {
      const idx = Number(btn.dataset.char);
      S.stopActivity(state, idx);
      addLog(`${charLabel(state.characters[idx])} stopped.`);
      render();
      return;
    }

    if (action === 'open-upgrade') {
      selectedUpgradeId = btn.dataset.upgrade;
      renderUpgradeModal();
      return;
    }

    if (action === 'close-upgrade-modal') {
      selectedUpgradeId = null;
      renderUpgradeModal();
      return;
    }

    if (action === 'buy-upgrade') {
      const nodeId = btn.dataset.upgrade;
      const found = E.findUpgradeNode(nodeId);
      if (found && E.buyUpgrade(state, nodeId)) {
        addLog(`Upgraded ${found.node.name} to level ${E.upgradeLevel(state, nodeId)}.`);
        render();
      }
      return;
    }

    if (action === 'reset-save') {
      if (confirm('Reset all progress? This cannot be undone.')) {
        state = S.resetState();
        selectedUpgradeId = null;
        if (window.WorldrootSession?.isCloud && window.WorldrootCloud?.flush) {
          window.WorldrootCloud.flush();
        }
        addLog('Save cleared.');
        render();
      }
      return;
    }

    if (action === 'go-menu') {
      if (window.WorldrootGoMenu) window.WorldrootGoMenu();
    }
  }

  function setSessionBadge() {
    if (activePage === 'settings') renderMainPanel();
  }

  function init(initialState) {
    state = initialState;
    document.body.addEventListener('click', handleClick);
    renderSidebar();
    switchPage('combat');

    if (!state.characters.length) {
      renderClassModal();
    }
  }

  window.WorldrootUI = {
    init,
    render,
    refresh: render,
    addLog,
    getState: () => state,
    setState: (next) => {
      state = next;
    },
    setSessionBadge,
  };

  function showBootError(msg) {
    const panel = document.getElementById('panel-main');
    if (panel) {
      panel.innerHTML = `<p class="empty-msg" style="color:#e8a0a0">${msg}</p>`;
    }
  }

  function autoBoot() {
    try {
      const St = window.WorldrootState;
      const En = window.WorldrootEngine;
      if (!St || !En) {
        showBootError('Game failed to load. Hard refresh (Ctrl+Shift+R) or try Play offline from the home page.');
        return;
      }

      const mode = sessionStorage.getItem('worldroot_play_mode');
      St.setPlayMode(mode === 'cloud' ? 'cloud' : 'offline');

      window.WorldrootSession = window.WorldrootSession || {
        isCloud: mode === 'cloud',
        isOffline: mode !== 'cloud',
        displayName: 'Offline',
      };

      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;

      const gameState = St.loadState();
      init(gameState);

      if (!gameState.characters.length) {
        addLog('Welcome to Worldroot. Choose your first class.');
      } else {
        addLog('Welcome back to Worldroot.');
      }

      setInterval(() => {
        En.tick(getState());
        St.refreshPendingSlot(getState());
        refresh();
      }, C?.TICK_MS ?? 1000);

      window.addEventListener('beforeunload', () => {
        St.saveState(getState());
        if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}. Try Reset save in Settings or clear browser data for this site.`);
    }
  }

  function getState() {
    return window.WorldrootUI.getState();
  }

  function refresh() {
    window.WorldrootUI.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})();
