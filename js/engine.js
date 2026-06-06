/** Worldroot — tick logic, resources, upgrades. */

(function () {
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

  function totalEfficiencyBonus(state, resourceId) {
    let bonus = 0;
    for (let i = 0; i < 3; i++) {
      const level = state.upgrades[upgradeKey(resourceId, i)] || 0;
      bonus += level * C.UPGRADE_EFFICIENCY_PER_LEVEL;
    }
    return bonus;
  }

  function skillEfficiencyBonus(state, skillId) {
    const skill = C.SKILLS[skillId];
    if (!skill?.resources?.length) return 0;
    let bonus = 0;
    for (const res of skill.resources) {
      bonus += totalEfficiencyBonus(state, res.id);
    }
    return bonus / skill.resources.length;
  }

  function hasSpecialty(char, skillId) {
    const cls = C.CLASSES[char.classId];
    return cls?.specialty === skillId;
  }

  function specialtyMult(char, skillId) {
    return hasSpecialty(char, skillId) ? 1 + C.SPECIALTY_BONUS : 1;
  }

  /** Pick a resource tier — mostly highest unlocked, sometimes one tier lower. */
  function rollResource(skillId, skillLevel) {
    const skill = C.SKILLS[skillId];
    const unlocked = skill.resources.filter((r) => skillLevel >= r.minLevel);
    if (!unlocked.length) return skill.resources[0];

    const best = unlocked[unlocked.length - 1];
    if (unlocked.length === 1 || Math.random() > 0.35) return best;

    const lower = unlocked[unlocked.length - 2];
    return lower;
  }

  function tickCharacter(state, char) {
    if (!char.activity) return null;

    const activity = C.ACTIVITIES.find((a) => a.id === char.activity);
    if (!activity) return null;

    const skillId = activity.skill;
    const skill = char.skills[skillId];
    if (!skill) return null;

    const eff = 1 + skillEfficiencyBonus(state, skillId);
    const spec = specialtyMult(char, skillId);
    const xpGain = Math.floor(C.BASE_XP_PER_TICK * eff * spec);
    S.grantXp(skill, xpGain);

    const event = {
      charClass: char.classId,
      activity: char.activity,
      xpGain,
      skill: skillId,
      resource: null,
      resourceAmount: 0,
      gold: 0,
      leveled: skill.level,
    };

    if (char.activity === 'combat') {
      event.gold = Math.floor(C.COMBAT_GOLD_PER_TICK * eff);
      state.gold += event.gold;
      return event;
    }

    const res = rollResource(skillId, skill.level);
    const amount = Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * eff * spec));
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
    totalEfficiencyBonus,
    skillEfficiencyBonus,
    tick,
    buyUpgrade,
    rollResource,
  };
})();
