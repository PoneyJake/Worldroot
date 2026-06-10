/** Worldroot — craftable armor, weapons, tools, rings, amulets. */

(function () {
  const C = window.WorldrootConfig;
  if (!C) return;

  const GEAR_DEFS = [
    // Copper armor
    { id: 'copper_helmet', name: 'Copper Helmet', category: 'armor', equip: { kind: 'equipment', slot: 'helmet' },
      costs: [{ res: 'copper', amt: 10 }, { res: 'slime_gel', amt: 10 }] },
    { id: 'copper_chest', name: 'Copper Chest', category: 'armor', equip: { kind: 'equipment', slot: 'chest' },
      costs: [{ res: 'copper_bar', amt: 20 }, { res: 'twine', amt: 100 }] },
    { id: 'copper_legs', name: 'Copper Legs', category: 'armor', equip: { kind: 'equipment', slot: 'legs' },
      costs: [{ res: 'copper_bar', amt: 10 }, { res: 'oak', amt: 50 }] },
    { id: 'copper_boots', name: 'Copper Boots', category: 'armor', equip: { kind: 'equipment', slot: 'boots' },
      costs: [{ res: 'copper', amt: 10 }] },
    // Copper weapons
    { id: 'copper_sword', name: 'Copper Sword', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'warrior' },
      costs: [{ res: 'copper_bar', amt: 20 }, { res: 'slime_gel', amt: 25 }] },
    { id: 'copper_bow', name: 'Copper Bow', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'archer' },
      costs: [{ res: 'oak', amt: 40 }, { res: 'slime_gel', amt: 25 }] },
    { id: 'copper_staff', name: 'Copper Staff', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'sorcerer' },
      costs: [{ res: 'shrimp', amt: 40 }, { res: 'slime_gel', amt: 25 }] },
    // Copper tools
    { id: 'copper_pickaxe', name: 'Copper Pickaxe', category: 'tool', equip: { kind: 'tool', slot: 'pickaxe' },
      costs: [{ res: 'copper', amt: 5 }] },
    { id: 'copper_axe', name: 'Copper Axe', category: 'tool', equip: { kind: 'tool', slot: 'axe' },
      costs: [{ res: 'oak', amt: 5 }] },
    { id: 'copper_rod', name: 'Copper Rod', category: 'tool', equip: { kind: 'tool', slot: 'rod' },
      costs: [{ res: 'shrimp', amt: 5 }] },

    // Iron armor
    { id: 'iron_helmet', name: 'Iron Helmet', category: 'armor', equip: { kind: 'equipment', slot: 'helmet' },
      costs: [{ res: 'copper_helmet', amt: 1 }, { res: 'iron_bar', amt: 20 }, { res: 'wisp_essence', amt: 50 }] },
    { id: 'iron_chest', name: 'Iron Chest', category: 'armor', equip: { kind: 'equipment', slot: 'chest' },
      costs: [{ res: 'copper_chest', amt: 1 }, { res: 'iron_bar', amt: 25 }, { res: 'spruce', amt: 75 }] },
    { id: 'iron_legs', name: 'Iron Legs', category: 'armor', equip: { kind: 'equipment', slot: 'legs' },
      costs: [{ res: 'copper_legs', amt: 1 }, { res: 'iron_bar', amt: 20 }, { res: 'wooden_pegs', amt: 50 }] },
    { id: 'iron_boots', name: 'Iron Boots', category: 'armor', equip: { kind: 'equipment', slot: 'boots' },
      costs: [{ res: 'copper_boots', amt: 1 }, { res: 'iron_bar', amt: 50 }] },
    // Iron weapons
    { id: 'iron_sword', name: 'Iron Sword', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'warrior' },
      costs: [{ res: 'copper_sword', amt: 1 }, { res: 'iron_bar', amt: 125 }] },
    { id: 'iron_bow', name: 'Iron Bow', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'archer' },
      costs: [{ res: 'copper_bow', amt: 1 }, { res: 'birch', amt: 500 }] },
    { id: 'iron_staff', name: 'Iron Staff', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'sorcerer' },
      costs: [{ res: 'copper_staff', amt: 1 }, { res: 'trout', amt: 500 }] },
    // Iron tools
    { id: 'iron_pickaxe', name: 'Iron Pickaxe', category: 'tool', equip: { kind: 'tool', slot: 'pickaxe' },
      costs: [{ res: 'copper_pickaxe', amt: 1 }, { res: 'iron', amt: 100 }] },
    { id: 'iron_axe', name: 'Iron Axe', category: 'tool', equip: { kind: 'tool', slot: 'axe' },
      costs: [{ res: 'copper_axe', amt: 1 }, { res: 'spruce', amt: 200 }] },
    { id: 'iron_rod', name: 'Iron Rod', category: 'tool', equip: { kind: 'tool', slot: 'rod' },
      costs: [{ res: 'copper_rod', amt: 1 }, { res: 'trout', amt: 200 }] },

    // Gold armor
    { id: 'gold_helmet', name: 'Gold Helmet', category: 'armor', equip: { kind: 'equipment', slot: 'helmet' },
      costs: [{ res: 'iron_helmet', amt: 1 }, { res: 'gold_bar', amt: 200 }, { res: 'gloomspore', amt: 1000 }] },
    { id: 'gold_chest', name: 'Gold Chest', category: 'armor', equip: { kind: 'equipment', slot: 'chest' },
      costs: [{ res: 'iron_chest', amt: 1 }, { res: 'bat_wing_membrane', amt: 750 }, { res: 'gold_bar', amt: 250 }] },
    { id: 'gold_legs', name: 'Gold Legs', category: 'armor', equip: { kind: 'equipment', slot: 'legs' },
      costs: [{ res: 'iron_legs', amt: 1 }, { res: 'salmon', amt: 500 }, { res: 'gold_bar', amt: 250 }] },
    { id: 'gold_boots', name: 'Gold Boots', category: 'armor', equip: { kind: 'equipment', slot: 'boots' },
      costs: [{ res: 'iron_boots', amt: 1 }, { res: 'gold_bar', amt: 500 }] },
    // Gold weapons
    { id: 'gold_sword', name: 'Gold Sword', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'warrior' },
      costs: [{ res: 'iron_sword', amt: 1 }, { res: 'gold_bar', amt: 250 }] },
    { id: 'gold_bow', name: 'Gold Bow', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'archer' },
      costs: [{ res: 'iron_bow', amt: 1 }, { res: 'birch', amt: 1500 }] },
    { id: 'gold_staff', name: 'Gold Staff', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'sorcerer' },
      costs: [{ res: 'iron_staff', amt: 1 }, { res: 'salmon', amt: 1500 }] },
    // Gold tools
    { id: 'gold_pickaxe', name: 'Gold Pickaxe', category: 'tool', equip: { kind: 'tool', slot: 'pickaxe' },
      costs: [{ res: 'iron_pickaxe', amt: 1 }, { res: 'gold_bar', amt: 250 }, { res: 'gloomspore', amt: 1000 }] },
    { id: 'gold_axe', name: 'Gold Axe', category: 'tool', equip: { kind: 'tool', slot: 'axe' },
      costs: [{ res: 'iron_axe', amt: 1 }, { res: 'birch', amt: 1000 }, { res: 'iron_nails', amt: 500 }] },
    { id: 'gold_rod', name: 'Gold Rod', category: 'tool', equip: { kind: 'tool', slot: 'rod' },
      costs: [{ res: 'iron_rod', amt: 1 }, { res: 'salmon', amt: 1000 }, { res: 'gloomspore', amt: 500 }, { res: 'iron_nails', amt: 250 }] },

    // Platinum armor
    { id: 'platinum_helmet', name: 'Platinum Helmet', category: 'armor', equip: { kind: 'equipment', slot: 'helmet' },
      costs: [{ res: 'gold_helmet', amt: 1 }, { res: 'platinum_bar', amt: 750 }, { res: 'leech_sucker', amt: 2500 }] },
    { id: 'platinum_chest', name: 'Platinum Chest', category: 'armor', equip: { kind: 'equipment', slot: 'chest' },
      costs: [{ res: 'gold_chest', amt: 1 }, { res: 'platinum_bar', amt: 1000 }, { res: 'moth_pollen', amt: 2000 }] },
    { id: 'platinum_legs', name: 'Platinum Legs', category: 'armor', equip: { kind: 'equipment', slot: 'legs' },
      costs: [{ res: 'gold_legs', amt: 1 }, { res: 'lobster', amt: 2500 }, { res: 'platinum_bar', amt: 1000 }] },
    { id: 'platinum_boots', name: 'Platinum Boots', category: 'armor', equip: { kind: 'equipment', slot: 'boots' },
      costs: [{ res: 'gold_boots', amt: 1 }, { res: 'platinum_bar', amt: 1000 }, { res: 'jungle', amt: 5000 }] },
    // Platinum weapons
    { id: 'platinum_sword', name: 'Platinum Sword', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'warrior' },
      costs: [{ res: 'gold_sword', amt: 1 }, { res: 'platinum_bar', amt: 750 }] },
    { id: 'platinum_bow', name: 'Platinum Bow', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'archer' },
      costs: [{ res: 'gold_bow', amt: 1 }, { res: 'jungle', amt: 7500 }] },
    { id: 'platinum_staff', name: 'Platinum Staff', category: 'weapon', equip: { kind: 'equipment', slot: 'weapon', classId: 'sorcerer' },
      costs: [{ res: 'gold_staff', amt: 1 }, { res: 'lobster', amt: 7500 }] },
    // Platinum tools
    { id: 'platinum_pickaxe', name: 'Platinum Pickaxe', category: 'tool', equip: { kind: 'tool', slot: 'pickaxe' },
      costs: [{ res: 'gold_pickaxe', amt: 1 }, { res: 'platinum_bar', amt: 750 }, { res: 'leech_sucker', amt: 2500 }] },
    { id: 'platinum_axe', name: 'Platinum Axe', category: 'tool', equip: { kind: 'tool', slot: 'axe' },
      costs: [{ res: 'gold_axe', amt: 1 }, { res: 'jungle', amt: 7500 }, { res: 'resin', amt: 2500 }] },
    { id: 'platinum_rod', name: 'Platinum Rod', category: 'tool', equip: { kind: 'tool', slot: 'rod' },
      costs: [{ res: 'gold_rod', amt: 1 }, { res: 'lobster', amt: 7500 }, { res: 'leech_sucker', amt: 1250 }, { res: 'resin', amt: 1250 }] },

    // Rings
    { id: 'ring_of_strength', name: 'Ring of Strength', category: 'ring', equip: { kind: 'equipment', slot: 'ring' },
      costs: [{ res: 'iron_bar', amt: 50 }, { res: 'wisp_essence', amt: 200 }] },
    { id: 'ring_of_agility', name: 'Ring of Agility', category: 'ring', equip: { kind: 'equipment', slot: 'ring' },
      costs: [{ res: 'spruce', amt: 200 }, { res: 'wisp_essence', amt: 200 }] },
    { id: 'ring_of_magic', name: 'Ring of Magic', category: 'ring', equip: { kind: 'equipment', slot: 'ring' },
      costs: [{ res: 'trout', amt: 200 }, { res: 'wisp_essence', amt: 200 }] },
    { id: 'ring_of_carrying', name: 'Ring of Carrying', category: 'ring', equip: { kind: 'equipment', slot: 'ring' },
      costs: [{ res: 'iron_bar', amt: 25 }, { res: 'spruce', amt: 50 }, { res: 'trout', amt: 50 }, { res: 'wooden_pegs', amt: 50 }] },
    { id: 'ring_of_wealth', name: 'Ring of Wealth', category: 'ring', equip: { kind: 'equipment', slot: 'ring' },
      costs: [{ res: 'copper_bar', amt: 500 }, { res: 'iron_bar', amt: 250 }, { res: 'gold_bar', amt: 100 }] },
    { id: 'ring_of_fortune', name: 'Ring of Fortune', category: 'ring', equip: { kind: 'equipment', slot: 'ring' },
      costs: [{ res: 'platinum_bar', amt: 1000 }, { res: 'jungle', amt: 10000 }, { res: 'lobster', amt: 10000 }] },

    // Amulets
    { id: 'amulet_of_mining', name: 'Amulet of Mining', category: 'amulet', equip: { kind: 'equipment', slot: 'amulet' },
      costs: [{ res: 'copper_bar', amt: 200 }, { res: 'twine', amt: 200 }] },
    { id: 'amulet_of_woodcutting', name: 'Amulet of Woodcutting', category: 'amulet', equip: { kind: 'equipment', slot: 'amulet' },
      costs: [{ res: 'oak', amt: 500 }, { res: 'twine', amt: 200 }] },
    { id: 'amulet_of_fishing', name: 'Amulet of Fishing', category: 'amulet', equip: { kind: 'equipment', slot: 'amulet' },
      costs: [{ res: 'shrimp', amt: 500 }, { res: 'twine', amt: 200 }] },
    { id: 'amulet_of_experience', name: 'Amulet of Experience', category: 'amulet', equip: { kind: 'equipment', slot: 'amulet' },
      costs: [{ res: 'iron_bar', amt: 250 }, { res: 'wooden_pegs', amt: 500 }] },
  ];

  const ARMOR_COPPER = {
    helmet: { strength: 2, agility: 2, magic: 2, defence: 1 },
    chest: { strength: 3, agility: 3, magic: 3, defence: 1 },
    legs: { strength: 3, agility: 3, magic: 3, defence: 1 },
    boots: { strength: 1, agility: 1, magic: 1, defence: 1 },
  };
  const METAL_ARMOR_ADD = { copper: 0, iron: 1, gold: 3, platinum: 5 };

  const TOOL_COPPER = {
    pickaxe: { stat: 'strength', amount: 5, speed: 'mining_speed', speedPct: 0.05 },
    axe: { stat: 'agility', amount: 5, speed: 'woodcutting_speed', speedPct: 0.05 },
    rod: { stat: 'magic', amount: 5, speed: 'fishing_speed', speedPct: 0.05 },
  };
  const METAL_TOOL_ADD = {
    copper: { stat: 0, speed: 0 },
    iron: { stat: 5, speed: 0.05 },
    gold: { stat: 10, speed: 0.10 },
    platinum: { stat: 15, speed: 0.15 },
  };

  const WEAPON_COPPER = {
    sword: { stat: 'strength', amount: 5, speedPct: 0.05 },
    bow: { stat: 'agility', amount: 5, speedPct: 0.05 },
    staff: { stat: 'magic', amount: 5, speedPct: 0.05 },
  };
  const METAL_WEAPON_ADD = {
    copper: { stat: 0, speed: 0 },
    iron: { stat: 10, speed: 0.05 },
    gold: { stat: 20, speed: 0.10 },
    platinum: { stat: 30, speed: 0.15 },
  };

  function buildArmorStats(metal, piece) {
    const base = ARMOR_COPPER[piece];
    const add = METAL_ARMOR_ADD[metal];
    const flat = {};
    for (const [key, val] of Object.entries(base)) flat[key] = val + add;
    return { flat };
  }

  function buildToolStats(metal, tool) {
    const base = TOOL_COPPER[tool];
    const add = METAL_TOOL_ADD[metal];
    return {
      flat: { [base.stat]: base.amount + add.stat },
      percent: { [base.speed]: base.speedPct + add.speed },
    };
  }

  function buildWeaponStats(metal, weapon) {
    const base = WEAPON_COPPER[weapon];
    const add = METAL_WEAPON_ADD[metal];
    return {
      flat: { [base.stat]: base.amount + add.stat },
      percent: { attack_speed: base.speedPct + add.speed },
    };
  }

  const GEAR_STATS = {
    ring_of_strength: { percent: { strength_pct: 0.10 } },
    ring_of_agility: { percent: { agility_pct: 0.10 } },
    ring_of_magic: { percent: { magic_pct: 0.10 } },
    ring_of_carrying: { percent: { carry_capacity: 0.10 } },
    ring_of_wealth: { percent: { gold_gain: 0.10 } },
    ring_of_fortune: { percent: { drop_rate: 0.05 } },
    amulet_of_mining: { flat: { mining_yield: 10 }, percent: { mining_speed: 0.10 } },
    amulet_of_woodcutting: { flat: { woodcutting_yield: 10 }, percent: { woodcutting_speed: 0.10 } },
    amulet_of_fishing: { flat: { fishing_yield: 10 }, percent: { fishing_speed: 0.10 } },
    amulet_of_experience: { percent: { xp_gain: 0.10 } },
  };

  for (const metal of ['copper', 'iron', 'gold', 'platinum']) {
    for (const piece of ['helmet', 'chest', 'legs', 'boots']) {
      GEAR_STATS[`${metal}_${piece}`] = buildArmorStats(metal, piece);
    }
    for (const tool of ['pickaxe', 'axe', 'rod']) {
      GEAR_STATS[`${metal}_${tool}`] = buildToolStats(metal, tool);
    }
    for (const weapon of ['sword', 'bow', 'staff']) {
      GEAR_STATS[`${metal}_${weapon}`] = buildWeaponStats(metal, weapon);
    }
  }

  const EQUIP_ITEM_SLOTS = {};
  const GEAR_ITEM_IDS = new Set();
  const GEAR_NAMES = {};
  const gearRecipes = [];

  for (const def of GEAR_DEFS) {
    GEAR_NAMES[def.id] = def.name;
    GEAR_ITEM_IDS.add(def.id);
    C.GAME_ICONS[def.id] = def.id;
    if (def.equip) EQUIP_ITEM_SLOTS[def.id] = def.equip;
    gearRecipes.push({
      id: def.id,
      output: def.id,
      category: def.category,
      costs: def.costs,
    });
  }

  C.EQUIP_ITEM_SLOTS = EQUIP_ITEM_SLOTS;
  C.GEAR_ITEM_IDS = GEAR_ITEM_IDS;
  C.GEAR_STATS = GEAR_STATS;
  C.CRAFT_CATEGORIES = [
    { id: 'armor', label: 'Armor', icon: '🛡' },
    { id: 'weapon', label: 'Weapons', icon: '⚔' },
    { id: 'tool', label: 'Tools', icon: '🔧' },
    { id: 'ring', label: 'Rings', icon: '💍' },
    { id: 'amulet', label: 'Amulets', icon: '📿' },
    { id: 'pouch', label: 'Pouches', icon: '👝' },
  ];

  const pouchRecipes = (C.CRAFT_RECIPES || []).map((r) => ({ ...r, category: 'pouch' }));
  C.CRAFT_RECIPES = [...gearRecipes, ...pouchRecipes];

  C.RESOURCE_IDS.push(...GEAR_ITEM_IDS);
  Object.assign(C.RESOURCE_NAMES, GEAR_NAMES);

  C.SKILLS.crafting.desc = 'Craft armor, weapons, tools, rings, amulets, and pouches';
})();
