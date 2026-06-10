/** Worldroot — equipment, quests, shop, pouches, bags. */

(function () {
  const C = window.WorldrootConfig;
  if (!C) return;

  Object.assign(C, {
    INVENTORY_PAGE_SIZE: 16,
    STORAGE_PAGE_SIZE: 24,
    BAG_SLOTS_ADD: 4,
    CHEST_SLOTS_ADD: 3,
    HOLD_USE_MS: 2000,
    POUCH_CAPACITIES: [25, 50, 100, 250, 500, 1000],

    EQUIPMENT_SLOTS: [
      { id: 'helmet', label: 'Helmet', symbol: '🪖' },
      { id: 'chest', label: 'Chest', symbol: '🛡' },
      { id: 'legs', label: 'Legs', symbol: '👖' },
      { id: 'boots', label: 'Boots', symbol: '👢' },
      { id: 'weapon', label: 'Weapon', symbol: '⚔' },
      { id: 'amulet', label: 'Amulet', symbol: '📿' },
      { id: 'ring1', label: 'Ring', symbol: '💍' },
      { id: 'ring2', label: 'Ring', symbol: '💍' },
    ],

    TOOL_SLOTS: [
      { id: 'pickaxe', label: 'Pickaxe', symbol: '⛏' },
      { id: 'axe', label: 'Axe', symbol: '🪓' },
      { id: 'rod', label: 'Rod', symbol: '🎣' },
    ],

    CAPACITY_SLOTS: [
      { id: 'material', label: 'Material' },
      { id: 'mining', label: 'Mining' },
      { id: 'woodcutting', label: 'Woodcutting' },
      { id: 'fishing', label: 'Fishing' },
    ],

    FOOD_SLOTS: [
      { id: 'food', label: 'Food', symbol: '🍞' },
    ],

    CONSUMABLE_ITEMS: {
      bread: { type: 'food', heal: 20, threshold: 0.5, cooldownSec: 30 },
      inventory_bag_1: { type: 'bag', tier: 1 },
      inventory_bag_2: { type: 'bag', tier: 2 },
      inventory_bag_3: { type: 'bag', tier: 3 },
      inventory_bag_4: { type: 'bag', tier: 4 },
      inventory_bag_5: { type: 'bag', tier: 5 },
      storage_chest_1: { type: 'chest', tier: 1 },
      storage_chest_2: { type: 'chest', tier: 2 },
      storage_chest_3: { type: 'chest', tier: 3 },
      storage_chest_4: { type: 'chest', tier: 4 },
      storage_chest_5: { type: 'chest', tier: 5 },
      material_pouch_1: { type: 'pouch', category: 'material', tier: 1 },
      material_pouch_2: { type: 'pouch', category: 'material', tier: 2 },
      material_pouch_3: { type: 'pouch', category: 'material', tier: 3 },
      material_pouch_4: { type: 'pouch', category: 'material', tier: 4 },
      material_pouch_5: { type: 'pouch', category: 'material', tier: 5 },
      material_pouch_6: { type: 'pouch', category: 'material', tier: 6 },
      mining_pouch_1: { type: 'pouch', category: 'mining', tier: 1 },
      mining_pouch_2: { type: 'pouch', category: 'mining', tier: 2 },
      mining_pouch_3: { type: 'pouch', category: 'mining', tier: 3 },
      mining_pouch_4: { type: 'pouch', category: 'mining', tier: 4 },
      mining_pouch_5: { type: 'pouch', category: 'mining', tier: 5 },
      mining_pouch_6: { type: 'pouch', category: 'mining', tier: 6 },
      woodcutting_pouch_1: { type: 'pouch', category: 'woodcutting', tier: 1 },
      woodcutting_pouch_2: { type: 'pouch', category: 'woodcutting', tier: 2 },
      woodcutting_pouch_3: { type: 'pouch', category: 'woodcutting', tier: 3 },
      woodcutting_pouch_4: { type: 'pouch', category: 'woodcutting', tier: 4 },
      woodcutting_pouch_5: { type: 'pouch', category: 'woodcutting', tier: 5 },
      woodcutting_pouch_6: { type: 'pouch', category: 'woodcutting', tier: 6 },
      fishing_pouch_1: { type: 'pouch', category: 'fishing', tier: 1 },
      fishing_pouch_2: { type: 'pouch', category: 'fishing', tier: 2 },
      fishing_pouch_3: { type: 'pouch', category: 'fishing', tier: 3 },
      fishing_pouch_4: { type: 'pouch', category: 'fishing', tier: 4 },
      fishing_pouch_5: { type: 'pouch', category: 'fishing', tier: 5 },
      fishing_pouch_6: { type: 'pouch', category: 'fishing', tier: 6 },
    },

    POUCH_CATEGORY_FOR_RESOURCE: {
      slime_gel: 'material', wisp_essence: 'material', gloomspore: 'material',
      bat_wing_membrane: 'material', leech_sucker: 'material', moth_pollen: 'material',
      twine: 'material', wooden_pegs: 'material', iron_nails: 'material', resin: 'material',
      copper: 'mining', iron: 'mining', gold: 'mining', platinum: 'mining',
      copper_bar: 'mining', iron_bar: 'mining', gold_bar: 'mining', platinum_bar: 'mining',
      oak: 'woodcutting', spruce: 'woodcutting', birch: 'woodcutting', jungle: 'woodcutting',
      shrimp: 'fishing', trout: 'fishing', salmon: 'fishing', lobster: 'fishing',
    },

    SHOP_ITEMS: [
      { id: 'bread', gold: 5 },
      { id: 'inventory_bag_2', gold: 500 },
      { id: 'inventory_bag_3', gold: 2000 },
      { id: 'inventory_bag_4', gold: 8000 },
      { id: 'inventory_bag_5', gold: 25000 },
      { id: 'storage_chest_1', gold: 300 },
      { id: 'storage_chest_2', gold: 1200 },
      { id: 'storage_chest_3', gold: 5000 },
      { id: 'storage_chest_4', gold: 15000 },
      { id: 'storage_chest_5', gold: 50000 },
      { id: 'material_pouch_6', gold: 1000000 },
    ],

    CRAFT_RECIPES: [
      { id: 'material_pouch_2', output: 'material_pouch_2', costs: [{ res: 'material_pouch_1', amt: 1 }, { res: 'twine', amt: 50 }, { res: 'slime_gel', amt: 50 }] },
      { id: 'material_pouch_3', output: 'material_pouch_3', costs: [{ res: 'material_pouch_2', amt: 1 }, { res: 'wooden_pegs', amt: 250 }, { res: 'wisp_essence', amt: 250 }] },
      { id: 'material_pouch_4', output: 'material_pouch_4', costs: [{ res: 'material_pouch_3', amt: 1 }, { res: 'iron_nails', amt: 1000 }, { res: 'gloomspore', amt: 750 }, { res: 'bat_wing_membrane', amt: 750 }] },
      { id: 'material_pouch_5', output: 'material_pouch_5', costs: [{ res: 'material_pouch_4', amt: 1 }, { res: 'resin', amt: 5000 }, { res: 'leech_sucker', amt: 2500 }, { res: 'moth_pollen', amt: 2500 }] },
      { id: 'mining_pouch_2', output: 'mining_pouch_2', costs: [{ res: 'mining_pouch_1', amt: 1 }, { res: 'copper', amt: 50 }] },
      { id: 'mining_pouch_3', output: 'mining_pouch_3', costs: [{ res: 'mining_pouch_2', amt: 1 }, { res: 'iron', amt: 500 }] },
      { id: 'mining_pouch_4', output: 'mining_pouch_4', costs: [{ res: 'mining_pouch_3', amt: 1 }, { res: 'gold', amt: 2000 }] },
      { id: 'mining_pouch_5', output: 'mining_pouch_5', costs: [{ res: 'mining_pouch_4', amt: 1 }, { res: 'platinum', amt: 7500 }] },
      { id: 'woodcutting_pouch_2', output: 'woodcutting_pouch_2', costs: [{ res: 'woodcutting_pouch_1', amt: 1 }, { res: 'oak', amt: 50 }] },
      { id: 'woodcutting_pouch_3', output: 'woodcutting_pouch_3', costs: [{ res: 'woodcutting_pouch_2', amt: 1 }, { res: 'spruce', amt: 500 }] },
      { id: 'woodcutting_pouch_4', output: 'woodcutting_pouch_4', costs: [{ res: 'woodcutting_pouch_3', amt: 1 }, { res: 'birch', amt: 2000 }] },
      { id: 'woodcutting_pouch_5', output: 'woodcutting_pouch_5', costs: [{ res: 'woodcutting_pouch_4', amt: 1 }, { res: 'jungle', amt: 7500 }] },
      { id: 'fishing_pouch_2', output: 'fishing_pouch_2', costs: [{ res: 'fishing_pouch_1', amt: 1 }, { res: 'shrimp', amt: 50 }] },
      { id: 'fishing_pouch_3', output: 'fishing_pouch_3', costs: [{ res: 'fishing_pouch_2', amt: 1 }, { res: 'trout', amt: 500 }] },
      { id: 'fishing_pouch_4', output: 'fishing_pouch_4', costs: [{ res: 'fishing_pouch_3', amt: 1 }, { res: 'salmon', amt: 2000 }] },
      { id: 'fishing_pouch_5', output: 'fishing_pouch_5', costs: [{ res: 'fishing_pouch_4', amt: 1 }, { res: 'lobster', amt: 7500 }] },
    ],

    QUEST_TRACKS: {
      main: {
        id: 'main', label: 'Main Quest', icon: '📜',
        quests: [
          {
            id: 'main_q1', title: 'Quest #1',
            desc: 'Kill 5 Forest Slime in the Combat tab.',
            track: { type: 'kill', monster: 'forest_slime', count: 5 },
            rewards: [{ type: 'gold', amount: 100 }, { type: 'item', id: 'inventory_bag_1', amount: 1 }],
          },
          {
            id: 'main_q2', title: 'Quest #2',
            desc: 'Produce 2 Twine in the Producing tab.',
            track: { type: 'produce', resource: 'twine', count: 2 },
            rewards: [{ type: 'item', id: 'material_pouch_1', amount: 1 }],
          },
        ],
      },
      mining: {
        id: 'mining', label: 'Mining Quest', icon: '⛏',
        quests: [
          {
            id: 'mining_q1', title: 'Quest #1',
            desc: 'Mine 1 Copper Ore in the Mining tab.',
            track: { type: 'gather', resource: 'copper', count: 1 },
            rewards: [{ type: 'item', id: 'mining_pouch_1', amount: 1 }],
          },
        ],
      },
      woodcutting: {
        id: 'woodcutting', label: 'Woodcutting Quest', icon: '🪓',
        quests: [
          {
            id: 'woodcutting_q1', title: 'Quest #1',
            desc: 'Chop 1 Oak Log in the Woodcutting tab.',
            track: { type: 'gather', resource: 'oak', count: 1 },
            rewards: [{ type: 'item', id: 'woodcutting_pouch_1', amount: 1 }],
          },
        ],
      },
      fishing: {
        id: 'fishing', label: 'Fishing Quest', icon: '🎣',
        quests: [
          {
            id: 'fishing_q1', title: 'Quest #1',
            desc: 'Fish 1 Shrimp in the Fishing tab.',
            track: { type: 'gather', resource: 'shrimp', count: 1 },
            rewards: [{ type: 'item', id: 'fishing_pouch_1', amount: 1 }],
          },
        ],
      },
    },
  });

  const extraResources = [
    'bread',
    'leech_sucker', 'moth_pollen',
    'inventory_bag_1', 'inventory_bag_2', 'inventory_bag_3', 'inventory_bag_4', 'inventory_bag_5',
    'storage_chest_1', 'storage_chest_2', 'storage_chest_3', 'storage_chest_4', 'storage_chest_5',
    'material_pouch_1', 'material_pouch_2', 'material_pouch_3', 'material_pouch_4', 'material_pouch_5', 'material_pouch_6',
    'mining_pouch_1', 'mining_pouch_2', 'mining_pouch_3', 'mining_pouch_4', 'mining_pouch_5', 'mining_pouch_6',
    'woodcutting_pouch_1', 'woodcutting_pouch_2', 'woodcutting_pouch_3', 'woodcutting_pouch_4', 'woodcutting_pouch_5', 'woodcutting_pouch_6',
    'fishing_pouch_1', 'fishing_pouch_2', 'fishing_pouch_3', 'fishing_pouch_4', 'fishing_pouch_5', 'fishing_pouch_6',
  ];

  const extraNames = {
    bread: 'Bread',
    leech_sucker: 'Leech Sucker', moth_pollen: 'Moth Pollen',
    inventory_bag_1: 'Inventory Bag #1', inventory_bag_2: 'Inventory Bag #2',
    inventory_bag_3: 'Inventory Bag #3', inventory_bag_4: 'Inventory Bag #4', inventory_bag_5: 'Inventory Bag #5',
    storage_chest_1: 'Storage Chest #1', storage_chest_2: 'Storage Chest #2',
    storage_chest_3: 'Storage Chest #3', storage_chest_4: 'Storage Chest #4', storage_chest_5: 'Storage Chest #5',
    material_pouch_1: 'Material Capacity Pouch #1', material_pouch_2: 'Material Capacity Pouch #2',
    material_pouch_3: 'Material Capacity Pouch #3', material_pouch_4: 'Material Capacity Pouch #4',
    material_pouch_5: 'Material Capacity Pouch #5', material_pouch_6: 'Material Capacity Pouch #6',
    mining_pouch_1: 'Mining Capacity Pouch #1', mining_pouch_2: 'Mining Capacity Pouch #2',
    mining_pouch_3: 'Mining Capacity Pouch #3', mining_pouch_4: 'Mining Capacity Pouch #4',
    mining_pouch_5: 'Mining Capacity Pouch #5', mining_pouch_6: 'Mining Capacity Pouch #6',
    woodcutting_pouch_1: 'Woodcutting Capacity Pouch #1', woodcutting_pouch_2: 'Woodcutting Capacity Pouch #2',
    woodcutting_pouch_3: 'Woodcutting Capacity Pouch #3', woodcutting_pouch_4: 'Woodcutting Capacity Pouch #4',
    woodcutting_pouch_5: 'Woodcutting Capacity Pouch #5', woodcutting_pouch_6: 'Woodcutting Capacity Pouch #6',
    fishing_pouch_1: 'Fishing Capacity Pouch #1', fishing_pouch_2: 'Fishing Capacity Pouch #2',
    fishing_pouch_3: 'Fishing Capacity Pouch #3', fishing_pouch_4: 'Fishing Capacity Pouch #4',
    fishing_pouch_5: 'Fishing Capacity Pouch #5', fishing_pouch_6: 'Fishing Capacity Pouch #6',
  };

  const extraIcons = {
    bread: 'bread',
    bog_leech: 'bog_leech', pollen_moth: 'pollen_moth',
    leech_sucker: 'leech_sucker', moth_pollen: 'moth_pollen',
    inventory_bag_1: 'inventory_bag_1', inventory_bag_2: 'inventory_bag_2',
    inventory_bag_3: 'inventory_bag_3', inventory_bag_4: 'inventory_bag_4', inventory_bag_5: 'inventory_bag_5',
    storage_chest_1: 'storage_chest_1', storage_chest_2: 'storage_chest_2',
    storage_chest_3: 'storage_chest_3', storage_chest_4: 'storage_chest_4', storage_chest_5: 'storage_chest_5',
    material_pouch_1: 'material_pouch_1', material_pouch_2: 'material_pouch_2',
    material_pouch_3: 'material_pouch_3', material_pouch_4: 'material_pouch_4',
    material_pouch_5: 'material_pouch_5', material_pouch_6: 'material_pouch_6',
    mining_pouch_1: 'mining_pouch_1', mining_pouch_2: 'mining_pouch_2',
    mining_pouch_3: 'mining_pouch_3', mining_pouch_4: 'mining_pouch_4',
    mining_pouch_5: 'mining_pouch_5', mining_pouch_6: 'mining_pouch_6',
    woodcutting_pouch_1: 'woodcutting_pouch_1', woodcutting_pouch_2: 'woodcutting_pouch_2',
    woodcutting_pouch_3: 'woodcutting_pouch_3', woodcutting_pouch_4: 'woodcutting_pouch_4',
    woodcutting_pouch_5: 'woodcutting_pouch_5', woodcutting_pouch_6: 'woodcutting_pouch_6',
    fishing_pouch_1: 'fishing_pouch_1', fishing_pouch_2: 'fishing_pouch_2',
    fishing_pouch_3: 'fishing_pouch_3', fishing_pouch_4: 'fishing_pouch_4',
    fishing_pouch_5: 'fishing_pouch_5', fishing_pouch_6: 'fishing_pouch_6',
    copper_helmet: 'copper_helmet', copper_chest: 'copper_chest', copper_legs: 'copper_legs', copper_boots: 'copper_boots',
    copper_sword: 'copper_sword', copper_pickaxe: 'copper_pickaxe', copper_axe: 'copper_axe', copper_rod: 'copper_rod',
    amulet_of_mining: 'amulet_of_mining', ring_of_strength: 'ring_of_strength',
  };

  C.RESOURCE_IDS.push(...extraResources);
  Object.assign(C.RESOURCE_NAMES, extraNames);
  Object.assign(C.GAME_ICONS, extraIcons);

  C.MONSTERS.push(
    { id: 'bog_leech', name: 'Bog Leech', level: 40, hp: 750, damage: 50, xp: 75, accuracy: 20, goldMin: 12, goldMax: 20, drop: { id: 'leech_sucker', name: 'Leech Sucker', amount: 1 } },
    { id: 'pollen_moth', name: 'Pollen Moth', level: 50, hp: 1250, damage: 100, xp: 100, accuracy: 25, goldMin: 15, goldMax: 25, drop: { id: 'moth_pollen', name: 'Moth Pollen', amount: 1 } },
  );

  const navInsert = [
    { type: 'page', id: 'equipment', label: 'Equipment', icon: '🛡' },
    { type: 'page', id: 'quests', label: 'Quests', icon: '📜' },
    { type: 'page', id: 'shop', label: 'Shop', icon: '🛒' },
    { type: 'page', id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];
  const storageIdx = C.SIDEBAR_NAV.findIndex((n) => n.id === 'storage');
  C.SIDEBAR_NAV.splice(storageIdx + 1, 0, ...navInsert);

  C.SKILLS.crafting.comingSoon = false;
  C.SKILLS.crafting.desc = 'Craft capacity pouches';
  const craftNav = C.SIDEBAR_NAV.find((n) => n.id === 'crafting');
  if (craftNav) craftNav.comingSoon = false;
})();
