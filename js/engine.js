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

  function upgradeBonusDisplay(state, node) {
    const lv = upgradeLevel(state, node.id);
    if (node.bonusType === 'flat') {
      return { text: `+${lv * C.UPGRADE_FLAT_PER_LEVEL}`, isPercent: false };
    }
    return { text: `+${(lv * C.UPGRADE_BONUS_PER_LEVEL * 100).toFixed(0)}%`, isPercent: true };
  }

  function upgradeBonusPercent(state, nodeId) {
    const node = findUpgradeNode(nodeId)?.node;
    if (!node) return 0;
    const d = upgradeBonusDisplay(state, node);
    return d.isPercent ? parseFloat(d.text) : upgradeLevel(state, nodeId) * C.UPGRADE_FLAT_PER_LEVEL;
  }

  function effectBonus(state, effectType) {
    let bonus = 0;
    for (const branch of C.WORLD_TREE_BRANCHES) {
      for (const node of branch.nodes) {
        if (node.effect !== effectType) continue;
        if (node.bonusType === 'flat') {
          bonus += upgradeLevel(state, node.id) * C.UPGRADE_FLAT_PER_LEVEL;
        } else {
          bonus += upgradeLevel(state, node.id) * C.UPGRADE_BONUS_PER_LEVEL;
        }
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

  function charStat(state, char, statName) {
    const cls = C.CLASSES[char.classId];
    const base = cls?.baseStats?.[statName] ?? 0;
    return base + effectBonus(state, statName);
  }

  function gatherStatMult(state, char, skillId) {
    const sk = C.SKILLS[skillId];
    const statName = sk?.gatherStat || C.CLASSES[char.classId]?.gatherStat || 'strength';
    const stat = charStat(state, char, statName);
    return 1 + stat * C.STAT_SCALE;
  }

  function combatDamageMult(state, char) {
    const cls = C.CLASSES[char.classId];
    const statName = cls?.combatStat || 'strength';
    const stat = charStat(state, char, statName);
    const baseDmg = effectBonus(state, 'base_damage');
    const pctDmg = effectBonus(state, 'pct_damage');
    return (1 + stat * C.STAT_SCALE) * (1 + pctDmg) + baseDmg * 0.01;
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
    return Object.entries(costs).every(([res, amt]) => S.storageHas(state, res, amt));
  }

  function skillSpeed(state, skillId, char) {
    const skill = char.skills[skillId];
    const lv = skill?.level ?? 0;
    const yieldB = skillYieldBonus(state, skillId);
    const statM = gatherStatMult(state, char, skillId);
    return Math.floor((1 + lv * 0.05 + yieldB) * statM * 100) / 100;
  }

  function gatherIntervalTicks(state, skillId, char) {
    const speed = skillSpeed(state, skillId, char);
    return Math.max(1, Math.floor(C.GATHER_INTERVAL_TICKS / speed));
  }

  function gatherRatePerMin(state, skillId, char) {
    const interval = gatherIntervalTicks(state, skillId, char);
    const tickSec = C.TICK_MS / 1000;
    const actionsPerMin = 60 / (interval * tickSec);
    return Math.floor(actionsPerMin * 100) / 100;
  }

  function charMaxHp(state, char) {
    const baseHp = C.BASE_CHAR_HP;
    const hpBonus = effectBonus(state, 'base_hp');
    const combatLv = char.skills.combat?.level ?? 0;
    return Math.floor(baseHp + hpBonus + combatLv * 5);
  }

  function charDamage(state, char) {
    const dmgM = combatDamageMult(state, char);
    const baseDmg = effectBonus(state, 'base_damage');
    const combatLv = char.skills.combat?.level ?? 0;
    return Math.max(1, Math.floor(4 * dmgM + baseDmg + combatLv * 0.5));
  }

  function mobMaxHp(monster) {
    return monster.hp + monster.level * 5;
  }

  function initCombatState(state, char, monster) {
    const maxHp = mobMaxHp(monster);
    const charHp = charMaxHp(state, char);
    char.combatState = {
      mobId: monster.id,
      mobHp: maxHp,
      mobMaxHp: maxHp,
      charHp,
      charMaxHp: charHp,
    };
  }

  function ensureCombatState(state, char, monster) {
    const cs = char.combatState;
    if (!cs || cs.mobId !== monster.id) {
      initCombatState(state, char, monster);
    }
    return char.combatState;
  }

  function smeltSlotsUnlocked(state) {
    return C.SMELT_SLOT_UNLOCKS.filter((req) => state.smelting.skill.level >= req).length;
  }

  function produceSlotsUnlocked(state) {
    return C.UNLOCK_LEVELS.filter((req) => state.producing.skill.level >= req).length;
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

      if (!S.storageHas(state, slot.ore, 1)) {
        slot.progress = 0;
        continue;
      }

      S.removeFromStorage(state, slot.ore, 1);
      let bars = 1;
      if (Math.random() < multiMult * 0.1) bars += 1;
      slot.ready = (slot.ready || 0) + bars;
      slot.readyBar = recipe.bar;
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
      slot.ready = (slot.ready || 0) + output;
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

    const event = {
      charClass: char.classId, activity: char.activity, target: char.target,
      xpGain: 0, skill: skillId, resource: null, resourceAmount: 0, gold: 0,
      kill: false, monster: null, loot: null, lootAmount: 0, lost: 0,
      charHp: null, mobHp: null,
    };

    if (char.activity === 'combat') {
      const monster = findMonster(char.target);
      if (skill.level < monster.level) return event;

      const cs = ensureCombatState(state, char, monster);
      event.charHp = cs.charHp;
      event.mobHp = cs.mobHp;

      const charDmg = charDamage(state, char);
      const defence = effectBonus(state, 'base_defence');
      const mobDmg = Math.max(1, Math.floor(monster.damage - defence * 0.5));

      cs.mobHp -= charDmg;
      event.mobHp = cs.mobHp;

      if (cs.mobHp <= 0) {
        const xpMult = 1 + skillXpBonus(state, 'combat');
        const xpGain = Math.floor(C.BASE_XP_PER_TICK * 3 * xpMult);
        S.grantXp(skill, xpGain);
        event.xpGain = xpGain;
        event.kill = true;
        event.monster = monster.id;

        const goldMult = 1 + effectBonus(state, 'gold_gain');
        const goldMin = monster.goldMin ?? 1;
        const goldMax = monster.goldMax ?? goldMin;
        const goldGain = Math.floor((goldMin + Math.random() * (goldMax - goldMin + 1)) * goldMult);
        if (goldGain > 0) {
          state.gold += goldGain;
          event.gold = goldGain;
        }

        const dropChance = C.BASE_DROP_CHANCE + effectBonus(state, 'drop_rate');
        if (monster.drop && Math.random() < dropChance) {
          const dropAmt = monster.drop.amount;
          const result = S.addToInventory(char, state, monster.drop.id, dropAmt, 'combat');
          event.loot = monster.drop.id;
          event.lootAmount = result.added;
          event.lost = result.lost;
        }

        cs.mobHp = cs.mobMaxHp;
        cs.charHp = Math.min(cs.charMaxHp, cs.charHp + Math.floor(cs.charMaxHp * 0.1));
        event.mobHp = cs.mobHp;
        event.charHp = cs.charHp;
      } else {
        cs.charHp -= mobDmg;
        event.charHp = cs.charHp;
        if (cs.charHp <= 0) {
          cs.charHp = cs.charMaxHp;
          char.activity = null;
          char.target = null;
          char.combatState = null;
        }
      }
      return event;
    }

    const vein = findVein(skillId, char.target);
    if (!vein || skill.level < vein.minLevel) return event;

    char.gatherCd = (char.gatherCd || 0) + 1;
    const interval = gatherIntervalTicks(state, skillId, char);
    if (char.gatherCd < interval) return event;

    char.gatherCd = 0;
    const xpMult = 1 + skillXpBonus(state, skillId);
    const xpGain = Math.floor(C.BASE_XP_PER_TICK * xpMult);
    S.grantXp(skill, xpGain);
    event.xpGain = xpGain;

    const multiMult = skillMultiBonus(state, skillId);
    let amount = Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * skillSpeed(state, skillId, char)));
    if (Math.random() < multiMult * 0.1) {
      amount += Math.max(1, Math.floor(C.BASE_RESOURCE_PER_TICK * gatherStatMult(state, char, skillId)));
    }

    const result = S.addToInventory(char, state, vein.resource, amount, skillId);
    event.resource = vein.resource;
    event.resourceAmount = result.added;
    event.lost = result.lost;
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
      if (!S.storageHas(state, res, amt)) return false;
    }
    for (const [res, amt] of Object.entries(costs)) S.removeFromStorage(state, res, amt);
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
    slot.ready = 0;
    slot.readyBar = null;
    S.saveState(state);
    return true;
  }

  function setProduceSlot(state, slotIndex, itemId) {
    const slot = state.producing.slots[slotIndex];
    if (!slot) return false;
    slot.item = itemId;
    slot.progress = 0;
    slot.ready = 0;
    S.saveState(state);
    return true;
  }

  function clearSmeltSlot(state, slotIndex) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot) return;
    slot.ore = null;
    slot.progress = 0;
    slot.ready = 0;
    slot.readyBar = null;
    S.saveState(state);
  }

  function clearProduceSlot(state, slotIndex) {
    const slot = state.producing.slots[slotIndex];
    if (!slot) return;
    slot.item = null;
    slot.progress = 0;
    slot.ready = 0;
    S.saveState(state);
  }

  function collectProduce(state, slotIndex, charIndex) {
    const slot = state.producing.slots[slotIndex];
    const char = state.characters[charIndex];
    if (!slot?.ready || !char || !slot.item) return { collected: 0, lost: 0 };

    const result = S.addToInventory(char, state, slot.item, slot.ready, 'producing');
    const collected = result.added;
    slot.ready -= collected;
    if (slot.ready <= 0) slot.ready = 0;
    S.saveState(state);
    return { collected, lost: result.lost };
  }

  function collectSmelt(state, slotIndex) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot?.ready || !slot.readyBar) return 0;
    const result = S.addToStorage(state, slot.readyBar, slot.ready);
    const collected = result.added;
    slot.ready -= collected;
    if (slot.ready <= 0) {
      slot.ready = 0;
      slot.readyBar = null;
    }
    S.saveState(state);
    return collected;
  }

  window.WorldrootEngine = {
    upgradeLevel, upgradeCosts, upgradeBonusDisplay, upgradeBonusPercent, effectBonus,
    skillXpBonus, skillYieldBonus, skillMultiBonus, skillSpeed,
    gatherIntervalTicks, gatherRatePerMin, charMaxHp, charDamage, mobMaxHp,
    charStat, gatherStatMult, combatDamageMult,
    tick, buyUpgrade, canAffordUpgrade, findVein, findMonster,
    getRatePerHour, findUpgradeNode, smeltSlotsUnlocked, produceSlotsUnlocked,
    setSmeltSlot, setProduceSlot, clearSmeltSlot, clearProduceSlot,
    collectProduce, collectSmelt,
  };
})();
