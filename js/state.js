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

  function defaultPouchTiers() {
    return { material: 0, mining: 0, woodcutting: 0, fishing: 0 };
  }

  function defaultEquipment() {
    const eq = {};
    for (const s of C.EQUIPMENT_SLOTS || []) eq[s.id] = null;
    return eq;
  }

  function defaultTools() {
    const t = {};
    for (const s of C.TOOL_SLOTS || []) t[s.id] = null;
    return t;
  }

  function defaultQuestProgress() {
    return { kills: {}, gathered: {}, produced: {} };
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
      bagsUsed: [],
      pouchTiers: defaultPouchTiers(),
      equipment: defaultEquipment(),
      tools: defaultTools(),
      gatherCd: 0,
      combatCd: 0,
      combatState: null,
      producing: defaultCharacterProducing(),
      questProgress: defaultQuestProgress(),
      questClaims: {},
    };
  }

  function defaultState() {
    return {
      characters: [],
      gold: 0,
      storageSlots: emptySlotArray(C.BASE_STORAGE_SLOTS),
      storageChestsUsed: [],
      upgrades: emptyUpgrades(),
      upgradeTiers: emptyUpgradeTiers(),
      pendingSlot: 1,
      selectedCharIndex: 0,
      rateStats: defaultRateStats(),
      smelting: { skill: defaultSkill(), slots: defaultSmeltSlots() },
      lastTickAt: Date.now(),
    };
  }

  function serializeState(state) {
    return {
      characters: state.characters,
      gold: state.gold,
      storageSlots: state.storageSlots,
      storageChestsUsed: state.storageChestsUsed,
      upgrades: state.upgrades,
      upgradeTiers: state.upgradeTiers,
      pendingSlot: state.pendingSlot,
      selectedCharIndex: state.selectedCharIndex,
      rateStats: state.rateStats,
      smelting: state.smelting,
      lastTickAt: state.lastTickAt ?? Date.now(),
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
    const bagsUsed = Array.isArray(c.bagsUsed) ? [...c.bagsUsed] : [];
    if (!bagsUsed.length && (c.extraBagSlots || 0) > 0) {
      const n = Math.min(5, Math.floor(c.extraBagSlots / (C.BAG_SLOTS_ADD || 4)));
      for (let i = 1; i <= n; i++) bagsUsed.push(i);
    }
    const invCount = C.BASE_INVENTORY_SLOTS + bagsUsed.length * (C.BAG_SLOTS_ADD || 4);
    while (inventorySlots.length < invCount) inventorySlots.push(null);

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
      bagsUsed,
      pouchTiers: { ...defaultPouchTiers(), ...c.pouchTiers },
      equipment: { ...defaultEquipment(), ...c.equipment },
      tools: { ...defaultTools(), ...c.tools },
      gatherCd: c.gatherCd ?? 0,
      combatCd: c.combatCd ?? 0,
      combatState,
      producing,
      questProgress: { ...defaultQuestProgress(), ...c.questProgress },
      questClaims: { ...(c.questClaims || {}) },
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
    state.storageChestsUsed = Array.isArray(data.storageChestsUsed) ? [...data.storageChestsUsed] : [];
    const storCount = storageSlotCount(state);
    while (state.storageSlots.length < storCount) state.storageSlots.push(null);

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
      for (const char of state.characters) ensureInventorySize(char);
      if (data.questProgress && state.characters[0]) {
        const legacy = data.questProgress;
        const qp0 = state.characters[0].questProgress;
        const empty = !Object.keys(qp0.kills || {}).length
          && !Object.keys(qp0.gathered || {}).length
          && !Object.keys(qp0.produced || {}).length;
        if (empty) {
          state.characters[0].questProgress = { ...defaultQuestProgress(), ...legacy };
          state.characters[0].questClaims = { ...(data.questClaims || {}) };
        }
      }
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
    state.lastTickAt = data.lastTickAt ?? Date.now();
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
    slime_gel: 'combat', wisp_essence: 'combat', gloomspore: 'combat', bat_wing_membrane: 'combat',
    leech_sucker: 'combat', moth_pollen: 'combat',
    goblin_ear: 'combat', wolf_fur: 'combat', bandit_emblem: 'combat',
    twine: 'producing', wooden_pegs: 'producing', iron_nails: 'producing', resin: 'producing',
  };

  function stackCapacity(state, skillId, char = null) {
    const effect = carryEffectForSkill(skillId);
    let bonus = window.WorldrootEngine?.effectBonus(state, effect) || 0;
    bonus += window.WorldrootEngine?.effectBonus(state, 'carry_capacity') || 0;
    if (char && window.WorldrootEngine?.gearPercentBonus) {
      bonus += window.WorldrootEngine.gearPercentBonus(char, effect);
      bonus += window.WorldrootEngine.gearPercentBonus(char, 'carry_capacity');
    }
    return Math.floor(C.BASE_STACK_SIZE * (1 + bonus));
  }

  function stackCapacityForResource(state, resourceId, char) {
    if (C.GEAR_ITEM_IDS?.has(resourceId)) return 1;
    const cat = C.POUCH_CATEGORY_FOR_RESOURCE?.[resourceId];
    if (cat && char?.pouchTiers?.[cat] > 0) {
      return C.POUCH_CAPACITIES[char.pouchTiers[cat] - 1];
    }
    const skillId = RESOURCE_SKILL_MAP[resourceId] || 'combat';
    return stackCapacity(state, skillId, char);
  }

  function inventorySlotCount(char) {
    const bags = char?.bagsUsed?.length || 0;
    return C.BASE_INVENTORY_SLOTS + bags * (C.BAG_SLOTS_ADD || 4);
  }

  function storageSlotCount(state) {
    const chests = state?.storageChestsUsed?.length || 0;
    return C.BASE_STORAGE_SLOTS + chests * (C.CHEST_SLOTS_ADD || 3);
  }

  function ensureInventorySize(char) {
    const need = inventorySlotCount(char);
    while (char.inventorySlots.length < need) char.inventorySlots.push(null);
  }

  function ensureStorageSize(state) {
    const need = storageSlotCount(state);
    while (state.storageSlots.length < need) state.storageSlots.push(null);
  }

  function inventoryPageCount(char) {
    return Math.ceil(inventorySlotCount(char) / (C.INVENTORY_PAGE_SIZE || 16));
  }

  function storagePageCount(state) {
    return Math.ceil(storageSlotCount(state) / (C.STORAGE_PAGE_SIZE || 24));
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
    ensureInventorySize(char);
    const maxStack = stackCapacityForResource(state, resourceId, char);
    const slots = char.inventorySlots;
    const maxSlots = inventorySlotCount(char);
    return addToSlots(slots, resourceId, amount, maxStack, maxSlots);
  }

  function addToStorage(state, resourceId, amount) {
    ensureStorageSize(state);
    const maxStack = C.STORAGE_STACK_MAX ?? 999999999;
    return addToSlots(state.storageSlots, resourceId, amount, maxStack, storageSlotCount(state));
  }

  function depositAllToStorage(state, char) {
    if (!char) return 0;
    let moved = 0;
    for (let i = 0; i < char.inventorySlots.length; i++) {
      const slot = char.inventorySlots[i];
      if (!slot?.amount) continue;
      const result = addToStorage(state, slot.resourceId, slot.amount);
      if (result.added > 0) {
        slot.amount -= result.added;
        moved += result.added;
        if (slot.amount <= 0) char.inventorySlots[i] = null;
      }
    }
    if (moved > 0) saveState(state);
    return moved;
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

  function maxCharInventoryResource(state, resourceId) {
    let max = 0;
    for (const char of state.characters) {
      max = Math.max(max, countInInventory(char, resourceId));
    }
    return max;
  }

  function anyCharInventoryResourceHas(state, resourceId, amount) {
    return state.characters.some((char) => charInventoryResourceHas(char, resourceId, amount));
  }

  function findCharForResource(state, resourceId, amount, preferIndex) {
    const prefer = state.characters[preferIndex];
    if (prefer && charInventoryResourceHas(prefer, resourceId, amount)) return prefer;
    for (const char of state.characters) {
      if (charInventoryResourceHas(char, resourceId, amount)) return char;
    }
    return null;
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

  function splitSlotStack(slots, slotIdx, maxSlots) {
    const slot = slots[slotIdx];
    if (!slot || slot.amount < 2) return false;
    let emptyIdx = -1;
    for (let i = 0; i < maxSlots; i++) {
      if (!slots[i]) { emptyIdx = i; break; }
    }
    if (emptyIdx < 0) return false;
    const half = Math.floor(slot.amount / 2);
    if (half < 1) return false;
    const resourceId = slot.resourceId;
    slot.amount -= half;
    if (slot.amount <= 0) slots[slotIdx] = null;
    slots[emptyIdx] = { resourceId, amount: half };
    return true;
  }

  function splitInventorySlot(state, char, slotIdx) {
    if (!char) return false;
    const ok = splitSlotStack(char.inventorySlots, slotIdx, inventorySlotCount(char));
    if (ok) saveState(state);
    return ok;
  }

  function splitStorageSlot(state, slotIdx) {
    const ok = splitSlotStack(state.storageSlots, slotIdx, storageSlotCount(state));
    if (ok) saveState(state);
    return ok;
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
    if ((smeltSlot.oreLoaded || 0) > 0 && invSlot.resourceId !== smeltSlot.ore) return 0;
    if (!smeltSlot.ore || (smeltSlot.oreLoaded || 0) === 0) {
      if (smeltSlot.ore !== invSlot.resourceId) {
        smeltSlot.ore = invSlot.resourceId;
        smeltSlot.progress = 0;
      }
    }
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
    defaultSmeltSlots, defaultCharacterProducing, defaultQuestProgress, emptySlotArray,
    stackCapacity, inventorySlotCount, storageSlotCount, inventoryPageCount, storagePageCount,
    ensureInventorySize, ensureStorageSize, countInSlots, countEmptySlots,
    addToInventory, addToStorage, removeFromStorage, storageHas,
    charInventoryResourceHas, maxCharInventoryResource, anyCharInventoryResourceHas,
    findCharForResource, removeFromCharInventory,
    addToSlots, removeFromSlots, carryEffectForSkill, stackCapacityForResource,
    depositAllToStorage, transferInvToStorage, transferStorageToInv,
    countInInventory, removeFromInventorySlot, loadOreToSmelt,
    splitInventorySlot, splitStorageSlot, defaultQuestProgress,
    stopAllSmelting, stopAllProducing, stopCharacterProducing,
  };
})();
