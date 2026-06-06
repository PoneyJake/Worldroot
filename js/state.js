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
