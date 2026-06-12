/**
 * Draws the certificate footer signature area: image above the line (left), date (right);
 * below the line: signatory name (left), "Date of Calibration" label (right).
 */
export async function drawCertificateSignatureBlock(ctx, {
  W,
  sigY,
  calibratedByName,
  calibrationDateText,
  signatureImageDataUrl,
  loadImage,
  showSideCalibratedByLabel = false,
}) {
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, sigY);
  ctx.lineTo(W / 2 - 80, sigY);
  ctx.moveTo(W / 2 + 80, sigY);
  ctx.lineTo(W / 2 + 280, sigY);
  ctx.stroke();

  if (showSideCalibratedByLabel) {
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('Calibrated By:', W / 2 - 320, sigY);
  }

  const leftMidX = W / 2 - 180;
  const sigImg = signatureImageDataUrl ? await loadImage(signatureImageDataUrl) : null;
  if (sigImg) {
    const maxW = 220;
    const maxH = 52;
    let dw = sigImg.width;
    let dh = sigImg.height;
    const scale = Math.min(maxW / dw, maxH / dh);
    dw *= scale;
    dh *= scale;
    ctx.drawImage(sigImg, leftMidX - dw / 2, sigY - 10 - dh, dw, dh);
  }

  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(calibrationDateText || '—', W / 2 + 180, sigY - 10);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(calibratedByName || '—', W / 2 - 180, sigY + 25);
}
