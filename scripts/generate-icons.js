const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const sizes = [16, 32, 192, 512];
const iconsDir = path.join(__dirname, "..", "public", "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const color = { r: 193, g: 127, b: 89 }; // --color-accent

sizes.forEach((size) => {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255;
    }
  }
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}.png`),
    PNG.sync.write(png)
  );
  console.log(`Generated icon-${size}.png`);
});

