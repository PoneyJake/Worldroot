/** Worldroot — constants, classes, resources, upgrades. */

window.WorldrootConfig = {
  SAVE_KEY: 'worldroot_save_v1',
  SAVE_KEY_OFFLINE: 'worldroot_save_offline_v1',
  TICK_MS: 1000,
  SPECIALTY_BONUS: 0.25,
  BASE_XP_PER_TICK: 10,
  BASE_RESOURCE_PER_TICK: 1,
  COMBAT_GOLD_PER_TICK: 1,
  UPGRADE_BONUS_PER_LEVEL: 0.01,

  SLOT_UNLOCK_AT: [0, 10, 25],
  MAX_SLOTS: 3,

  TABS: [
    { id: 'characters', label: 'Characters' },
    { id: 'skills', label: 'Skills' },
    { id: 'resources', label: 'Resources' },
    { id: 'worldroot', label: 'Worldroot' },
    { id: 'settings', label: 'Settings' },
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
      desc: 'Fight for gold and drops',
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
  },

  SKILL_ORDER: ['combat', 'mining', 'woodcutting', 'fishing'],

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
  ],

  /** 3 meaningful upgrade nodes per resource. effect drives bonus in engine.js */
  UPGRADES: [
    {
      id: 'coal', name: 'Coal', baseCost: 10,
      nodes: [
        { name: 'Chopping Efficiency', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Storage Capacity', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Mining EXP', effect: 'mining_xp', desc: '+1% mining XP per level' },
      ],
    },
    {
      id: 'copper', name: 'Copper', baseCost: 25,
      nodes: [
        { name: 'Forge Heat', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Smelter Storage', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Copper Mastery', effect: 'mining_xp', desc: '+1% mining XP per level' },
      ],
    },
    {
      id: 'iron', name: 'Iron', baseCost: 50,
      nodes: [
        { name: 'Deep Shaft', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Iron Hauling', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Iron EXP', effect: 'mining_xp', desc: '+1% mining XP per level' },
      ],
    },
    {
      id: 'gold', name: 'Gold', baseCost: 100,
      nodes: [
        { name: 'Midas Touch', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Vault Expansion', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Golden Insight', effect: 'combat_gold', desc: '+1% combat gold per level' },
      ],
    },
    {
      id: 'oak', name: 'Oak Log', baseCost: 10,
      nodes: [
        { name: 'Mining Efficiency', effect: 'mining_yield', desc: '+1% mining yield per level' },
        { name: 'Combat HP', effect: 'combat_hp', desc: '+1% combat HP per level' },
        { name: 'Woodcutting EXP', effect: 'woodcutting_xp', desc: '+1% woodcutting XP per level' },
      ],
    },
    {
      id: 'spruce', name: 'Spruce Log', baseCost: 25,
      nodes: [
        { name: 'Timber Pace', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Lumber Storage', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Spruce Mastery', effect: 'woodcutting_xp', desc: '+1% woodcutting XP per level' },
      ],
    },
    {
      id: 'birch', name: 'Birch Log', baseCost: 50,
      nodes: [
        { name: 'Sharp Axes', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Wood Piles', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Birch EXP', effect: 'woodcutting_xp', desc: '+1% woodcutting XP per level' },
      ],
    },
    {
      id: 'jungle', name: 'Jungle Log', baseCost: 100,
      nodes: [
        { name: 'Canopy Harvest', effect: 'woodcutting_yield', desc: '+1% woodcutting yield per level' },
        { name: 'Jungle Cache', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Wild Growth', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'shrimp', name: 'Shrimp', baseCost: 10,
      nodes: [
        { name: 'Net Repair', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Tackle Box', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Fishing EXP', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'trout', name: 'Trout', baseCost: 25,
      nodes: [
        { name: 'River Run', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Fish Barrel', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Trout Mastery', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'salmon', name: 'Salmon', baseCost: 50,
      nodes: [
        { name: 'Upstream Lure', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Cold Storage', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Salmon EXP', effect: 'fishing_xp', desc: '+1% fishing XP per level' },
      ],
    },
    {
      id: 'lobster', name: 'Lobster', baseCost: 100,
      nodes: [
        { name: 'Deep Water Traps', effect: 'fishing_yield', desc: '+1% fishing yield per level' },
        { name: 'Coastal Vault', effect: 'storage', desc: '+1% storage bonus per level' },
        { name: 'Combat EXP', effect: 'combat_xp', desc: '+1% combat XP per level' },
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
/** Worldroot — tick logic, resources, upgrades. */

(function () {
  if (!window.WorldrootConfig) {
    console.error('[Worldroot] config.js did not load before engine.js');
    return;
  }

  const C = window.WorldrootConfig;
  const S = window.WorldrootState;

  function upgradeKey(resourceId, nodeIndex) {
    return `${resourceId}_${nodeIndex}`;
  }

  function upgradeCost(resourceId, nodeIndex, currentLevel) {
    const def = C.UPGRADES.find((u) => u.id === resourceId);
    const base = def?.baseCost ?? 10;
    return Math.floor(base * (currentLevel + 1) * (nodeIndex + 1));
  }

  function effectBonus(state, effectType) {
    let bonus = 0;
    for (const res of C.UPGRADES) {
      res.nodes.forEach((node, i) => {
        if (node.effect !== effectType) return;
        bonus += (state.upgrades[upgradeKey(res.id, i)] || 0) * C.UPGRADE_BONUS_PER_LEVEL;
      });
    }
    return bonus;
  }

  function skillXpBonus(state, skillId) {
    return effectBonus(state, `${skillId}_xp`);
  }

  function skillYieldBonus(state, skillId) {
    return effectBonus(state, `${skillId}_yield`);
  }

  function nodeLevel(state, resourceId, nodeIndex) {
    return state.upgrades[upgradeKey(resourceId, nodeIndex)] || 0;
  }

  function nodeBonusPercent(state, resourceId, nodeIndex) {
    return nodeLevel(state, resourceId, nodeIndex) * C.UPGRADE_BONUS_PER_LEVEL * 100;
  }

  function hasSpecialty(char, skillId) {
    const cls = C.CLASSES[char.classId];
    return cls?.specialty === skillId;
  }

  function specialtyMult(char, skillId) {
    return hasSpecialty(char, skillId) ? 1 + C.SPECIALTY_BONUS : 1;
  }

  function rollResource(skillId, skillLevel) {
    const skill = C.SKILLS[skillId];
    const unlocked = skill.resources.filter((r) => skillLevel >= r.minLevel);
    if (!unlocked.length) return skill.resources[0];

    const best = unlocked[unlocked.length - 1];
    if (unlocked.length === 1 || Math.random() > 0.35) return best;
    return unlocked[unlocked.length - 2];
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
      xpGain,
      skill: skillId,
      resource: null,
      resourceAmount: 0,
      gold: 0,
    };

    if (char.activity === 'combat') {
      const goldMult = 1 + effectBonus(state, 'combat_gold');
      event.gold = Math.floor(C.COMBAT_GOLD_PER_TICK * goldMult);
      state.gold += event.gold;
      return event;
    }

    const yieldMult = 1 + skillYieldBonus(state, skillId);
    const res = rollResource(skillId, skill.level);
    const amount = Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * yieldMult * spec));
    state.resources[res.id] = (state.resources[res.id] || 0) + amount;
    event.resource = res.id;
    event.resourceAmount = amount;
    return event;
  }

  function tick(state) {
    S.refreshPendingSlot(state);
    const events = [];
    for (const char of state.characters) {
      const ev = tickCharacter(state, char);
      if (ev) events.push(ev);
    }
    S.saveState(state);
    return events;
  }

  function buyUpgrade(state, resourceId, nodeIndex) {
    const key = upgradeKey(resourceId, nodeIndex);
    const current = state.upgrades[key] || 0;
    const cost = upgradeCost(resourceId, nodeIndex, current);
    const owned = state.resources[resourceId] || 0;
    if (owned < cost) return false;

    state.resources[resourceId] -= cost;
    state.upgrades[key] = current + 1;
    S.saveState(state);
    return true;
  }

  window.WorldrootEngine = {
    upgradeKey,
    upgradeCost,
    effectBonus,
    skillXpBonus,
    skillYieldBonus,
    nodeLevel,
    nodeBonusPercent,
    tick,
    buyUpgrade,
    rollResource,
  };
})();
/** Worldroot — tabbed Melvor-style UI. */

(function () {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;

  const TABS = C?.TABS ?? [
    { id: 'characters', label: 'Characters' },
    { id: 'skills', label: 'Skills' },
    { id: 'resources', label: 'Resources' },
    { id: 'worldroot', label: 'Worldroot' },
    { id: 'settings', label: 'Settings' },
  ];
  const SKILL_ORDER = C?.SKILL_ORDER ?? ['combat', 'mining', 'woodcutting', 'fishing'];
  const MAX_SLOTS = C?.MAX_SLOTS ?? 3;

  let state = null;
  let activeTab = 'characters';
  let selectedSkillId = null;
  let logBuffer = [];

  const panels = {};

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
    for (const sk of Object.values(C.SKILLS)) {
      const r = sk.resources?.find((x) => x.id === id);
      if (r) return r.name;
    }
    return id;
  }

  function activityLabel(id) {
    if (!id) return 'Idle';
    return C.ACTIVITIES.find((a) => a.id === id)?.label ?? id;
  }

  function charLabel(char) {
    const cls = C.CLASSES[char.classId];
    return cls ? `${cls.icon} ${cls.name}` : 'Character';
  }

  function bestSkillLevel(skillId) {
    if (!state.characters.length) return 1;
    return Math.max(...state.characters.map((c) => c.skills[skillId]?.level ?? 1));
  }

  function charsOnSkill(skillId) {
    const skill = C.SKILLS[skillId];
    const act = skill?.activity;
    return state.characters
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.activity === act);
  }

  function addLog(text) {
    logBuffer.unshift(text);
    if (logBuffer.length > 15) logBuffer.length = 15;
    const log = $('activity-log');
    if (!log) return;
    log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  function renderLogEl() {
    const log = $('activity-log');
    if (!log) return;
    log.innerHTML = logBuffer.map((t) => `<li>${t}</li>`).join('');
  }

  /* ── Tab navigation ── */

  function switchTab(tabId) {
    activeTab = tabId;
    if (tabId !== 'skills') selectedSkillId = null;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    Object.entries(panels).forEach(([id, el]) => {
      el.classList.toggle('hidden', id !== tabId);
    });
    renderActivePanel();
  }

  function renderTabBar() {
    const bar = $('tab-bar');
    if (!bar) return;
    bar.innerHTML = TABS.map(
      (t) =>
        `<button type="button" class="tab-btn ${t.id === activeTab ? 'active' : ''}" data-action="switch-tab" data-tab="${t.id}">${t.label}</button>`
    ).join('');
  }

  /* ── HUD ── */

  function renderHud() {
    const acct = $('account-level');
    const gold = $('gold-total');
    if (acct) acct.textContent = fmt(S.accountTotalLevel(state));
    if (gold) gold.textContent = fmt(state.gold);
  }

  /* ── Characters tab ── */

  function renderCharactersPanel() {
    const el = panels.characters;
    if (!el) return;

    const account = S.accountTotalLevel(state);
    const next = S.nextSlotUnlock(account);
    let unlockHint = '';
    if (next) {
      unlockHint = `<p class="hint-bar">Next slot unlocks at Account Level <strong>${next.at}</strong></p>`;
    }

    const cards = state.characters.map((char, i) => {
      const cls = C.CLASSES[char.classId];
      const total = S.characterTotalLevel(char);
      const skills = SKILL_ORDER.map((sid) => {
        const lv = char.skills[sid]?.level ?? 1;
        return `<span class="char-stat"><em>${skillName(sid).slice(0, 3)}</em> ${lv}</span>`;
      }).join('');

      return `
        <article class="char-card" data-class="${char.classId}">
          <div class="char-card-top">
            <span class="char-icon">${cls.icon}</span>
            <div class="char-card-title">
              <strong>${cls.name}</strong>
              <span class="char-meta">${cls.desc}</span>
            </div>
            <span class="char-total">Lv ${total}</span>
          </div>
          <div class="char-activity-pill ${char.activity ? 'active' : ''}">
            ${activityLabel(char.activity)}
          </div>
          <div class="char-stats-row">${skills}</div>
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

    el.innerHTML = `
      ${unlockHint}
      <div class="char-grid">${cards.join('') || '<p class="empty-msg">Choose a class to begin your party.</p>'}</div>
      ${slots.length ? `<div class="slot-row">${slots.join('')}</div>` : ''}`;
  }

  /* ── Skills tab ── */

  function renderSkillsPanel() {
    const el = panels.skills;
    if (!el) return;

    if (selectedSkillId) {
      renderSkillDetail(el, selectedSkillId);
      return;
    }

    el.innerHTML = `
      <p class="panel-intro">Select a skill to view resources and assign characters.</p>
      <div class="skill-grid">
        ${SKILL_ORDER.map((sid) => {
          const sk = C.SKILLS[sid];
          const best = bestSkillLevel(sid);
          const assigned = charsOnSkill(sid);
          return `
            <button type="button" class="skill-card" data-action="open-skill" data-skill="${sid}">
              <span class="skill-card-icon">${sk.icon}</span>
              <span class="skill-card-name">${sk.name}</span>
              <span class="skill-card-lv">Best Lv ${best}</span>
              <span class="skill-card-sub">${assigned.length} active</span>
            </button>`;
        }).join('')}
      </div>`;
  }

  function renderSkillDetail(el, skillId) {
    const sk = C.SKILLS[skillId];
    const best = bestSkillLevel(skillId);
    const assigned = charsOnSkill(skillId);

    const tiers = sk.resources.length
      ? sk.resources
          .map((r) => {
            const ok = best >= r.minLevel;
            return `<li class="${ok ? 'unlocked' : 'locked'}">
              <span>${r.name}</span>
              <span>Lv ${r.minLevel}${ok ? '' : ' required'}</span>
            </li>`;
          })
          .join('')
      : `<li class="unlocked"><span>Gold</span><span>Always</span></li>
         <li class="locked"><span>Mob drops</span><span>Coming soon</span></li>`;

    const assignBtns = state.characters.length
      ? state.characters
          .map((char, i) => {
            const on = char.activity === sk.activity;
            return `
              <button type="button" class="btn-sm ${on ? 'active' : ''}"
                data-action="set-activity" data-char="${i}" data-activity="${sk.activity}">
                ${charLabel(char)}${on ? ' ✓' : ''}
              </button>`;
          })
          .join('')
      : '<p class="empty-msg">Unlock a character first.</p>';

    const assignedList = assigned.length
      ? assigned.map(({ c }) => charLabel(c)).join(', ')
      : 'None';

    el.innerHTML = `
      <button type="button" class="back-btn" data-action="close-skill">← Skills</button>
      <header class="skill-detail-head">
        <span class="skill-detail-icon">${sk.icon}</span>
        <div>
          <h2>${sk.name}</h2>
          <p>${sk.desc}</p>
        </div>
        <span class="skill-detail-lv">Best Lv ${best}</span>
      </header>

      <div class="detail-grid">
        <section class="detail-box">
          <h3>Resources</h3>
          <ul class="tier-list">${tiers}</ul>
        </section>
        <section class="detail-box">
          <h3>Assigned</h3>
          <p class="assigned-text">${assignedList}</p>
        </section>
      </div>

      <section class="detail-box">
        <h3>Assign characters</h3>
        <div class="btn-row">${assignBtns}</div>
      </section>`;
  }

  /* ── Resources tab ── */

  function renderResourcesPanel() {
    const el = panels.resources;
    if (!el) return;

    const groups = [
      { title: 'Mining', icon: '⛏', ids: ['coal', 'copper', 'iron', 'gold'] },
      { title: 'Woodcutting', icon: '🪓', ids: ['oak', 'spruce', 'birch', 'jungle'] },
      { title: 'Fishing', icon: '🎣', ids: ['shrimp', 'trout', 'salmon', 'lobster'] },
      {
        title: 'Combat',
        icon: '🗡',
        custom: `
          <div class="res-item"><span>Gold</span><strong>${fmt(state.gold)}</strong></div>
          <div class="res-item res-placeholder"><span>Mob drops</span><strong>—</strong></div>`,
      },
    ];

    el.innerHTML = groups
      .map((g) => {
        const items = g.custom
          ? g.custom
          : g.ids
              .map(
                (id) =>
                  `<div class="res-item"><span>${resName(id)}</span><strong>${fmt(state.resources[id] || 0)}</strong></div>`
              )
              .join('');
        return `
          <section class="res-section">
            <h3>${g.icon} ${g.title}</h3>
            <div class="res-grid">${items}</div>
          </section>`;
      })
      .join('');
  }

  /* ── Worldroot tab ── */

  function renderWorldrootPanel() {
    const el = panels.worldroot;
    if (!el) return;

    el.innerHTML = `
      <p class="panel-intro">Spend resources to grow the Worldroot. Each node levels infinitely.</p>
      ${C.UPGRADES.map((res) => {
        const nodes = res.nodes
          .map((node, i) => {
            const lv = E.nodeLevel(state, res.id, i);
            const pct = E.nodeBonusPercent(state, res.id, i).toFixed(0);
            const cost = E.upgradeCost(res.id, i, lv);
            const owned = state.resources[res.id] || 0;
            const can = owned >= cost;
            return `
              <div class="upgrade-row">
                <div class="upgrade-info">
                  <strong>${node.name}</strong>
                  <span>Lv ${lv} · +${pct}% · ${node.desc.split(' per')[0]}</span>
                </div>
                <button type="button" class="btn-sm ${can ? '' : 'disabled'}"
                  data-action="buy-upgrade" data-resource="${res.id}" data-node="${i}"
                  ${can ? '' : 'disabled'}>
                  ${fmt(cost)} ${res.name}
                </button>
              </div>`;
          })
          .join('');
        return `
          <section class="upgrade-section">
            <h3>${res.name}</h3>
            ${nodes}
          </section>`;
      }).join('')}`;
  }

  /* ── Settings tab ── */

  function renderSettingsPanel() {
    const el = panels.settings;
    if (!el) return;

    const session = window.WorldrootSession;
    const sessionText = session?.isCloud
      ? `Cloud save · ${session.displayName}`
      : 'Offline · this device only';

    el.innerHTML = `
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
      </section>
      <section class="detail-box">
        <h3>Activity log</h3>
        <ul id="activity-log" class="log"></ul>
      </section>`;
    renderLogEl();
  }

  /* ── Class modal ── */

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

  /* ── Render orchestration ── */

  function renderActivePanel() {
    switch (activeTab) {
      case 'characters':
        renderCharactersPanel();
        break;
      case 'skills':
        renderSkillsPanel();
        break;
      case 'resources':
        renderResourcesPanel();
        break;
      case 'worldroot':
        renderWorldrootPanel();
        break;
      case 'settings':
        renderSettingsPanel();
        break;
      default:
        break;
    }
  }

  function render() {
    renderHud();
    renderTabBar();
    renderActivePanel();
    renderClassModal();
  }

  /* ── Events ── */

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'switch-tab') {
      switchTab(btn.dataset.tab);
      return;
    }

    if (action === 'open-skill') {
      selectedSkillId = btn.dataset.skill;
      renderSkillsPanel();
      return;
    }

    if (action === 'close-skill') {
      selectedSkillId = null;
      renderSkillsPanel();
      return;
    }

    if (action === 'pick-class') {
      S.addCharacter(state, btn.dataset.class);
      addLog(`${C.CLASSES[btn.dataset.class].name} joined.`);
      render();
      return;
    }

    if (action === 'open-class') {
      state.pendingSlot = Number(btn.dataset.slot);
      renderClassModal();
      return;
    }

    if (action === 'set-activity') {
      const idx = Number(btn.dataset.char);
      S.setActivity(state, idx, btn.dataset.activity);
      addLog(`${charLabel(state.characters[idx])} → ${activityLabel(btn.dataset.activity)}`);
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

    if (action === 'buy-upgrade') {
      const resId = btn.dataset.resource;
      const node = Number(btn.dataset.node);
      const def = C.UPGRADES.find((u) => u.id === resId);
      if (E.buyUpgrade(state, resId, node)) {
        addLog(`Upgraded ${def.nodes[node].name}.`);
        render();
      }
      return;
    }

    if (action === 'reset-save') {
      if (confirm('Reset all progress? This cannot be undone.')) {
        state = S.resetState();
        selectedSkillId = null;
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

  function setSessionBadge(session) {
    /* session info lives in Settings tab now */
    if (session && activeTab === 'settings') renderSettingsPanel();
  }

  function init(initialState) {
    state = initialState;
    TABS.forEach((t) => {
      panels[t.id] = $(`panel-${t.id}`);
    });
    document.body.addEventListener('click', handleClick);
    renderTabBar();
    switchTab('characters');

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
    const panel = document.getElementById('panel-characters');
    if (panel) {
      panel.classList.remove('hidden');
      panel.innerHTML = `<p class="empty-msg" style="color:#e8a0a0">${msg}</p>`;
    }
    const bar = document.getElementById('tab-bar');
    if (bar) bar.innerHTML = '<button type="button" class="tab-btn active" disabled>Error</button>';
  }

  /** Boot game immediately — do not wait for auth module. */
  function autoBoot() {
    try {
      const S = window.WorldrootState;
      const E = window.WorldrootEngine;
      if (!S || !E) {
        showBootError('Game failed to load. Hard refresh (Ctrl+Shift+R) or try Play offline from the home page.');
        return;
      }

      const mode = sessionStorage.getItem('worldroot_play_mode');
      S.setPlayMode(mode === 'cloud' ? 'cloud' : 'offline');

      window.WorldrootSession = window.WorldrootSession || {
        isCloud: mode === 'cloud',
        isOffline: mode !== 'cloud',
        displayName: 'Offline',
      };

      if (window.__worldrootBooted) return;
      window.__worldrootBooted = true;

      const gameState = S.loadState();
      init(gameState);

      if (!gameState.characters.length) {
        addLog('Welcome to Worldroot. Choose your first class.');
      } else {
        addLog('Welcome back to Worldroot.');
      }

      setInterval(() => {
        E.tick(getState());
        S.refreshPendingSlot(getState());
        refresh();
      }, C?.TICK_MS ?? 1000);

      window.addEventListener('beforeunload', () => {
        S.saveState(getState());
        if (window.WorldrootCloud?.flush) window.WorldrootCloud.flush();
      });
    } catch (err) {
      console.error('[Worldroot] boot failed:', err);
      showBootError(`Game error: ${err.message}. Try Reset save in Settings or clear browser data for this site.`);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})();
