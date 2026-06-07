import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = 'C:/Worldroot';
const OUT = 'assets/icons';
const MAX = 96;
const PAD = 6;

function buildMetalIcons(_folder, pieces) {
  const metals = ['Copper', 'Iron', 'Gold', 'Platinum'];
  const icons = {};
  for (const metal of metals) {
    for (const [id, label] of pieces) {
      icons[`${metal.toLowerCase()}_${id}`] = `${metal} ${label}-jukebox-bg-removed.png`;
    }
  }
  return icons;
}

const BATCHES = [
  {
    dir: path.join(ROOT, 'Mob and ressource'),
    icons: {
      bog_leech: 'Bog Leech-jukebox-bg-removed.png',
      pollen_moth: 'Pollen Moth-jukebox-bg-removed.png',
      leech_sucker: 'Leech Sucker-jukebox-bg-removed.png',
      moth_pollen: 'Moth Pollen-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Inventory Bag'),
    icons: {
      inventory_bag_1: 'Inventory Bag #1-jukebox-bg-removed.png',
      inventory_bag_2: 'Inventory Bag #2-jukebox-bg-removed.png',
      inventory_bag_3: 'Inventory Bag #3-jukebox-bg-removed.png',
      inventory_bag_4: 'Inventory Bag #4-jukebox-bg-removed.png',
      inventory_bag_5: 'Inventory Bag #5-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Storage Chest'),
    icons: {
      storage_chest_1: 'Storage Chest #1-jukebox-bg-removed.png',
      storage_chest_2: 'Storage Chest #2-jukebox-bg-removed.png',
      storage_chest_3: 'Storage Chest #3-jukebox-bg-removed.png',
      storage_chest_4: 'Storage Chest #4-jukebox-bg-removed.png',
      storage_chest_5: 'Storage Chest #5-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Material Pouches'),
    icons: {
      material_pouch_1: 'Capacity Pouches Material 25-jukebox-bg-removed.png',
      material_pouch_2: 'Capacity Pouches Material 50-jukebox-bg-removed.png',
      material_pouch_3: 'Capacity Pouches Material 100-jukebox-bg-removed.png',
      material_pouch_4: 'Capacity Pouches Material 250-jukebox-bg-removed.png',
      material_pouch_5: 'Capacity Pouches Material 500-jukebox-bg-removed.png',
      material_pouch_6: 'Capacity Pouches Material 1000-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Mining Pouches'),
    icons: {
      mining_pouch_1: 'Capacity Pouches Mining 25-jukebox-bg-removed.png',
      mining_pouch_2: 'Capacity Pouches Mining 50-jukebox-bg-removed.png',
      mining_pouch_3: 'Capacity Pouches Mining 100-jukebox-bg-removed.png',
      mining_pouch_4: 'Capacity Pouches Mining 250-jukebox-bg-removed.png',
      mining_pouch_5: 'Capacity Pouches Mining 500-jukebox-bg-removed.png',
      mining_pouch_6: 'Capacity Pouches Mining 1000-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Woodcutting Pouches'),
    icons: {
      woodcutting_pouch_1: 'Capacity Pouches Woodcutting 25-jukebox-bg-removed.png',
      woodcutting_pouch_2: 'Capacity Pouches Woodcutting 50-jukebox-bg-removed.png',
      woodcutting_pouch_3: 'Capacity Pouches Woodcutting 100-jukebox-bg-removed.png',
      woodcutting_pouch_4: 'Capacity Pouches Woodcutting 250-jukebox-bg-removed.png',
      woodcutting_pouch_5: 'Capacity Pouches Woodcutting 500-jukebox-bg-removed.png',
      woodcutting_pouch_6: 'Capacity Pouches Woodcutting 1000-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Fishing Pouches'),
    icons: {
      fishing_pouch_1: 'Capacity Pouches Fishing 25-jukebox-bg-removed.png',
      fishing_pouch_2: 'Capacity Pouches Fishing 50-jukebox-bg-removed.png',
      fishing_pouch_3: 'Capacity Pouches Fishing 100-jukebox-bg-removed.png',
      fishing_pouch_4: 'Capacity Pouches Fishing 250-jukebox-bg-removed.png',
      fishing_pouch_5: 'Capacity Pouches Fishing 500-jukebox-bg-removed.png',
      fishing_pouch_6: 'Capacity Pouches Fishing 1000-jukebox-bg-removed.png',
    },
  },
  {
    dir: path.join(ROOT, 'Armor'),
    icons: buildMetalIcons('Armor', [
      ['helmet', 'Helmet'], ['chest', 'Chest'], ['legs', 'Legs'], ['boots', 'Boots'],
    ]),
  },
  {
    dir: path.join(ROOT, 'Weapon'),
    icons: buildMetalIcons('Weapon', [
      ['sword', 'Sword'], ['bow', 'Bow'], ['staff', 'Staff'],
    ]),
  },
  {
    dir: path.join(ROOT, 'Tools'),
    icons: buildMetalIcons('Tools', [
      ['pickaxe', 'Pickaxe'], ['axe', 'Axe'], ['rod', 'Rod'],
    ]),
  },
  {
    dir: path.join(ROOT, 'Rings and Amulets'),
    icons: {
      amulet_of_experience: 'Amulet of Experience-jukebox-bg-removed.png',
      amulet_of_fishing: 'Amulet of Fishing-jukebox-bg-removed.png',
      amulet_of_mining: 'Amulet of Mining-jukebox-bg-removed.png',
      amulet_of_woodcutting: 'Amulet of Woodcutting-jukebox-bg-removed.png',
      ring_of_agility: 'Ring of Agility-jukebox-bg-removed.png',
      ring_of_carrying: 'Ring of Carrying-jukebox-bg-removed.png',
      ring_of_fortune: 'Ring of Fortune-jukebox-bg-removed.png',
      ring_of_magic: 'Ring of Magic-jukebox-bg-removed.png',
      ring_of_strength: 'Ring of Strength-jukebox-bg-removed.png',
      ring_of_wealth: 'Ring of Wealth-jukebox-bg-removed.png',
    },
  },
];

async function exportIcon(name, srcPath) {
  if (!fs.existsSync(srcPath)) {
    console.warn('skip missing', srcPath);
    return;
  }
  await sharp(srcPath)
    .ensureAlpha()
    .trim()
    .resize(MAX - PAD * 2, MAX - PAD * 2, { fit: 'inside', withoutEnlargement: false })
    .extend({
      top: PAD, bottom: PAD, left: PAD, right: PAD,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT, `${name}.png`));
  console.log('wrote', name);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const batch of BATCHES) {
    for (const [name, file] of Object.entries(batch.icons)) {
      await exportIcon(name, path.join(batch.dir, file));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
