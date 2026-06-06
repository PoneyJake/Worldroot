/** Worldroot — save/load and state helpers. */

(function () {
  if (!window.WorldrootConfig) {
    console.error('[Worldroot] config.js did not load before state.js');
    return;
  }

  const { SAVE_KEY, SAVE_KEY_OFFLINE, RESOURCE_IDS, CLASSES, SLOT_UNLOCK_AT } = window.WorldrootConfig;

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
    };
  }

  function hydrateState(data) {
    const state = defaultState();
    state.gold = data.gold ?? 0;
    state.resources = { ...state.resources, ...(data.resources || {}) };
    state.upgrades = { ...state.upgrades, ...(data.upgrades || {}) };
    state.pendingSlot = data.pendingSlot ?? (data.characters?.length ? null : 1);
    if (Array.isArray(data.characters)) {
      state.characters = data.characters.map((c) => ({
        classId: c.classId,
        activity: c.activity ?? null,
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

  function emptyUpgrades() {
    const u = {};
    for (const res of window.WorldrootConfig.UPGRADES) {
      for (let i = 0; i < 3; i++) {
        u[`${res.id}_${i}`] = 0;
      }
    }
    return u;
  }

  function defaultSkill() {
    return { level: 1, xp: 0 };
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
    };
  }

  function defaultState() {
    return {
      characters: [],
      gold: 0,
      resources: emptyResources(),
      upgrades: emptyUpgrades(),
      pendingSlot: 1,
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
    try {
      const raw = localStorage.getItem(getSaveKey());
      if (!raw) return defaultState();
      return hydrateState(JSON.parse(raw));
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(getSaveKey(), JSON.stringify(serializeState(state)));
  }

  function resetState() {
    localStorage.removeItem(getSaveKey());
    return defaultState();
  }

  /** If a new slot unlocked, prompt class selection. */
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

  function setActivity(state, charIndex, activityId) {
    const char = state.characters[charIndex];
    if (!char) return;
    char.activity = activityId;
    saveState(state);
  }

  function stopActivity(state, charIndex) {
    const char = state.characters[charIndex];
    if (!char) return;
    char.activity = null;
    saveState(state);
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
  };
})();
