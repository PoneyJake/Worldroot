import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'assets/icons/spritesheet.png';
const OUT = 'assets/icons';

// Grid measured from 1024x685 spritesheet (4 icons per row, 3 columns of categories)
const COLS = [
  { x0: 18, step: 85 },   // left column
  { x0: 352, step: 85 },  // middle column
  { x0: 686, step: 85 },  // right column
];
const ROW_Y = [38, 163, 288, 413, 538];
const SIZE = 78;

const SLICES = {
  // Monsters (row 0, col 0)
  forest_slime: [0, 0],
  will_o_wisp: [0, 1],
  gloomcap: [0, 2],
  spore_bat: [0, 3],
  // Monster resources (row 1, col 0)
  slime_gel: [1, 0],
  wisp_essence: [1, 1],
  gloomspore: [1, 2],
  bat_wing_membrane: [1, 3],
  // Seafood (row 2, col 0)
  shrimp: [2, 0],
  trout: [2, 1],
  salmon: [2, 2],
  lobster: [2, 3],
  // Bars (row 3, col 0)
  copper_bar: [3, 0],
  iron_bar: [3, 1],
  gold_bar: [3, 2],
  platinum_bar: [3, 3],
  // Ores (row 0, col 1)
  copper: [0, 0, 1],
  iron: [0, 1, 1],
  gold: [0, 2, 1],
  platinum: [0, 3, 1],
  // Veins (row 1, col 1)
  copper_vein: [1, 0, 1],
  iron_vein: [1, 1, 1],
  gold_vein: [1, 2, 1],
  platinum_vein: [1, 3, 1],
  // Logs (row 0, col 2)
  oak: [0, 0, 2],
  spruce: [0, 1, 2],
  birch: [0, 2, 2],
  jungle: [0, 3, 2],
  // Trees (row 1, col 2) — grove card icons
  oak_grove: [1, 0, 2],
  spruce_grove: [1, 1, 2],
  birch_grove: [1, 2, 2],
  jungle_grove: [1, 3, 2],
  // Materials (row 4, col 2)
  twine: [4, 0, 2],
  wooden_pegs: [4, 1, 2],
  iron_nails: [4, 2, 2],
  resin: [4, 3, 2],
};

function rect(row, col, panel = 0) {
  const c = COLS[panel];
  return {
    left: c.x0 + col * c.step,
    top: ROW_Y[row],
    width: SIZE,
    height: SIZE,
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const img = sharp(SRC);

  for (const [name, spec] of Object.entries(SLICES)) {
    const [row, col, panel = 0] = spec;
    const r = rect(row, col, panel);
    await img
      .clone()
      .extract(r)
      .png()
      .toFile(path.join(OUT, `${name}.png`));
    console.log('wrote', name, r);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
