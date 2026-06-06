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
    const found = findUpgradeNode(nodeId);
    if (!found) return {};
    const { node } = found;
    const scale = 1 + currentLevel * 0.15;
    return { [node.costRes]: Math.max(1, Math.floor(node.baseCost * scale)) };
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
    return C.CLASSES[char.classId]?.specialty === skillId;
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
    const costs = upgradeCosts(nodeId, upgradeLevel(state, nodeId));
    return Object.entries(costs).every(([res, amt]) => (state.storage[res] || 0) >= amt);
  }

  function skillSpeed(state, skillId, char) {
    const skill = char.skills[skillId];
    const lv = skill?.level ?? 0;
    const yieldB = skillYieldBonus(state, skillId);
    const spec = specialtyMult(char, skillId);
    return Math.floor((1 + lv * 0.05 + yieldB) * spec * 100) / 100;
  }

  function smeltSlotsUnlocked(state) {
    const lv = state.smelting.skill.level;
    return C.SMELT_SLOT_UNLOCKS.filter((req) => lv >= req).length;
  }

  function produceSlotsUnlocked(state) {
    const lv = state.producing.skill.level;
    return C.UNLOCK_LEVELS.filter((req) => lv >= req).length;
  }

  function tickSmelting(state) {
    const slotsOpen = smeltSlotsUnlocked(state);
    const speedMult = 1 + effectBonus(state, 'smelt_speed');
    const xpMult = 1 + effectBonus(state, 'smelt_xp');
    const multiMult = effectBonus(state, 'smelt_multi');

    for (let i = 0; i < slotsOpen; i++) {
      const slot = state.smelting.slots[i];
      if (!slot.ore) continue;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      if (!recipe) continue;
      const ticksNeeded = Math.max(3, Math.floor(C.SMELT_TICKS_PER_ORE / speedMult));
      slot.progress += 1;
      if (slot.progress < ticksNeeded) continue;

      if ((state.storage[slot.ore] || 0) < 1) {
        slot.progress = 0;
        continue;
      }

      state.storage[slot.ore] -= 1;
      let bars = 1;
      if (Math.random() < multiMult * 0.1) bars += 1;
      state.storage[recipe.bar] = (state.storage[recipe.bar] || 0) + bars;
      S.grantXp(state.smelting.skill, Math.floor(C.BASE_XP_PER_TICK * xpMult));
      slot.progress = 0;
    }
  }

  function tickProducing(state) {
    const slotsOpen = produceSlotsUnlocked(state);
    const speedMult = 1 + effectBonus(state, 'produce_speed');
    const xpMult = 1 + effectBonus(state, 'produce_xp');
    const multiMult = effectBonus(state, 'produce_multi');
    const capMult = 1 + effectBonus(state, 'produce_capacity');

    for (let i = 0; i < slotsOpen; i++) {
      const slot = state.producing.slots[i];
      if (!slot.item) continue;
      const def = C.PRODUCE_ITEMS.find((p) => p.id === slot.item);
      if (!def || state.producing.skill.level < def.minLevel) continue;

      const ticksNeeded = Math.max(3, Math.floor(def.ticks / (speedMult * capMult)));
      slot.progress += 1;
      if (slot.progress < ticksNeeded) continue;

      let output = def.output;
      if (Math.random() < multiMult * 0.1) output += 1;
      state.storage[def.id] = (state.storage[def.id] || 0) + output;
      S.grantXp(state.producing.skill, Math.floor(def.xp * xpMult));
      slot.progress = 0;
    }
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
      charClass: char.classId, activity: char.activity, target: char.target,
      xpGain, skill: skillId, resource: null, resourceAmount: 0, gold: 0,
      kill: false, monster: null, loot: null, lootAmount: 0,
    };

    if (char.activity === 'combat') {
      const monster = findMonster(char.target);
      if (skill.level < monster.level) return event;

      const goldMult = 1 + effectBonus(state, 'gold_gain');
      event.kill = true;
      event.monster = monster.id;

      if (monster.drop) {
        const dropAmt = Math.max(1, Math.floor(monster.drop.amount));
        S.addToCharacter(char, state, monster.drop.id, dropAmt);
        event.loot = monster.drop.id;
        event.lootAmount = dropAmt;
      }

      const goldGain = Math.floor((monster.level + 1) * 0.5 * goldMult);
      if (goldGain > 0) {
        state.gold += goldGain;
        event.gold = goldGain;
      }
      return event;
    }

    const vein = findVein(skillId, char.target);
    if (!vein || skill.level < vein.minLevel) return event;

    const speed = skillSpeed(state, skillId, char);
    const multiMult = skillMultiBonus(state, skillId);
    let amount = Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * speed));
    if (Math.random() < multiMult * 0.1) amount += Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * spec));

    S.addToCharacter(char, state, vein.resource, amount);
    event.resource = vein.resource;
    event.resourceAmount = amount;
    return event;
  }

  function tick(state) {
    S.refreshPendingSlot(state);
    tickSmelting(state);
    tickProducing(state);
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
      if ((state.storage[res] || 0) < amt) return false;
    }
    for (const [res, amt] of Object.entries(costs)) state.storage[res] -= amt;
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

  function setSmeltSlot(state, slotIndex, oreId) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot) return false;
    slot.ore = oreId;
    slot.progress = 0;
    S.saveState(state);
    return true;
  }

  function setProduceSlot(state, slotIndex, itemId) {
    const slot = state.producing.slots[slotIndex];
    if (!slot) return false;
    slot.item = itemId;
    slot.progress = 0;
    S.saveState(state);
    return true;
  }

  function clearSmeltSlot(state, slotIndex) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot) return;
    slot.ore = null;
    slot.progress = 0;
    S.saveState(state);
  }

  function clearProduceSlot(state, slotIndex) {
    const slot = state.producing.slots[slotIndex];
    if (!slot) return;
    slot.item = null;
    slot.progress = 0;
    S.saveState(state);
  }

  window.WorldrootEngine = {
    upgradeLevel, upgradeCosts, upgradeBonusPercent, effectBonus,
    skillXpBonus, skillYieldBonus, skillMultiBonus, skillSpeed,
    tick, buyUpgrade, canAffordUpgrade, findVein, findMonster,
    getRatePerHour, findUpgradeNode, smeltSlotsUnlocked, produceSlotsUnlocked,
    setSmeltSlot, setProduceSlot, clearSmeltSlot, clearProduceSlot,
  };
})();
