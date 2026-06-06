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
