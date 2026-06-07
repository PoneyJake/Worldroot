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

  function emptyUpgradeTiers() {
    const t = {};
    for (const branch of WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) t[node.id] = 0;
    }
    return t;
  }

  function defaultSkill() {
    return { level: 0, xp: 0 };
  }

  function defaultSmeltSlots() {
    return [
      { ore: null, oreLoaded: 0, progress: 0, ready: 0, readyBar: null },
      { ore: null, oreLoaded: 0, progress: 0, ready: 0, readyBar: null },
      { ore: null, oreLoaded: 0, progress: 0, ready: 0, readyBar: null },
      { ore: null, oreLoaded: 0, progress: 0, ready: 0, readyBar: null },
    ];
  }

  function defaultCharacterProducing() {
    return { skill: defaultSkill(), activeSlot: null, progress: 0, ready: 0, readyItem: null };
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
      gatherCd: 0,
      combatCd: 0,
      combatState: null,
      producing: defaultCharacterProducing(),
    };
  }

  function defaultState() {
    return {
      characters: [],
      gold: 0,
      storageSlots: emptySlotArray(C.BASE_STORAGE_SLOTS),
      upgrades: emptyUpgrades(),
      upgradeTiers: emptyUpgradeTiers(),
      pendingSlot: 1,
      selectedCharIndex: 0,
      rateStats: defaultRateStats(),
      smelting: { skill: defaultSkill(), slots: defaultSmeltSlots() },
    };
  }

  function serializeState(state) {
    return {
      characters: state.characters,
      gold: state.gold,
      storageSlots: state.storageSlots,
      upgrades: state.upgrades,
      upgradeTiers: state.upgradeTiers,
      pendingSlot: state.pendingSlot,
      selectedCharIndex: state.selectedCharIndex,
      rateStats: state.rateStats,
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

  const RESOURCE_ID_MIGRATE = {
    goblin_ear: 'wisp_essence',
    wolf_fur: 'gloomspore',
    bandit_emblem: 'bat_wing_membrane',
  };

  const MONSTER_ID_MIGRATE = {
    goblin_scout: 'will_o_wisp',
    dire_wolf: 'gloomcap',
    forest_bandit: 'spore_bat',
  };

  function migrateResourceId(id) {
    return RESOURCE_ID_MIGRATE[id] || id;
  }

  function migrateMonsterId(id) {
    return MONSTER_ID_MIGRATE[id] || id;
  }

  function migrateSlotArray(slots) {
    if (!Array.isArray(slots)) return slots;
    for (const slot of slots) {
      if (slot?.resourceId) slot.resourceId = migrateResourceId(slot.resourceId);
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

  function migrateUpgradeTiers(oldTiers, upgrades) {
    const t = emptyUpgradeTiers();
    if (oldTiers && typeof oldTiers === 'object') {
      for (const branch of WORLD_TREE_BRANCHES) {
        for (const node of branch.nodes) {
          if (oldTiers[node.id]) t[node.id] = oldTiers[node.id];
        }
      }
      return t;
    }
    const tierSize = C.UPGRADE_TIER_SIZE || 5;
    for (const branch of WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        const lv = upgrades?.[node.id] || 0;
        t[node.id] = lv > 0 ? Math.ceil(lv / tierSize) : 0;
      }
    }
    return t;
  }

  function hydrateCharacter(c) {
    let inventorySlots = c.inventorySlots;
    if (!Array.isArray(inventorySlots)) {
      inventorySlots = migrateDictToSlots(c.inventory, C.BASE_INVENTORY_SLOTS);
    }
    while (inventorySlots.length < C.BASE_INVENTORY_SLOTS) inventorySlots.push(null);
    if (inventorySlots.length > C.BASE_INVENTORY_SLOTS) inventorySlots.length = C.BASE_INVENTORY_SLOTS;

    const skills = {
      combat: { ...defaultSkill(), ...c.skills?.combat },
      mining: { ...defaultSkill(), ...c.skills?.mining },
      woodcutting: { ...defaultSkill(), ...c.skills?.woodcutting },
      fishing: { ...defaultSkill(), ...c.skills?.fishing },
    };

    const target = c.activity === 'combat' && c.target
      ? migrateMonsterId(c.target)
      : (c.target ?? null);
    let combatState = c.combatState ?? null;
    if (combatState?.mobId) {
      combatState = { ...combatState, mobId: migrateMonsterId(combatState.mobId) };
    }

    let producing = c.producing;
    if (!producing || typeof producing !== 'object') {
      producing = defaultCharacterProducing();
    } else {
      const slotIdx = producing.activeSlot ?? (
        producing.item ? C.PRODUCE_SLOTS?.findIndex((p) => p.id === producing.item) : null
      );
      producing = {
        skill: { ...defaultSkill(), ...producing.skill },
        activeSlot: slotIdx >= 0 ? slotIdx : null,
        progress: producing.progress ?? 0,
        ready: producing.ready ?? 0,
        readyItem: producing.readyItem ?? producing.item ?? null,
      };
    }

    return {
      classId: c.classId,
      activity: c.activity ?? null,
      target,
      skills,
      inventorySlots: migrateSlotArray(inventorySlots),
      extraBagSlots: c.extraBagSlots ?? 0,
      gatherCd: c.gatherCd ?? 0,
      combatCd: c.combatCd ?? 0,
      combatState,
      producing,
    };
  }

  function hydrateState(data) {
    const state = defaultState();
    state.gold = data.gold ?? 0;

    if (Array.isArray(data.storageSlots)) {
      state.storageSlots = migrateSlotArray(data.storageSlots);
    } else {
      state.storageSlots = migrateDictToSlots(data.storage || data.resources, C.BASE_STORAGE_SLOTS);
    }
    while (state.storageSlots.length < C.BASE_STORAGE_SLOTS) state.storageSlots.push(null);

    if (data.rateStats) {
      const rs = { ...defaultRateStats(), ...data.rateStats };
      const kills = {};
      for (const [k, v] of Object.entries(rs.kills || {})) {
        kills[migrateMonsterId(k)] = (kills[migrateMonsterId(k)] || 0) + v;
      }
      rs.kills = kills;
      const loot = {};
      for (const [k, v] of Object.entries(rs.loot || {})) {
        loot[migrateResourceId(k)] = (loot[migrateResourceId(k)] || 0) + v;
      }
      rs.loot = loot;
      state.rateStats = rs;
    }

    state.upgrades = migrateUpgrades(data.upgrades);
    state.upgradeTiers = migrateUpgradeTiers(data.upgradeTiers, state.upgrades);
    state.pendingSlot = data.pendingSlot ?? (data.characters?.length ? null : 1);
    state.selectedCharIndex = data.selectedCharIndex ?? 0;
    if (data.smelting) {
      state.smelting = {
        skill: { ...defaultSkill(), ...data.smelting.skill },
        slots: (data.smelting.slots || defaultSmeltSlots()).map((s) => ({
          ore: s.ore ?? null,
          oreLoaded: s.oreLoaded ?? 0,
          progress: s.progress ?? 0,
          ready: s.ready ?? 0,
          readyBar: s.readyBar ?? null,
        })),
      };
    }
    if (Array.isArray(data.characters)) {
      state.characters = data.characters.map(hydrateCharacter);
    }
    if (data.producing && state.characters.length) {
      const legacy = data.producing;
      const char = state.characters[0];
      if (char && char.producing.activeSlot == null && legacy.slots) {
        for (let i = 0; i < legacy.slots.length; i++) {
          const s = legacy.slots[i];
          if (s?.item) {
            char.producing.activeSlot = i;
            char.producing.progress = s.progress ?? 0;
            char.producing.ready = s.ready ?? 0;
            char.producing.readyItem = s.item;
            break;
          }
        }
        char.producing.skill = { ...defaultSkill(), ...legacy.skill };
      }
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

  function carryEffectForSkill(skillId) {
    return C.CARRY_EFFECT_BY_SKILL[skillId] || 'carry_capacity';
  }

  const RESOURCE_SKILL_MAP = {
    copper: 'mining', iron: 'mining', gold: 'mining', platinum: 'mining',
    copper_bar: 'mining', iron_bar: 'mining', gold_bar: 'mining', platinum_bar: 'mining',
    oak: 'woodcutting', spruce: 'woodcutting', birch: 'woodcutting', jungle: 'woodcutting',
    shrimp: 'fishing', trout: 'fishing', salmon: 'fishing', lobster: 'fishing',
    slime_gel: 'combat', wisp_essence: 'combat', gloomspore: 'combat', bat_wing_membrane: 'combat',
    goblin_ear: 'combat', wolf_fur: 'combat', bandit_emblem: 'combat',
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
    const maxStack = C.STORAGE_STACK_MAX ?? 999999999;
    return addToSlots(state.storageSlots, resourceId, amount, maxStack, state.storageSlots.length);
  }

  function transferInvToStorage(state, char, slotIdx, amount = null) {
    const slot = char.inventorySlots[slotIdx];
    if (!slot || slot.amount <= 0) return false;
    const transferAmt = amount == null ? slot.amount : Math.min(amount, slot.amount);
    const result = addToStorage(state, slot.resourceId, transferAmt);
    if (result.added > 0) {
      slot.amount -= result.added;
      if (slot.amount <= 0) char.inventorySlots[slotIdx] = null;
      saveState(state);
      return true;
    }
    return false;
  }

  function transferStorageToInv(state, char, slotIdx, amount = null) {
    const slot = state.storageSlots[slotIdx];
    if (!slot || slot.amount <= 0) return false;
    const transferAmt = amount == null ? slot.amount : Math.min(amount, slot.amount);
    const skillId = RESOURCE_SKILL_MAP[slot.resourceId] || 'combat';
    const result = addToInventory(char, state, slot.resourceId, transferAmt, skillId);
    if (result.added > 0) {
      slot.amount -= result.added;
      if (slot.amount <= 0) state.storageSlots[slotIdx] = null;
      saveState(state);
      return true;
    }
    return false;
  }

  function storageHas(state, resourceId, amount) {
    return countInSlots(state.storageSlots, resourceId) >= amount;
  }

  function charInventoryResourceHas(char, resourceId, amount) {
    if (!char) return false;
    return countInInventory(char, resourceId) >= amount;
  }

  function removeFromCharInventory(char, resourceId, amount) {
    if (!char) return 0;
    return removeFromSlots(char.inventorySlots, resourceId, amount);
  }

  function removeFromStorage(state, resourceId, amount) {
    return removeFromSlots(state.storageSlots, resourceId, amount);
  }

  function countInInventory(char, resourceId) {
    return countInSlots(char.inventorySlots, resourceId);
  }

  function removeFromInventorySlot(char, slotIdx, amount) {
    const slot = char.inventorySlots[slotIdx];
    if (!slot || slot.amount <= 0) return 0;
    const take = Math.min(amount, slot.amount);
    slot.amount -= take;
    if (slot.amount <= 0) char.inventorySlots[slotIdx] = null;
    return take;
  }

  function loadOreToSmelt(state, char, invSlotIdx, smeltSlotIdx, maxLoad) {
    const invSlot = char.inventorySlots[invSlotIdx];
    const smeltSlot = state.smelting.slots[smeltSlotIdx];
    if (!invSlot || !smeltSlot) return 0;
    const isOre = C.SMELT_RECIPES.some((r) => r.ore === invSlot.resourceId);
    if (!isOre) return 0;
    if (!smeltSlot.ore) {
      smeltSlot.ore = invSlot.resourceId;
      smeltSlot.oreLoaded = 0;
      smeltSlot.progress = 0;
      smeltSlot.ready = 0;
      smeltSlot.readyBar = null;
    }
    if (invSlot.resourceId !== smeltSlot.ore) return 0;
    const space = Math.max(0, maxLoad - (smeltSlot.oreLoaded || 0));
    if (space <= 0) return 0;
    const take = Math.min(space, invSlot.amount);
    const removed = removeFromInventorySlot(char, invSlotIdx, take);
    smeltSlot.oreLoaded = (smeltSlot.oreLoaded || 0) + removed;
    saveState(state);
    return removed;
  }

  function loadState() {
    const keys = [
      getSaveKey(), 'worldroot_save_v4', 'worldroot_save_offline_v4',
      'worldroot_save_v3', 'worldroot_save_offline_v3',
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
    char.gatherCd = 0;
    char.combatCd = 0;
    if (activityId !== 'combat') char.combatState = null;
    saveState(state);
  }

  function stopActivity(state, charIndex) {
    const char = state.characters[charIndex];
    if (!char) return;
    char.activity = null;
    char.target = null;
    char.gatherCd = 0;
    char.combatCd = 0;
    char.combatState = null;
    saveState(state);
  }

  function stopAllSmelting(state) {
    for (const slot of state.smelting.slots) {
      slot.ore = null;
      slot.oreLoaded = 0;
      slot.progress = 0;
      slot.ready = 0;
      slot.readyBar = null;
    }
    saveState(state);
  }

  function stopAllProducing(state) {
    for (const char of state.characters) {
      const prod = char.producing;
      if (!prod) continue;
      prod.activeSlot = null;
      prod.progress = 0;
      prod.ready = 0;
      prod.readyItem = null;
    }
    saveState(state);
  }

  function stopCharacterProducing(char) {
    if (!char?.producing) return;
    char.producing.activeSlot = null;
    char.producing.progress = 0;
    char.producing.ready = 0;
    char.producing.readyItem = null;
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
    defaultSmeltSlots, defaultCharacterProducing, emptySlotArray,
    stackCapacity, inventorySlotCount, countInSlots, countEmptySlots,
    addToInventory, addToStorage, removeFromStorage, storageHas,
    charInventoryResourceHas, removeFromCharInventory,
    addToSlots, removeFromSlots, carryEffectForSkill, stackCapacityForResource,
    transferInvToStorage, transferStorageToInv,
    countInInventory, removeFromInventorySlot, loadOreToSmelt,
    stopAllSmelting, stopAllProducing, stopCharacterProducing,
  };
})();
