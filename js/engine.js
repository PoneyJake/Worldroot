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
