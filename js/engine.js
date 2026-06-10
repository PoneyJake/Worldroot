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

  function upgradeTierCount(state, nodeId) {
    return state.upgradeTiers?.[nodeId] || 0;
  }

  function upgradeMaxLevel(state, nodeId) {
    const tiers = upgradeTierCount(state, nodeId);
    return Math.min(C.UPGRADE_MAX_LEVEL, tiers * C.UPGRADE_TIER_SIZE);
  }

  function upgradeNeedsUnlock(state, nodeId) {
    const lv = upgradeLevel(state, nodeId);
    if (lv >= C.UPGRADE_MAX_LEVEL) return false;
    const tiers = upgradeTierCount(state, nodeId);
    if (tiers === 0) return true;
    return lv >= tiers * C.UPGRADE_TIER_SIZE;
  }

  function upgradeUnlockIndex(state, nodeId) {
    return upgradeTierCount(state, nodeId);
  }

  function upgradeUnlockCosts(nodeId, tierIndex) {
    const found = findUpgradeNode(nodeId);
    if (!found) return null;
    const resAmt = C.UPGRADE_UNLOCK_RESOURCES[tierIndex];
    if (resAmt == null) return null;
    return { resource: found.node.costRes, resourceAmt: resAmt };
  }

  function upgradeLevelGoldCost(state, nodeId) {
    const tiers = upgradeTierCount(state, nodeId);
    if (tiers <= 0) return null;
    const gold = C.UPGRADE_LEVEL_GOLD[tiers - 1];
    return gold == null ? null : gold;
  }

  function upgradeUnlockTargetMax(tierIndex) {
    return Math.min(C.UPGRADE_MAX_LEVEL, (tierIndex + 1) * C.UPGRADE_TIER_SIZE);
  }

  function canUnlockUpgrade(state, nodeId) {
    if (!upgradeNeedsUnlock(state, nodeId)) return false;
    const costs = upgradeUnlockCosts(nodeId, upgradeUnlockIndex(state, nodeId));
    if (!costs) return false;
    return S.anyCharInventoryResourceHas(state, costs.resource, costs.resourceAmt);
  }

  function canLevelUpgrade(state, nodeId) {
    const lv = upgradeLevel(state, nodeId);
    if (lv >= upgradeMaxLevel(state, nodeId) || lv >= C.UPGRADE_MAX_LEVEL) return false;
    if (upgradeNeedsUnlock(state, nodeId)) return false;
    const goldCost = upgradeLevelGoldCost(state, nodeId);
    return goldCost != null && state.gold >= goldCost;
  }

  function upgradeCosts(nodeId, currentLevel) {
    return {};
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

  function equippedItemIds(char) {
    if (!char) return [];
    const ids = [];
    for (const itemId of Object.values(char.equipment || {})) if (itemId) ids.push(itemId);
    for (const itemId of Object.values(char.tools || {})) if (itemId) ids.push(itemId);
    return ids;
  }

  function gearFlatBonus(char, effectType) {
    let sum = 0;
    for (const id of equippedItemIds(char)) {
      sum += C.GEAR_STATS?.[id]?.flat?.[effectType] ?? 0;
    }
    return sum;
  }

  function gearPercentBonus(char, effectType) {
    let sum = 0;
    for (const id of equippedItemIds(char)) {
      sum += C.GEAR_STATS?.[id]?.percent?.[effectType] ?? 0;
    }
    return sum;
  }

  function charEffectBonus(state, char, effectType, isPercent = false) {
    const wt = effectBonus(state, effectType);
    const gear = char
      ? (isPercent ? gearPercentBonus(char, effectType) : gearFlatBonus(char, effectType))
      : 0;
    return wt + gear;
  }

  function talentTreeKey(skillId) {
    return C.TALENT_SKILL_MAP?.[skillId] || skillId;
  }

  function skillForTalents(state, char, skillId) {
    if (skillId === 'smelting') return state.smelting?.skill;
    if (skillId === 'producing') return char?.producing?.skill;
    return char?.skills?.[skillId];
  }

  function talentLevel(state, char, skillId, talentId) {
    const skill = skillForTalents(state, char, skillId);
    return skill?.talents?.[talentId] ?? 0;
  }

  function talentDef(skillId, talentId) {
    const treeKey = talentTreeKey(skillId);
    return (C.TALENT_TREES?.[treeKey] || []).find((d) => d.id === talentId);
  }

  function talentBonus(state, char, skillId, talentId, kind) {
    const def = talentDef(skillId, talentId);
    if (!def) return 0;
    const lv = talentLevel(state, char, skillId, talentId);
    if (kind === 'flat') return lv * (def.flat ?? 0);
    if (kind === 'percent') return lv * (def.percent ?? 0);
    return 0;
  }

  function talentPointsAvailable(state, char, skillId) {
    return skillForTalents(state, char, skillId)?.talentPoints ?? 0;
  }

  function buyTalent(state, char, skillId, talentId) {
    if (skillId !== 'smelting' && !char) return false;
    const skill = skillForTalents(state, char, skillId);
    if (!skill || !talentDef(skillId, talentId)) return false;
    if (!S.spendTalentPoint(skill, talentId)) return false;
    S.saveState(state);
    return true;
  }

  function formatTalentTotal(def, level) {
    if (!def || level <= 0) return '—';
    if (def.flat) return `+${def.flat * level}`;
    if (def.percent) return `+${(def.percent * level * 100).toFixed(level * def.percent < 0.01 ? 2 : 1)}%`;
    return '—';
  }

  function skillXpBonus(state, skillId, char = null) {
    let bonus = effectBonus(state, `${skillId}_xp`);
    if (char) bonus += gearPercentBonus(char, 'xp_gain');
    if (char) bonus += talentBonus(state, char, skillId, 'xp', 'percent');
    return bonus;
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
    const flat = effectBonus(state, statName) + gearFlatBonus(char, statName)
      + talentBonus(state, char, 'combat', statName, 'flat');
    const pct = gearPercentBonus(char, `${statName}_pct`);
    return Math.floor((base + flat) * (1 + pct));
  }

  function gatherStatBonus(state, char, skillId) {
    const sk = C.SKILLS[skillId];
    const statName = sk?.gatherStat || C.CLASSES[char.classId]?.gatherStat || 'strength';
    return Math.floor(charStat(state, char, statName));
  }

  function gatherStatMult(state, char, skillId) {
    return 1;
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
    return canUnlockUpgrade(state, nodeId) || canLevelUpgrade(state, nodeId);
  }

  function veinTier(vein) {
    return Math.floor((vein?.minLevel ?? 0) / 10);
  }

  function veinEffBreakpoints(vein) {
    const mult = Math.pow(5, veinTier(vein));
    return C.VEIN_EFF_CURVE.map(([eff, pct]) => ({ eff: eff * mult, pct }));
  }

  function veinEffThreshold(vein) {
    const bps = veinEffBreakpoints(vein);
    return bps[1]?.eff ?? bps[0].eff;
  }

  function effForSuccessPercent(targetPct, vein) {
    const bps = veinEffBreakpoints(vein);
    if (targetPct <= 0) return 0;
    if (targetPct <= bps[0].pct) {
      return (targetPct / bps[0].pct) * bps[0].eff;
    }
    for (let i = 0; i < bps.length - 1; i++) {
      const a = bps[i];
      const b = bps[i + 1];
      if (targetPct <= b.pct) {
        const t = (targetPct - a.pct) / (b.pct - a.pct);
        return a.eff + t * (b.eff - a.eff);
      }
    }
    const last = bps[bps.length - 1];
    return last.eff * (targetPct / last.pct);
  }

  function gatherYieldTierInfo(state, char, skillId, vein) {
    const eff = gatherEfficiency(state, char, skillId);
    const successPct = gatherSuccessPercent(eff, vein);
    const nextAmount = Math.floor(successPct / 100) + 1;
    const progressToNext = successPct % 100;
    const effFor100Next = Math.ceil(effForSuccessPercent(nextAmount * 100, vein));
    const multiPct = (gatherMultiChance(state, char, skillId) * 100).toFixed(1);
    return { eff, successPct, nextAmount, progressToNext, effFor100Next, multiPct };
  }

  function gatherMinCatchPercent() {
    return C.VEIN_EFF_CURVE[0]?.[1] ?? 10;
  }

  function gatherPlusOneThresholds(vein) {
    const minCatch = gatherMinCatchPercent();
    return {
      effFor10: Math.ceil(effForSuccessPercent(minCatch, vein)),
      effFor100: Math.ceil(effForSuccessPercent(100, vein)),
    };
  }

  function gatherCatchDisplayPercent(state, char, skillId, vein) {
    const eff = gatherEfficiency(state, char, skillId);
    const successPct = gatherSuccessPercent(eff, vein);
    const minCatch = gatherMinCatchPercent();
    if (successPct < minCatch) return 0;
    if (successPct >= 100) return 100;
    return successPct;
  }

  function gatherSuccessPercent(eff, vein) {
    const bps = veinEffBreakpoints(vein);
    if (eff <= 0) return 0;
    if (eff < bps[0].eff) return 0;
    if (eff <= bps[0].eff) {
      return bps[0].pct;
    }
    for (let i = 0; i < bps.length - 1; i++) {
      const a = bps[i];
      const b = bps[i + 1];
      if (eff <= b.eff) {
        const t = (eff - a.eff) / (b.eff - a.eff);
        return a.pct + t * (b.pct - a.pct);
      }
    }
    return bps[bps.length - 1].pct;
  }

  function rollAmountFromSuccessPct(successPct) {
    if (successPct < gatherMinCatchPercent()) return 0;
    const full = Math.floor(successPct / 100);
    const rem = (successPct % 100) / 100;
    return full + (Math.random() < rem ? 1 : 0);
  }

  function baseMultiKillBonus(state) {
    return effectBonus(state, 'multikill_rate');
  }

  function allSkillEffBonus(state) {
    return effectBonus(state, 'all_skill_eff');
  }

  function gatherEfficiency(state, char, skillId) {
    const lv = char.skills[skillId]?.level ?? 0;
    const yieldB = skillYieldBonus(state, skillId) + gearFlatBonus(char, `${skillId}_yield`);
    const statB = gatherStatBonus(state, char, skillId);
    const talentEff = talentBonus(state, char, skillId, 'eff', 'flat');
    return C.BASE_GATHER_EFFICIENCY + Math.floor(lv * C.LEVEL_EFF_BONUS + yieldB) + statB + allSkillEffBonus(state) + talentEff;
  }

  function gatherMultiChance(state, char, skillId) {
    const lv = char.skills[skillId]?.level ?? 0;
    return lv * C.LEVEL_MULTI_BONUS + skillMultiBonus(state, skillId) + baseMultiKillBonus(state)
      + talentBonus(state, char, skillId, 'multi', 'percent');
  }

  function gatherSpeedBonus(state, char, skillId) {
    return charEffectBonus(state, char, `${skillId}_speed`, true)
      + talentBonus(state, char, skillId, 'speed', 'percent');
  }

  function gatherIntervalTicks(state, char, skillId) {
    const speedMult = 1 + gatherSpeedBonus(state, char, skillId);
    return Math.max(1, Math.floor(C.GATHER_INTERVAL_TICKS / speedMult));
  }

  function gatherSuccessChance(state, char, skillId, vein) {
    const eff = gatherEfficiency(state, char, skillId);
    return gatherSuccessPercent(eff, vein);
  }

  function rollGatherAmount(state, char, skillId, vein) {
    const eff = gatherEfficiency(state, char, skillId);
    let amount = rollAmountFromSuccessPct(gatherSuccessPercent(eff, vein));

    if (amount > 0 && Math.random() < gatherMultiChance(state, char, skillId)) {
      amount += 1;
    }

    return amount;
  }

  function gatherRatePerMin() {
    return C.GATHER_RATE_PER_MIN;
  }

  function charMaxHp(state, char) {
    return Math.floor(C.BASE_CHAR_HP + charEffectBonus(state, char, 'base_hp', false)
      + talentBonus(state, char, 'combat', 'hp', 'flat'));
  }

  function charMaxMp(state, char) {
    return Math.floor(C.BASE_CHAR_MP + charEffectBonus(state, char, 'base_mp', false)
      + talentBonus(state, char, 'combat', 'mp', 'flat'));
  }

  function charDamage(state, char) {
    const cls = C.CLASSES[char.classId];
    const statName = cls?.combatStat || 'strength';
    const combatStat = charStat(state, char, statName);
    const baseDmg = charEffectBonus(state, char, 'base_damage', false);
    const pctDmg = charEffectBonus(state, char, 'pct_damage', true);
    const raw = C.BASE_CHAR_DAMAGE + baseDmg + combatStat;
    return Math.max(1, Math.floor(raw * (1 + pctDmg)));
  }

  function charDefence(state, char) {
    return charEffectBonus(state, char, 'base_defence', false)
      + talentBonus(state, char, 'combat', 'def', 'flat');
  }

  function charAccuracy(state, char) {
    return Math.floor(C.BASE_ACCURACY + charEffectBonus(state, char, 'base_accuracy', false)
      + talentBonus(state, char, 'combat', 'acc', 'flat'));
  }

  function combatHitChance(state, char, monster) {
    const need = monster?.accuracy ?? 0;
    if (need <= 0) return 1;
    return Math.min(1, charAccuracy(state, char) / need);
  }

  function combatAttackSec(state, char) {
    const speedBonus = charEffectBonus(state, char, 'attack_speed', true)
      + talentBonus(state, char, 'combat', 'attack_speed', 'percent');
    return C.COMBAT_ATTACK_SEC / (1 + speedBonus);
  }

  function dropBonus(state, char = null) {
    let bonus = effectBonus(state, 'drop_rate') + (char ? gearPercentBonus(char, 'drop_rate') : 0);
    if (char) bonus += talentBonus(state, char, 'combat', 'drop_rate', 'percent');
    return bonus;
  }

  function mobMaxHp(monster) {
    return monster.hp + monster.level * 5;
  }

  function dropChance(state, char = null) {
    return C.BASE_DROP_CHANCE + dropBonus(state, char);
  }

  function combatXpPerKill(state, char, monster) {
    if (!char) return 0;
    const base = monster?.xp ?? 5;
    const xpMult = 1 + skillXpBonus(state, 'combat', char);
    return Math.floor(base * xpMult);
  }

  function gatherXpPerAction(state, char, skillId, vein) {
    if (!char) return 0;
    const base = vein?.xp ?? 5;
    const xpMult = 1 + skillXpBonus(state, skillId, char);
    return Math.floor(base * xpMult);
  }

  function getTheoreticalCombatRates(state, char, monster) {
    if (!char || (char.skills.combat?.level ?? 0) < monster.level) {
      return { xpHr: 0, killsHr: 0, hitPct: 0 };
    }
    const attackSec = combatAttackSec(state, char);
    const attacksPerHr = 3600 / attackSec;
    const hitPct = combatHitChance(state, char, monster);
    const dmg = charDamage(state, char);
    const hitsPerKill = Math.ceil(mobMaxHp(monster) / Math.max(1, dmg));
    const killsHr = Math.floor(attacksPerHr * hitPct / hitsPerKill);
    const xpPerKill = combatXpPerKill(state, char, monster);
    return { xpHr: killsHr * xpPerKill, killsHr, hitPct };
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
      respawnSec: 0,
      mobDead: false,
    };
  }

  function ensureCombatState(state, char, monster) {
    const cs = char.combatState;
    if (!cs || cs.mobId !== monster.id) {
      const keepRespawn = cs?.respawnSec > 0 ? cs.respawnSec : 0;
      initCombatState(state, char, monster);
      if (keepRespawn > 0) {
        char.combatState.respawnSec = keepRespawn;
        char.combatState.charHp = 0;
      }
    } else if (cs.respawnSec === undefined) {
      cs.respawnSec = 0;
    }
    return char.combatState;
  }

  function smeltBatchCapacity(state) {
    const bonus = effectBonus(state, 'smelt_capacity')
      + talentBonus(state, null, 'smelting', 'capacity', 'percent');
    return Math.floor(C.SMELT_BASE_CAPACITY * (1 + bonus));
  }

  function produceBatchCapacity(state, char = null) {
    const sel = char || state.characters[state.selectedCharIndex ?? 0];
    const bonus = effectBonus(state, 'produce_capacity')
      + (sel ? talentBonus(state, sel, 'producing', 'capacity', 'percent') : 0);
    return Math.floor(C.PRODUCE_BASE_CAPACITY * (1 + bonus));
  }

  function smeltSlotsUnlocked(state) {
    return C.SMELT_SLOT_UNLOCKS.filter((req) => state.smelting.skill.level >= req).length;
  }

  function findFirstSmeltSlotForOre(state, oreId) {
    const slotsOpen = smeltSlotsUnlocked(state);
    const cap = smeltBatchCapacity(state);
    for (let i = 0; i < slotsOpen; i++) {
      const slot = state.smelting.slots[i];
      const loaded = slot.oreLoaded || 0;
      if (loaded >= cap) continue;
      if (loaded > 0 && slot.ore !== oreId) continue;
      return i;
    }
    return -1;
  }

  function loadOreStackFromInv(state, char, invSlotIdx) {
    let total = 0;
    for (;;) {
      const invSlot = char.inventorySlots[invSlotIdx];
      if (!invSlot?.amount) break;
      const smeltIdx = findFirstSmeltSlotForOre(state, invSlot.resourceId);
      if (smeltIdx < 0) break;
      const n = S.loadOreToSmelt(state, char, invSlotIdx, smeltIdx, smeltBatchCapacity(state));
      if (n <= 0) break;
      total += n;
    }
    return total;
  }

  function produceSlotsUnlocked(char) {
    const lv = char?.producing?.skill?.level ?? 0;
    return C.UNLOCK_LEVELS.filter((req) => lv >= req).length;
  }

  function tickSmelting(state) {
    const slotsOpen = smeltSlotsUnlocked(state);
    const speedMult = 1 + effectBonus(state, 'smelt_speed')
      + talentBonus(state, null, 'smelting', 'speed', 'percent');
    const selChar = state.characters[state.selectedCharIndex ?? 0];
    const xpMult = 1 + effectBonus(state, 'smelt_xp')
      + talentBonus(state, null, 'smelting', 'xp', 'percent')
      + (selChar ? gearPercentBonus(selChar, 'xp_gain') : 0);
    const multiMult = effectBonus(state, 'smelt_multi') + baseMultiKillBonus(state)
      + talentBonus(state, null, 'smelting', 'multi', 'percent');

    for (let i = 0; i < slotsOpen; i++) {
      const slot = state.smelting.slots[i];
      if (!slot.ore || (slot.oreLoaded || 0) < 1) continue;
      const recipe = C.SMELT_RECIPES.find((r) => r.ore === slot.ore);
      if (!recipe) continue;
      if ((slot.oreLoaded || 0) < recipe.orePerBar) continue;

      const ticksNeeded = Math.max(1, Math.floor(recipe.ticks / speedMult));
      slot.progress += 1;
      if (slot.progress < ticksNeeded) continue;

      slot.oreLoaded -= recipe.orePerBar;
      let bars = 1;
      if (Math.random() < multiMult * 0.1) bars += 1;
      slot.ready = (slot.ready || 0) + bars;
      slot.readyBar = recipe.bar;
      S.grantXp(state.smelting.skill, Math.floor((recipe.xp ?? 5) * xpMult));
      slot.progress = 0;
    }
  }

  function tickProducing(state) {
    for (const char of state.characters) {
      const prod = char.producing;
      if (!prod || prod.activeSlot == null) continue;
      const def = C.PRODUCE_SLOTS[prod.activeSlot];
      if (!def || prod.skill.level < def.minLevel) continue;

      const speedMult = 1 + effectBonus(state, 'produce_speed')
        + talentBonus(state, char, 'producing', 'speed', 'percent');
      const multiMult = effectBonus(state, 'produce_multi') + baseMultiKillBonus(state)
        + talentBonus(state, char, 'producing', 'multi', 'percent');
      const cap = produceBatchCapacity(state, char);
      if ((prod.ready || 0) >= cap) continue;

      const ticksNeeded = Math.max(1, Math.floor(def.ticks / speedMult));
      prod.progress += 1;
      if (prod.progress < ticksNeeded) continue;

      let output = 1;
      if (Math.random() < multiMult * 0.1) output += 1;
      const space = cap - (prod.ready || 0);
      const made = Math.min(output, space);
      prod.ready = (prod.ready || 0) + made;
      prod.readyItem = def.id;
      recordProduceProgress(state, char, def.id, made);
      const xpMult = 1 + effectBonus(state, 'produce_xp')
        + talentBonus(state, char, 'producing', 'xp', 'percent')
        + gearPercentBonus(char, 'xp_gain');
      S.grantXp(prod.skill, Math.floor(def.xp * xpMult));
      prod.progress = 0;
    }
  }

  function recordProduceProgress(state, char, resourceId, amount) {
    if (!amount || !char) return;
    if (!char.questProgress) char.questProgress = S.defaultQuestProgress();
    char.questProgress.produced[resourceId] = (char.questProgress.produced[resourceId] || 0) + amount;
  }

  function recordQuestFromEvent(state, char, event) {
    if (!char) return;
    if (!char.questProgress) char.questProgress = S.defaultQuestProgress();
    const qp = char.questProgress;
    if (event.kill && event.monster) {
      qp.kills[event.monster] = (qp.kills[event.monster] || 0) + 1;
    }
    if (event.resource && event.resourceAmount > 0) {
      qp.gathered[event.resource] = (qp.gathered[event.resource] || 0) + event.resourceAmount;
    }
  }

  function questTrackProgress(char, track) {
    const qp = char?.questProgress || {};
    if (track.type === 'kill') return qp.kills?.[track.monster] || 0;
    if (track.type === 'gather') return qp.gathered?.[track.resource] || 0;
    if (track.type === 'produce') return qp.produced?.[track.resource] || 0;
    return 0;
  }

  function questIsComplete(char, quest) {
    return questTrackProgress(char, quest.track) >= quest.track.count;
  }

  function questIsClaimed(char, questId) {
    return !!char?.questClaims?.[questId];
  }

  function findQuest(questId) {
    for (const track of Object.values(C.QUEST_TRACKS || {})) {
      const q = track.quests.find((x) => x.id === questId);
      if (q) return { track, quest: q };
    }
    return null;
  }

  function claimQuest(state, questId, charIndex) {
    const found = findQuest(questId);
    const char = state.characters[charIndex];
    if (!found || !char || questIsClaimed(char, questId) || !questIsComplete(char, found.quest)) return false;
    for (const reward of found.quest.rewards) {
      if (reward.type === 'gold') state.gold += reward.amount;
      else if (reward.type === 'item') {
        const result = S.addToInventory(char, state, reward.id, reward.amount, 'combat');
        if (result.lost > 0) return false;
      }
    }
    if (!char.questClaims) char.questClaims = {};
    char.questClaims[questId] = true;
    S.saveState(state);
    return true;
  }

  function canUseConsumable(state, char, resourceId) {
    const def = C.CONSUMABLE_ITEMS?.[resourceId];
    if (!def || !char) return false;
    if (def.type === 'bag') return !char.bagsUsed.includes(def.tier);
    if (def.type === 'chest') return !state.storageChestsUsed.includes(def.tier);
    if (def.type === 'pouch') return false;
    return false;
  }

  function useConsumableFromSlot(state, char, slotIdx) {
    const slot = char.inventorySlots[slotIdx];
    if (!slot?.amount) return false;
    const def = C.CONSUMABLE_ITEMS?.[slot.resourceId];
    if (!def || !canUseConsumable(state, char, slot.resourceId)) return false;

    if (def.type === 'bag') {
      char.bagsUsed.push(def.tier);
      S.ensureInventorySize(char);
    } else if (def.type === 'chest') {
      if (!state.storageChestsUsed) state.storageChestsUsed = [];
      state.storageChestsUsed.push(def.tier);
      S.ensureStorageSize(state);
    } else if (def.type === 'pouch') {
      return false;
    }

    S.removeFromInventorySlot(char, slotIdx, 1);
    S.saveState(state);
    return true;
  }

  function shopItemAvailable(state, itemId) {
    const def = C.CONSUMABLE_ITEMS?.[itemId];
    if (def?.type === 'chest') return !state.storageChestsUsed?.includes(def.tier);
    return true;
  }

  function canEquipCapacityPouch(char, itemId, category) {
    const def = C.CONSUMABLE_ITEMS?.[itemId];
    return Boolean(def?.type === 'pouch' && def.category === category && char);
  }

  function equipCapacityPouch(state, char, invIdx, category) {
    const slot = char.inventorySlots[invIdx];
    if (!slot?.amount || !canEquipCapacityPouch(char, slot.resourceId, category)) return false;
    const itemId = slot.resourceId;
    if (!char.capacitySlots) char.capacitySlots = S.defaultCapacitySlots();
    const prev = char.capacitySlots[category];
    S.removeFromInventorySlot(char, invIdx, 1);
    if (prev) {
      const back = S.addToInventory(char, state, prev, 1, 'combat');
      if (back.added < 1) {
        S.addToInventory(char, state, itemId, 1, 'combat');
        return false;
      }
    }
    char.capacitySlots[category] = itemId;
    S.saveState(state);
    return true;
  }

  function unequipCapacityPouch(state, char, category, invIdx = null) {
    const itemId = char.capacitySlots?.[category];
    if (!itemId) return false;
    if (invIdx != null) {
      if (!S.placeInInventorySlot(state, char, invIdx, itemId, 1)) return false;
    } else {
      const back = S.addToInventory(char, state, itemId, 1, 'combat');
      if (back.added < 1) return false;
    }
    char.capacitySlots[category] = null;
    S.saveState(state);
    return true;
  }

  function unequipToInventorySlot(state, char, slotType, slotKey, invIdx) {
    const store = slotType === 'tool' ? char.tools : char.equipment;
    const itemId = store[slotKey];
    if (!itemId) return false;
    if (!S.placeInInventorySlot(state, char, invIdx, itemId, 1)) return false;
    store[slotKey] = null;
    S.saveState(state);
    return true;
  }

  function destroyInventoryItem(state, char, invIdx) {
    if (!S.deleteInventorySlot(char, invIdx)) return false;
    S.saveState(state);
    return true;
  }

  function destroyStorageItem(state, storIdx) {
    if (!S.deleteStorageSlot(state, storIdx)) return false;
    S.saveState(state);
    return true;
  }

  function destroyEquipped(state, char, slotType, slotKey) {
    const store = slotType === 'tool' ? char.tools : char.equipment;
    if (!store[slotKey]) return false;
    store[slotKey] = null;
    S.saveState(state);
    return true;
  }

  function destroyCapacityPouch(state, char, category) {
    if (!char.capacitySlots?.[category]) return false;
    char.capacitySlots[category] = null;
    S.saveState(state);
    return true;
  }

  function buyShopItem(state, char, itemId) {
    const shop = C.SHOP_ITEMS?.find((s) => s.id === itemId);
    if (!shop || !char || !shopItemAvailable(state, itemId)) return false;
    if (state.gold < shop.gold) return false;
    const result = S.addToInventory(char, state, itemId, 1, 'combat');
    if (result.added < 1) return false;
    state.gold -= shop.gold;
    S.saveState(state);
    return true;
  }

  function canCraft(state, char, recipeId) {
    const recipe = C.CRAFT_RECIPES?.find((r) => r.id === recipeId);
    if (!recipe || !char) return false;
    return recipe.costs.every((c) => S.charInventoryResourceHas(char, c.res, c.amt));
  }

  function craftItem(state, char, recipeId) {
    const recipe = C.CRAFT_RECIPES?.find((r) => r.id === recipeId);
    if (!recipe || !canCraft(state, char, recipeId)) return false;
    for (const cost of recipe.costs) S.removeFromCharInventory(char, cost.res, cost.amt);
    const result = S.addToInventory(char, state, recipe.output, 1, 'combat');
    if (result.added < 1) return false;
    S.saveState(state);
    return true;
  }

  function canCraftFromStorage(state, char, recipeId) {
    const recipe = C.CRAFT_RECIPES?.find((r) => r.id === recipeId);
    if (!recipe || !char) return false;
    return recipe.costs.every((c) => S.storageHas(state, c.res, c.amt));
  }

  function craftItemFromStorage(state, char, recipeId) {
    const recipe = C.CRAFT_RECIPES?.find((r) => r.id === recipeId);
    if (!recipe || !canCraftFromStorage(state, char, recipeId)) return false;
    for (const cost of recipe.costs) S.removeFromStorage(state, cost.res, cost.amt);
    const result = S.addToInventory(char, state, recipe.output, 1, 'combat');
    if (result.added < 1) return false;
    S.saveState(state);
    return true;
  }

  function resolveEquipTarget(char, def) {
    if (def.kind === 'tool') return { type: 'tool', key: def.slot };
    if (def.slot === 'ring') {
      if (!char.equipment.ring1) return { type: 'equipment', key: 'ring1' };
      if (!char.equipment.ring2) return { type: 'equipment', key: 'ring2' };
      return { type: 'equipment', key: 'ring1' };
    }
    return { type: 'equipment', key: def.slot };
  }

  function canEquipItem(char, itemId) {
    const def = C.EQUIP_ITEM_SLOTS?.[itemId];
    if (!def || !char) return false;
    return true;
  }

  function equipFromInventory(state, char, invIdx) {
    const slot = char.inventorySlots[invIdx];
    if (!slot?.amount) return false;
    const def = C.EQUIP_ITEM_SLOTS?.[slot.resourceId];
    if (!def || !canEquipItem(char, slot.resourceId)) return false;

    const target = resolveEquipTarget(char, def);
    const store = target.type === 'tool' ? char.tools : char.equipment;
    const prev = store[target.key];

    store[target.key] = slot.resourceId;
    S.removeFromInventorySlot(char, invIdx, 1);

    if (prev) {
      const back = S.addToInventory(char, state, prev, 1, 'combat');
      if (back.lost > 0) store[target.key] = prev;
    }

    S.saveState(state);
    return true;
  }

  function unequipSlot(state, char, slotType, slotKey) {
    if (!char) return false;
    const store = slotType === 'tool' ? char.tools : char.equipment;
    const itemId = store[slotKey];
    if (!itemId) return false;
    const result = S.addToInventory(char, state, itemId, 1, 'combat');
    if (result.added < 1) return false;
    store[slotKey] = null;
    S.saveState(state);
    return true;
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

      if (cs.respawnSec > 0) {
        cs.respawnSec = Math.max(0, cs.respawnSec - C.TICK_MS / 1000);
        if (cs.respawnSec <= 0) {
          cs.charHp = cs.charMaxHp;
          cs.mobHp = cs.mobMaxHp;
          cs.mobDead = false;
          event.charHp = cs.charHp;
          event.mobHp = cs.mobHp;
        }
        return event;
      }

      if (cs.mobDead) {
        cs.mobHp = cs.mobMaxHp;
        cs.mobDead = false;
        event.mobHp = cs.mobHp;
      }

      char.combatCd = (char.combatCd || 0) + C.TICK_MS / 1000;
      const attackSec = combatAttackSec(state, char);
      if (char.combatCd < attackSec) return event;
      char.combatCd = 0;

      const hitChance = combatHitChance(state, char, monster);
      const hit = Math.random() < hitChance;
      const defence = charDefence(state, char);
      const mobDmg = Math.max(1, monster.damage - defence);

      if (hit) {
        let charDmg = charDamage(state, char);
        const critChance = charEffectBonus(state, char, 'crit_chance', true)
          + talentBonus(state, char, 'combat', 'crit_chance', 'percent');
        const critDmg = charEffectBonus(state, char, 'crit_damage', true)
          + talentBonus(state, char, 'combat', 'crit_damage', 'percent');
        if (Math.random() < critChance) {
          charDmg = Math.floor(charDmg * (1 + critDmg));
          event.crit = true;
        }
        cs.mobHp -= charDmg;
        event.mobHp = cs.mobHp;
      } else {
        event.missed = true;
      }

      if (cs.mobHp <= 0) {
        const grantKillRewards = () => {
          const xpMult = 1 + skillXpBonus(state, 'combat', char);
          const xpGain = Math.floor((monster.xp ?? 5) * xpMult);
          S.grantXp(skill, xpGain);
          event.xpGain = (event.xpGain || 0) + xpGain;

          const goldMult = 1 + charEffectBonus(state, char, 'gold_gain', true)
            + talentBonus(state, char, 'combat', 'gold_gain', 'percent');
          const goldMin = monster.goldMin ?? 1;
          const goldMax = monster.goldMax ?? goldMin;
          const goldGain = Math.floor((goldMin + Math.random() * (goldMax - goldMin + 1)) * goldMult);
          if (goldGain > 0) {
            state.gold += goldGain;
            event.gold = (event.gold || 0) + goldGain;
          }

          const chance = dropChance(state, char);
          if (monster.drop && Math.random() < chance) {
            const dropAmt = monster.drop.amount;
            const result = S.addToInventory(char, state, monster.drop.id, dropAmt, 'combat');
            event.loot = monster.drop.id;
            event.lootAmount = (event.lootAmount || 0) + result.added;
            event.lost = (event.lost || 0) + result.lost;
          }
        };

        grantKillRewards();
        event.kill = true;
        event.monster = monster.id;
        if (Math.random() < baseMultiKillBonus(state)) {
          grantKillRewards();
          event.multikill = true;
        }

        cs.mobHp = 0;
        cs.mobDead = true;
        event.mobHp = 0;
        event.charHp = cs.charHp;
      } else {
        cs.charHp -= mobDmg;
        event.charHp = cs.charHp;
        if (cs.charHp <= 0) {
          cs.charHp = 0;
          cs.respawnSec = C.COMBAT_RESPAWN_SEC;
        }
      }
      return event;
    }

    const vein = findVein(skillId, char.target);
    if (!vein || skill.level < vein.minLevel) return event;

    char.gatherCd = (char.gatherCd || 0) + 1;
    const gatherTicks = gatherIntervalTicks(state, char, skillId);
    if (char.gatherCd < gatherTicks) return event;

    char.gatherCd = 0;

    const amount = rollGatherAmount(state, char, skillId, vein);
    if (amount > 0) {
      const xpMult = 1 + skillXpBonus(state, skillId, char);
      const xpGain = Math.floor((vein.xp ?? 5) * xpMult);
      S.grantXp(skill, xpGain);
      event.xpGain = xpGain;

      const result = S.addToInventory(char, state, vein.resource, amount, skillId);
      event.resource = vein.resource;
      event.resourceAmount = result.added;
      event.lost = result.lost;
    }
    return event;
  }

  function tick(state, opts = {}) {
    const save = opts.save !== false;
    state.lastTickAt = Date.now();
    S.refreshPendingSlot(state);
    tickSmelting(state);
    tickProducing(state);
    const events = [];
    for (const char of state.characters) {
      const ev = tickCharacter(state, char);
      if (ev) {
        recordQuestFromEvent(state, char, ev);
        S.recordRateEvent(state, ev);
        events.push({ char, ev });
      }
    }
    if (save) S.saveState(state, { touchCloud: false });
    return events;
  }

  function snapshotSmeltProduce(state) {
    return {
      smeltingXp: state.smelting.skill.xp,
      smeltingLevel: state.smelting.skill.level,
      smeltReady: state.smelting.slots.map((s) => ({ bar: s.readyBar, ready: s.ready || 0 })),
      chars: state.characters.map((c) => ({
        prodXp: c.producing?.skill?.xp ?? 0,
        prodLevel: c.producing?.skill?.level ?? 0,
        prodReady: c.producing?.ready ?? 0,
        prodItem: c.producing?.readyItem,
      })),
    };
  }

  function diffSmeltProduce(before, after) {
    const smelt = { bars: {}, levelUp: null };
    if (after.smeltingLevel > before.smeltingLevel) {
      smelt.levelUp = after.smeltingLevel;
    }
    for (let i = 0; i < after.smeltReady.length; i++) {
      const b = before.smeltReady[i];
      const a = after.smeltReady[i];
      if (a.bar && a.ready > (b?.ready || 0)) {
        const delta = a.ready - (b?.ready || 0);
        smelt.bars[a.bar] = (smelt.bars[a.bar] || 0) + delta;
      }
    }
    const produce = after.chars.map((a, i) => {
      const b = before.chars[i];
      const out = { ready: 0, item: a.prodItem, levelUp: null };
      if (a.prodLevel > b.prodLevel) out.levelUp = a.prodLevel;
      if (a.prodReady > b.prodReady && a.prodItem) {
        out.ready = a.prodReady - b.prodReady;
        out.item = a.prodItem;
      }
      return out;
    });
    return { smelt, produce };
  }

  function initOfflineCharSummary(char) {
    const cls = C.CLASSES[char.classId];
    return {
      classId: char.classId,
      name: cls?.name ?? 'Hero',
      icon: cls?.icon ?? '👤',
      activity: char.activity,
      target: char.target,
      xpBySkill: {},
      resources: {},
      gold: 0,
      kills: 0,
      loot: {},
      lost: 0,
    };
  }

  function accumulateOfflineEvent(summary, charIndex, char, ev) {
    if (!summary.characters[charIndex]) summary.characters[charIndex] = initOfflineCharSummary(char);
    const s = summary.characters[charIndex];
    if (ev.xpGain && ev.skill) {
      s.xpBySkill[ev.skill] = (s.xpBySkill[ev.skill] || 0) + ev.xpGain;
    }
    if (ev.gold) s.gold += ev.gold;
    if (ev.resource && ev.resourceAmount) {
      s.resources[ev.resource] = (s.resources[ev.resource] || 0) + ev.resourceAmount;
    }
    if (ev.kill) s.kills += 1;
    if (ev.loot && ev.lootAmount) {
      s.loot[ev.loot] = (s.loot[ev.loot] || 0) + ev.lootAmount;
    }
    if (ev.lost) s.lost += ev.lost;
  }

  function catchUpOffline(state) {
    const now = Date.now();
    const last = state.lastTickAt || now;
    const elapsed = now - last;
    if (elapsed < C.TICK_MS * 2) return null;

    const wallMs = Math.min(elapsed, C.OFFLINE_MAX_MS ?? 86400000);
    const tickCount = Math.floor((wallMs * (C.OFFLINE_SPEED_MULT ?? 0.5)) / C.TICK_MS);
    if (tickCount < 1) return null;

    const before = snapshotSmeltProduce(state);
    const summary = { characters: [], wallSeconds: Math.floor(wallMs / 1000), tickCount };

    for (let i = 0; i < tickCount; i++) {
      S.refreshPendingSlot(state);
      tickSmelting(state);
      tickProducing(state);
      for (let ci = 0; ci < state.characters.length; ci++) {
        const char = state.characters[ci];
        const ev = tickCharacter(state, char);
        if (ev) {
          recordQuestFromEvent(state, char, ev);
          accumulateOfflineEvent(summary, ci, char, ev);
        }
      }
    }

    state.lastTickAt = now;
    const after = snapshotSmeltProduce(state);
    summary.smeltProduce = diffSmeltProduce(before, after);
    S.saveState(state);
    return summary;
  }

  function unlockUpgradeTier(state, nodeId) {
    if (!upgradeNeedsUnlock(state, nodeId)) return false;
    const tierIdx = upgradeUnlockIndex(state, nodeId);
    const costs = upgradeUnlockCosts(nodeId, tierIdx);
    if (!costs) return false;
    const char = S.findCharForResource(state, costs.resource, costs.resourceAmt, state.selectedCharIndex);
    if (!char) return false;
    S.removeFromCharInventory(char, costs.resource, costs.resourceAmt);
    if (!state.upgradeTiers) state.upgradeTiers = {};
    state.upgradeTiers[nodeId] = tierIdx + 1;
    S.saveState(state);
    return true;
  }

  function buyUpgrade(state, nodeId) {
    if (upgradeNeedsUnlock(state, nodeId)) {
      return unlockUpgradeTier(state, nodeId);
    }
    if (!canLevelUpgrade(state, nodeId)) return false;
    const goldCost = upgradeLevelGoldCost(state, nodeId);
    state.gold -= goldCost;
    const current = upgradeLevel(state, nodeId);
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
    slot.oreLoaded = 0;
    slot.progress = 0;
    slot.ready = 0;
    slot.readyBar = null;
    S.saveState(state);
    return true;
  }

  function setProduceSlot(state, charIndex, slotIndex) {
    const char = state.characters[charIndex];
    if (!char?.producing) return false;
    const prod = char.producing;
    const def = C.PRODUCE_SLOTS[slotIndex];
    if (!def || prod.skill.level < def.minLevel) return false;
    if (slotIndex >= produceSlotsUnlocked(char)) return false;

    if (prod.activeSlot === slotIndex) {
      prod.activeSlot = null;
      prod.progress = 0;
    } else {
      prod.activeSlot = slotIndex;
      prod.progress = 0;
    }
    S.saveState(state);
    return true;
  }

  function clearSmeltSlot(state, slotIndex) {
    const slot = state.smelting.slots[slotIndex];
    if (!slot) return;
    slot.ore = null;
    slot.oreLoaded = 0;
    slot.progress = 0;
    slot.ready = 0;
    slot.readyBar = null;
    S.saveState(state);
  }

  function clearProduceSlot(state, charIndex) {
    const char = state.characters[charIndex];
    if (!char) return;
    S.stopCharacterProducing(char);
    S.saveState(state);
  }

  function collectProduce(state, charIndex) {
    const char = state.characters[charIndex];
    const prod = char?.producing;
    if (!prod?.ready || !prod.readyItem) return { collected: 0, lost: 0 };

    const result = S.addToInventory(char, state, prod.readyItem, prod.ready, 'producing');
    const collected = result.added;
    prod.ready -= collected;
    if (prod.ready <= 0) {
      prod.ready = 0;
      prod.readyItem = null;
    }
    S.saveState(state);
    return { collected, lost: result.lost };
  }

  function collectSmelt(state, slotIndex, charIndex) {
    const slot = state.smelting.slots[slotIndex];
    const char = state.characters[charIndex];
    if (!slot?.ready || !slot.readyBar || !char) return { collected: 0, lost: 0 };
    const result = S.addToInventory(char, state, slot.readyBar, slot.ready, 'mining');
    const collected = result.added;
    slot.ready -= collected;
    if (slot.ready <= 0) {
      slot.ready = 0;
      slot.readyBar = null;
    }
    S.saveState(state);
    return { collected, lost: result.lost };
  }

  function unloadSmeltOre(state, slotIndex, charIndex) {
    const char = state.characters[charIndex];
    const slot = state.smelting.slots[slotIndex];
    if (!char || !slot?.ore || !(slot.oreLoaded > 0)) return 0;
    const result = S.addToInventory(char, state, slot.ore, slot.oreLoaded, 'mining');
    const returned = result.added;
    slot.oreLoaded -= returned;
    if (slot.oreLoaded <= 0) {
      slot.oreLoaded = 0;
      slot.ore = null;
      slot.progress = 0;
      slot.readyBar = null;
    }
    S.saveState(state);
    return returned;
  }

  window.WorldrootEngine = {
    upgradeLevel, upgradeTierCount, upgradeMaxLevel, upgradeNeedsUnlock, upgradeUnlockCosts,
    upgradeLevelGoldCost, upgradeUnlockTargetMax, canUnlockUpgrade, canLevelUpgrade, unlockUpgradeTier,
    upgradeCosts, upgradeBonusDisplay, upgradeBonusPercent, effectBonus,
    skillXpBonus, skillYieldBonus, skillMultiBonus,
    gatherEfficiency, gatherStatBonus, gatherSuccessChance, gatherSuccessPercent, gatherMultiChance,
    gatherYieldTierInfo, gatherCatchDisplayPercent, gatherPlusOneThresholds, effForSuccessPercent,
    veinEffThreshold, veinEffBreakpoints,
    gatherRatePerMin, gatherIntervalTicks, gatherSpeedBonus,
    charMaxHp, charMaxMp, charDamage, charDefence, charAccuracy, combatHitChance, combatAttackSec,
    gearFlatBonus, gearPercentBonus, charEffectBonus,
    mobMaxHp, dropChance, dropBonus,
    getTheoreticalCombatRates, combatXpPerKill, gatherXpPerAction, smeltBatchCapacity, produceBatchCapacity,
    charStat, gatherStatMult, combatDamageMult,
    tick, buyUpgrade, canAffordUpgrade, findVein, findMonster,
    getRatePerHour, findUpgradeNode, smeltSlotsUnlocked, findFirstSmeltSlotForOre,
    loadOreStackFromInv, produceSlotsUnlocked,
    setSmeltSlot, setProduceSlot, clearSmeltSlot, clearProduceSlot,
    collectProduce, collectSmelt, unloadSmeltOre,
    questTrackProgress, questIsComplete, questIsClaimed, claimQuest,
    canUseConsumable, useConsumableFromSlot, shopItemAvailable, buyShopItem,
    canCraft, craftItem, canCraftFromStorage, craftItemFromStorage,
    canEquipItem, equipFromInventory, unequipSlot, unequipToInventorySlot,
    canEquipCapacityPouch, equipCapacityPouch, unequipCapacityPouch,
    destroyInventoryItem, destroyStorageItem, destroyEquipped, destroyCapacityPouch,
    catchUpOffline,
    talentTreeKey, skillForTalents, talentLevel, talentBonus, talentPointsAvailable,
    buyTalent, formatTalentTotal, talentDef,
  };
})();
