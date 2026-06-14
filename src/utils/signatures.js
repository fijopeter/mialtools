// Signature images are matched to a "Calibrated By" name by stripping spaces and
// upper-casing it, e.g. "Jerin Zacharia" -> "JERINZACHARIA" -> src/images/sign/JERINZACHARIA.jpg
const signatureModules = import.meta.glob('../images/sign/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
});

const signatureImageByKey = Object.fromEntries(
  Object.entries(signatureModules).map(([path, url]) => {
    const fileName = path.split('/').pop().replace(/\.[^.]+$/, '');
    return [fileName.replace(/\s+/g, '').toUpperCase(), url];
  }),
);

export const OTHER_CALIBRATED_BY = 'Other';

export const CALIBRATED_BY_OPTIONS = ['JERIN ZACHARIA', 'SOLOMON JOSEPH', OTHER_CALIBRATED_BY];

export function getSignatureImageForName(name) {
  if (!name) return null;
  const key = name.replace(/\s+/g, '').toUpperCase();
  return signatureImageByKey[key] || null;
}
