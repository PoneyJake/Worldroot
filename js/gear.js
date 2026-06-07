/** Worldroot — craftable armor, weapons, tools, rings, amulets. */

(function () {
  const C = window.WorldrootConfig;
  if (!C) return;

  const METALS = [
    { id: 'copper', bar: 'copper_bar', log: 'oak', logAmt: [5, 10, 8, 5] },
    { id: 'iron', bar: 'iron_bar', log: 'spruce', logAmt: [10, 20, 14, 10] },
    { id: 'gold', bar: 'gold_bar', log: 'birch', logAmt: [15, 30, 22, 15] },
    { id: 'platinum', bar: 'platinum_bar', log: 'jungle', logAmt: [20, 40, 28, 20] },
  ];
  const ARMOR = [
    { piece: 'helmet', label: 'Helmet', bars: [2, 5, 10, 20] },
    { piece: 'chest', label: 'Chest', bars: [4, 10, 20, 40] },
    { piece: 'legs', label: 'Legs', bars: [3, 7, 14, 28] },
    { piece: 'boots', label: 'Boots', bars: [2, 5, 10, 20] },
  ];
  const WEAPONS = [
    { id: 'sword', label: 'Sword', classId: 'warrior', bars: [3, 8, 15, 30] },
    { id: 'bow', label: 'Bow', classId: 'archer', bars: [3, 8, 15, 30] },
    { id: 'staff', label: 'Staff', classId: 'sorcerer', bars: [3, 8, 15, 30] },
  ];
  const TOOLS = [
    { id: 'pickaxe', label: 'Pickaxe', bars: [2, 6, 12, 24] },
    { id: 'axe', label: 'Axe', bars: [2, 6, 12, 24] },
    { id: 'rod', label: 'Rod', bars: [2, 6, 12, 24] },
  ];

  const RINGS = [
    { id: 'ring_of_strength', costs: [{ res: 'copper_bar', amt: 5 }, { res: 'slime_gel', amt: 10 }] },
    { id: 'ring_of_agility', costs: [{ res: 'copper_bar', amt: 5 }, { res: 'wisp_essence', amt: 10 }] },
    { id: 'ring_of_magic', costs: [{ res: 'copper_bar', amt: 5 }, { res: 'gloomspore', amt: 10 }] },
    { id: 'ring_of_fortune', costs: [{ res: 'iron_bar', amt: 8 }, { res: 'bat_wing_membrane', amt: 15 }] },
    { id: 'ring_of_wealth', costs: [{ res: 'iron_bar', amt: 8 }, { res: 'gold_bar', amt: 10 }] },
    { id: 'ring_of_carrying', costs: [{ res: 'iron_bar', amt: 10 }, { res: 'twine', amt: 20 }] },
  ];

  const AMULETS = [
    { id: 'amulet_of_mining', costs: [{ res: 'copper_bar', amt: 5 }, { res: 'copper', amt: 20 }] },
    { id: 'amulet_of_woodcutting', costs: [{ res: 'copper_bar', amt: 5 }, { res: 'oak', amt: 20 }] },
    { id: 'amulet_of_fishing', costs: [{ res: 'copper_bar', amt: 5 }, { res: 'shrimp', amt: 20 }] },
    { id: 'amulet_of_experience', costs: [{ res: 'gold_bar', amt: 10 }, { res: 'wisp_essence', amt: 5 }, { res: 'resin', amt: 5 }] },
  ];

  const GEAR_NAMES = {
    ring_of_strength: 'Ring of Strength', ring_of_agility: 'Ring of Agility',
    ring_of_magic: 'Ring of Magic', ring_of_fortune: 'Ring of Fortune',
    ring_of_wealth: 'Ring of Wealth', ring_of_carrying: 'Ring of Carrying',
    amulet_of_mining: 'Amulet of Mining', amulet_of_woodcutting: 'Amulet of Woodcutting',
    amulet_of_fishing: 'Amulet of Fishing', amulet_of_experience: 'Amulet of Experience',
  };

  const EQUIP_ITEM_SLOTS = {};
  const GEAR_ITEM_IDS = new Set();
  const gearRecipes = [];

  function titleCase(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function addGear(id, name, icon, equipDef, recipe) {
    GEAR_NAMES[id] = name;
    GEAR_ITEM_IDS.add(id);
    C.GAME_ICONS[id] = icon;
    if (equipDef) EQUIP_ITEM_SLOTS[id] = equipDef;
    if (recipe) gearRecipes.push({ ...recipe, id, output: id });
  }

  for (const metal of METALS) {
    const mi = METALS.indexOf(metal);
    for (const a of ARMOR) {
      const id = `${metal.id}_${a.piece}`;
      const name = `${titleCase(metal.id)} ${a.label}`;
      addGear(id, name, id, { kind: 'equipment', slot: a.piece }, {
        category: 'armor',
        costs: [
          { res: metal.bar, amt: a.bars[mi] },
          { res: metal.log, amt: metal.logAmt[ARMOR.indexOf(a)] },
          { res: 'twine', amt: 2 + mi * 2 },
        ],
      });
    }
    for (const w of WEAPONS) {
      const id = `${metal.id}_${w.id}`;
      const name = `${titleCase(metal.id)} ${w.label}`;
      addGear(id, name, id, { kind: 'equipment', slot: 'weapon', classId: w.classId }, {
        category: 'weapon',
        costs: [
          { res: metal.bar, amt: w.bars[mi] },
          { res: metal.log, amt: 5 + mi * 5 },
          { res: 'wooden_pegs', amt: 3 + mi * 3 },
        ],
      });
    }
    for (const t of TOOLS) {
      const id = `${metal.id}_${t.id}`;
      const name = `${titleCase(metal.id)} ${t.label}`;
      addGear(id, name, id, { kind: 'tool', slot: t.id }, {
        category: 'tool',
        costs: [
          { res: metal.bar, amt: t.bars[mi] },
          { res: metal.log, amt: 3 + mi * 4 },
        ],
      });
    }
  }

  for (const r of RINGS) {
    addGear(r.id, GEAR_NAMES[r.id] || r.id, r.id, { kind: 'equipment', slot: 'ring' }, {
      category: 'ring', costs: r.costs,
    });
  }
  for (const a of AMULETS) {
    addGear(a.id, GEAR_NAMES[a.id] || a.id, a.id, { kind: 'equipment', slot: 'amulet' }, {
      category: 'amulet', costs: a.costs,
    });
  }

  C.EQUIP_ITEM_SLOTS = EQUIP_ITEM_SLOTS;
  C.GEAR_ITEM_IDS = GEAR_ITEM_IDS;
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

  const gearIds = [...GEAR_ITEM_IDS];
  C.RESOURCE_IDS.push(...gearIds);
  Object.assign(C.RESOURCE_NAMES, GEAR_NAMES);

  C.SKILLS.crafting.desc = 'Craft armor, weapons, tools, rings, amulets, and pouches';
})();
