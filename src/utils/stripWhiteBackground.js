// Many signature images are exported as flat PNG/JPG with a solid white
// background instead of true alpha transparency. This makes the white
// (or near-white) background pixels transparent so the signature blends
// into the certificate instead of showing as a white box.

const WHITE_THRESHOLD = 245;
const FEATHER_RANGE = 35;

export function stripWhiteBackground(img) {
  if (!img) return null;

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) return img;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height);
  } catch {
    return img;
  }

  const { data } = imageData;
  const low = WHITE_THRESHOLD - FEATHER_RANGE;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = Math.min(data[i], data[i + 1], data[i + 2]);
    if (brightness >= WHITE_THRESHOLD) {
      data[i + 3] = 0;
    } else if (brightness > low) {
      const fade = (brightness - low) / (WHITE_THRESHOLD - low);
      data[i + 3] = Math.round(data[i + 3] * (1 - fade));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
