import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'assets/icons/spritesheet.png';
const OUT = 'assets/icons';

const W = 80;
const H = 68;

const LEFT_X = [20, 118, 208, 258];
const MID_X = [450, 535, 620, 705];
const LOG_X = [808, 906];
const ROW_Y = [78, 203, 388, 453];

function left(row, col) {
  return { left: LEFT_X[col], top: ROW_Y[row] };
}

function mid(row, col) {
  return { left: MID_X[col], top: ROW_Y[row] };
}

function log(row, col) {
  return { left: LOG_X[col], top: ROW_Y[row] };
}

const SLICES = {
  forest_slime: left(0, 0),
  will_o_wisp: left(0, 1),
  gloomcap: left(0, 2),
  spore_bat: left(0, 3),
  slime_gel: left(1, 0),
  wisp_essence: left(1, 1),
  gloomspore: left(1, 2),
  bat_wing_membrane: left(1, 3),
  shrimp: left(2, 0),
  trout: left(2, 1),
  salmon: left(2, 2),
  lobster: left(2, 3),
  copper_bar: left(3, 0),
  iron_bar: left(3, 1),
  gold_bar: left(3, 2),
  platinum_bar: left(3, 3),

  copper: mid(0, 0),
  iron: mid(0, 1),
  gold: mid(0, 2),
  platinum: mid(0, 3),
  copper_vein: mid(1, 0),
  iron_vein: mid(1, 1),
  gold_vein: mid(1, 2),
  platinum_vein: mid(1, 3),

  oak_grove: { left: MID_X[0], top: 388 },
  spruce_grove: { left: MID_X[1], top: 388 },
  birch_grove: { left: MID_X[2], top: 388 },
  jungle_grove: { left: MID_X[3], top: 388 },

  twine: { left: 485, top: 565 },
  wooden_pegs: { left: 575, top: 565 },
  iron_nails: { left: 655, top: 565 },
  resin: { left: 715, top: 565 },

  oak: log(0, 0),
  spruce: log(0, 1),
  birch: log(1, 0),
  jungle: log(1, 1),
};

function stripCheckerboard(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const isWhite = r >= 245 && g >= 245 && b >= 245;
    const isGray =
      r >= 210 &&
      r <= 242 &&
      g >= 210 &&
      g <= 242 &&
      b >= 210 &&
      b <= 242 &&
      Math.abs(r - g) <= 6 &&
      Math.abs(g - b) <= 6;
    if (isWhite || isGray) {
      data[i + 3] = 0;
    }
  }
}

async function exportIcon(name, rect) {
  const { data, info } = await sharp(SRC)
    .extract({ ...rect, width: W, height: H })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  stripCheckerboard(data);

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim()
    .extend({
      top: 6,
      bottom: 6,
      left: 6,
      right: 6,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(OUT, `${name}.png`));

  console.log('wrote', name, rect);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, rect] of Object.entries(SLICES)) {
    await exportIcon(name, rect);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
