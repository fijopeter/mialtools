/** Rules for uploaded signature images on certificates (natural pixel size + file size). */
export const SIGNATURE_IMAGE_RULES = {
  maxFileSizeBytes: 512 * 1024,
  minWidth: 80,
  maxWidth: 400,
  minHeight: 24,
  maxHeight: 120,
};

export function signatureImageRulesHintText() {
  const r = SIGNATURE_IMAGE_RULES;
  const kb = r.maxFileSizeBytes / 1024;
  return `PNG or JPG, max ${kb} KB, width ${r.minWidth}–${r.maxWidth} px, height ${r.minHeight}–${r.maxHeight} px.`;
}

/**
 * @param {File|null|undefined} file
 * @returns {Promise<{ ok: true, dataUrl: string } | { ok: false, error: string }>}
 */
export function validateSignatureImageFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ ok: true, dataUrl: null });
      return;
    }
    if (!file.type.startsWith('image/')) {
      resolve({ ok: false, error: 'Please choose an image file (PNG or JPEG).' });
      return;
    }
    const { maxFileSizeBytes, minWidth, maxWidth, minHeight, maxHeight } = SIGNATURE_IMAGE_RULES;
    if (file.size > maxFileSizeBytes) {
      resolve({
        ok: false,
        error: `File is too large (max ${Math.round(maxFileSizeBytes / 1024)} KB).`,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w < minWidth || w > maxWidth) {
          resolve({
            ok: false,
            error: `Image width must be ${minWidth}–${maxWidth} px (this file is ${w}×${h} px).`,
          });
          return;
        }
        if (h < minHeight || h > maxHeight) {
          resolve({
            ok: false,
            error: `Image height must be ${minHeight}–${maxHeight} px (this file is ${w}×${h} px).`,
          });
          return;
        }
        resolve({ ok: true, dataUrl });
      };
      img.onerror = () => resolve({ ok: false, error: 'Could not read this image.' });
      img.src = dataUrl;
    };
    reader.onerror = () => resolve({ ok: false, error: 'Could not read this file.' });
    reader.readAsDataURL(file);
  });
}
