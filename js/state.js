/** Worldroot — save/load and state helpers. */

(function () {
  if (!window.WorldrootConfig) {
    console.error('[Worldroot] config.js did not load before state.js');
    return;
  }

  const C = window.WorldrootConfig;
  const { SAVE_KEY, SAVE_KEY_OFFLINE, RESOURCE_IDS, CLASSES, SLOT_UNLOCK_AT, WORLD_TREE_BRANCHES } = C;

  let playMode = 'offline';

  function getSaveKey() {
    return playMode === 'cloud' ? SAVE_KEY : SAVE_KEY_OFFLINE;
  }

  function setPlayMode(mode) {
    playMode = mode === 'cloud' ? 'cloud' : 'offline';
  }

  function emptyInventory() {
    const inv = {};
    for (const id of RESOURCE_IDS) inv[id] = 0;
    return inv;
  }

  function emptyStorage() {
    const s = {};
    for (const id of RESOURCE_IDS) s[id] = 0;
    return s;
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
    return [{ ore: null, progress: 0 }, { ore: null, progress: 0 }, { ore: null, progress: 0 }, { ore: null, progress: 0 }];
  }

  function defaultProduceSlots() {
    return [{ item: null, progress: 0 }, { item: null, progress: 0 }, { item: null, progress: 0 }, { item: null, progress: 0 }];
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
      inventory: emptyInventory(),
    };
  }

  function defaultState() {
    return {
      characters: [],
      gold: 0,
      storage: emptyStorage(),
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
      storage: state.storage,
      resources: state.storage,
      upgrades: state.upgrades,
      pendingSlot: state.pendingSlot,
      selectedCharIndex: state.selectedCharIndex,
      rateStats: state.rateStats,
      producing: state.producing,
      smelting: state.smelting,
    };
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
    const skills = {
      combat: { ...defaultSkill(), ...c.skills?.combat },
      mining: { ...defaultSkill(), ...c.skills?.mining },
      woodcutting: { ...defaultSkill(), ...c.skills?.woodcutting },
      fishing: { ...defaultSkill(), ...c.skills?.fishing },
    };
    for (const sk of Object.values(skills)) {
      if (sk.level === 1 && sk.xp === 0 && !c._migratedV3) sk.level = 0;
    }
    return {
      classId: c.classId,
      activity: c.activity ?? null,
      target: c.target ?? null,
      skills,
      inventory: { ...emptyInventory(), ...(c.inventory || {}) },
    };
  }

  function hydrateState(data) {
    const state = defaultState();
    state.gold = data.gold ?? 0;
    const stored = data.storage || data.resources || {};
    state.storage = { ...emptyStorage(), ...stored };
    state.upgrades = migrateUpgrades(data.upgrades);
    state.pendingSlot = data.pendingSlot ?? (data.characters?.length ? null : 1);
    state.selectedCharIndex = data.selectedCharIndex ?? 0;
    if (data.rateStats) state.rateStats = { ...defaultRateStats(), ...data.rateStats };
    if (data.producing) {
      state.producing = {
        skill: { ...defaultSkill(), ...data.producing.skill },
        slots: (data.producing.slots || defaultProduceSlots()).map((s) => ({ item: s.item ?? null, progress: s.progress ?? 0 })),
      };
    }
    if (data.smelting) {
      state.smelting = {
        skill: { ...defaultSkill(), ...data.smelting.skill },
        slots: (data.smelting.slots || defaultSmeltSlots()).map((s) => ({ ore: s.ore ?? null, progress: s.progress ?? 0 })),
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

  function xpForLevel(level) {
    return 100 * (level + 1);
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

  function inventoryUsed(char) {
    return Object.values(char.inventory || {}).reduce((s, n) => s + (n || 0), 0);
  }

  function inventoryCapacity(state) {
    const base = C.BASE_INVENTORY_SLOTS;
    const bonus = Math.floor((window.WorldrootEngine?.effectBonus(state, 'carry_capacity') || 0) * 50);
    return base + bonus;
  }

  function addToCharacter(char, state, resourceId, amount) {
    let left = amount;
    const cap = inventoryCapacity(state);
    const used = inventoryUsed(char);
    const space = Math.max(0, cap - used);
    const toInv = Math.min(left, space);
    if (toInv > 0) {
      char.inventory[resourceId] = (char.inventory[resourceId] || 0) + toInv;
      left -= toInv;
    }
    if (left > 0) {
      state.storage[resourceId] = (state.storage[resourceId] || 0) + left;
    }
    return amount - left;
  }

  function loadState() {
    const keys = [getSaveKey(), 'worldroot_save_v2', 'worldroot_save_offline_v2', 'worldroot_save_v1', 'worldroot_save_offline_v1'];
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
    for (const k of [getSaveKey(), 'worldroot_save_v2', 'worldroot_save_offline_v2', 'worldroot_save_v1', 'worldroot_save_offline_v1']) {
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
    setActivity, stopActivity, emptyStorage, emptyUpgrades, recordRateEvent,
    migrateUpgrades, inventoryUsed, inventoryCapacity, addToCharacter,
    defaultSmeltSlots, defaultProduceSlots,
  };
})();
