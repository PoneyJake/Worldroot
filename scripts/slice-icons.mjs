import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = process.env.ICON_SRC || 'C:/Worldroot/Image crop';
const OUT = 'assets/icons';
const MAX = 96;
const PAD = 6;

const ICONS = {
  forest_slime: 'Slime-jukebox-bg-removed.png',
  will_o_wisp: 'Will-O-Wisp-jukebox-bg-removed.png',
  gloomcap: 'Gloomcap-jukebox-bg-removed.png',
  spore_bat: 'Spore Bat-jukebox-bg-removed.png',
  slime_gel: 'Ectoplasm-jukebox-bg-removed.png',
  wisp_essence: 'Wisp Essence-jukebox-bg-removed.png',
  gloomspore: 'Gloomspore-jukebox-bg-removed.png',
  bat_wing_membrane: 'Bat Wing Membrane-jukebox-bg-removed.png',
  shrimp: 'Shrimp-jukebox-bg-removed.png',
  trout: 'Trout-jukebox-bg-removed.png',
  salmon: 'Salmon-jukebox-bg-removed.png',
  lobster: 'Lobster-jukebox-bg-removed.png',
  copper_bar: 'Copper Bar-jukebox-bg-removed.png',
  iron_bar: 'Iron Bar-jukebox-bg-removed.png',
  gold_bar: 'Gold Bar-jukebox-bg-removed.png',
  platinum_bar: 'Platinum Bar-jukebox-bg-removed.png',
  copper: 'Copper Ore-jukebox-bg-removed.png',
  iron: 'Iron Ore-jukebox-bg-removed.png',
  gold: 'Gold Ore-jukebox-bg-removed.png',
  platinum: 'Platinum Ore-jukebox-bg-removed.png',
  copper_vein: 'Copper Vein-jukebox-bg-removed.png',
  iron_vein: 'Iron Vein-jukebox-bg-removed.png',
  gold_vein: 'Gold Vein-jukebox-bg-removed.png',
  platinum_vein: 'Platinum Vein-jukebox-bg-removed.png',
  oak_grove: 'Oak Tree-jukebox-bg-removed.png',
  spruce_grove: 'Spruce Tree-jukebox-bg-removed.png',
  birch_grove: 'Birch Tree-jukebox-bg-removed.png',
  jungle_grove: 'Jungle Tree-jukebox-bg-removed.png',
  oak: 'Oak Log-jukebox-bg-removed.png',
  spruce: 'Spruce Log-jukebox-bg-removed.png',
  birch: 'Birch Log-jukebox-bg-removed.png',
  jungle: 'Jungle Log-jukebox-bg-removed.png',
  twine: 'Twine-jukebox-bg-removed.png',
  wooden_pegs: 'Wooden Pegs-jukebox-bg-removed.png',
  iron_nails: 'Iron Nails-jukebox-bg-removed.png',
  resin: 'Resin-jukebox-bg-removed.png',
};

async function exportIcon(name, file) {
  const src = path.join(SRC_DIR, file);
  if (!fs.existsSync(src)) {
    throw new Error(`missing source icon: ${src}`);
  }

  await sharp(src)
    .ensureAlpha()
    .trim()
    .resize(MAX - PAD * 2, MAX - PAD * 2, {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .extend({
      top: PAD,
      bottom: PAD,
      left: PAD,
      right: PAD,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT, `${name}.png`));

  console.log('wrote', name, '<-', file);
}

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`icon source folder not found: ${SRC_DIR}`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, file] of Object.entries(ICONS)) {
    await exportIcon(name, file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
