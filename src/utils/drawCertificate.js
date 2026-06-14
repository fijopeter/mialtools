import { formatStoredDateForDisplay } from './formatStoredDateForDisplay.js';
import { drawCertificateSignatureBlock } from './drawCertificateSignatureBlock.js';
import { getCertificateColumns, layoutCertificateColumns } from './certificateColumns.js';
import { drawLabeledField, drawInlineLabeledParts, wrapText, drawCenteredTextInBox, measureCenteredTextBoxHeight, getWrappedLines } from './drawLabeledField.js';

const PRIMARY_BLUE = '#2e348e';
const ACCENT_GOLD = '#c5a059';

function drawCoolCorner(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.strokeStyle = PRIMARY_BLUE;
  ctx.lineWidth = 6;
  ctx.moveTo(0, 100);
  ctx.lineTo(0, 0);
  ctx.lineTo(100, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = ACCENT_GOLD;
  ctx.lineWidth = 4;
  ctx.moveTo(15, 15);
  ctx.lineTo(45, 15);
  ctx.moveTo(15, 15);
  ctx.lineTo(15, 45);
  ctx.stroke();
  ctx.restore();
}

function drawSectionTitle(ctx, title, x, y) {
  ctx.font = 'bold 18px times new roman';
  ctx.fillStyle = '#000000';
  ctx.fillText(title.toUpperCase(), x, y);
  
  // Measure the title width for full underline
  const titleWidth = ctx.measureText(title.toUpperCase()).width;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y + 4, titleWidth, 2);
}

function drawField(ctx, fieldMeta, labelKey, value, x, y, columnWidth) {
  let label = fieldMeta[labelKey]?.label || labelKey;
  // Use "Meter Tag Information" label for meterTag field in certificate
  if (labelKey === 'meterTag') {
    label = 'Meter Tag Information';
  }
  return drawLabeledField(ctx, {
    label,
    value,
    x,
    y,
    maxWidth: columnWidth,
  });
}

function drawCommunicationBlock(ctx, fields, certificateData, x, y, blockWidth) {
  const [protocolKey, addressKey, baudKey, parityKey] = fields;
  const hasComm = fields.some((key) => certificateData[key]);

  if (!hasComm) return y;

  const padding = 5;
  const lineHeight = 10;
  const maxBoxContentWidth = blockWidth - (padding * 2);

  // Prepare the text with space between label and value
  ctx.font = '15px times new roman';
  const labelText = 'Communication Interface Protocol- ';
  const valueText = certificateData[protocolKey] || '---';
  const fullText = labelText + valueText;

  // Get wrapped lines with proper width
  const lines = getWrappedLines(ctx, fullText, maxBoxContentWidth);

  // Size the box to fit the widest line instead of the full column width
  const contentWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const boxWidth = Math.min(blockWidth, contentWidth + (padding * 2));

  // Calculate box height based on number of lines
  const boxHeight = (lines.length * lineHeight) + (padding * 2);

  // Draw box with calculated height
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  // Draw wrapped text inside box
  ctx.fillStyle = '#000';
  ctx.font = '15px times new roman';
  let currentY = y + padding + lineHeight;
  lines.forEach((line) => {
    ctx.fillText(line, x + padding, currentY);
    currentY += lineHeight;
  });

  // Display other fields below the box
  const parts = [
    { label: 'Address: ', value: certificateData[addressKey] },
    { label: 'Baud Rate: ', value: certificateData[baudKey] },
    { label: 'Parity: ', value: certificateData[parityKey] },
  ];

  const innerWidth = blockWidth - 20;
  const endY = drawInlineLabeledParts(ctx, parts, x, y + boxHeight + 25, innerWidth);
  return endY + 5;
}

function drawStaticText(ctx, text, x, y, columnWidth) {
  const content = String(text ?? '').trim();
  if (!content) return y;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px sans-serif';
  const endY = wrapText(ctx, content, x, y, columnWidth, 16);
  return endY + 22;
}

function drawColumnContent(ctx, column, fieldMeta, certificateData, startY) {
  let y = startY;
  const columnWidth = column.widthPx - 8;
  
  // Apply column text alignment
  const textAlign = column.textAlign || 'left';
  ctx.textAlign = textAlign;

  column.content.forEach((item) => {
    if (item.title) {
      drawSectionTitle(ctx, item.title, column.x, y);
      y += 35;
      return;
    }

    if (item.blank != null) {
      y += 18;
      return;
    }

    if (item.staticText != null) {
      y = drawStaticText(ctx, item.staticText, column.x, y, columnWidth);
      return;
    }

    if (item.communicationBlock && Array.isArray(item.fields)) {
      y = drawCommunicationBlock(
        ctx,
        item.fields,
        certificateData,
        column.x,
        y,
        columnWidth,
      );
      return;
    }

    // Handle two fields side-by-side
    if (item.field1 && item.field2) {
      const gap = item.gap || 4;
      // Use custom widths if provided, otherwise split equally
      const field1Width = item.field1Width || (columnWidth - gap) / 2;
      const field2Width = item.field2Width || (columnWidth - gap) / 2;
      
      const leftX = column.x;
      const rightX = column.x + field1Width + gap;

      const endY1 = drawField(
        ctx,
        fieldMeta,
        item.field1,
        certificateData[item.field1],
        leftX,
        y,
        field1Width,
      );

      const endY2 = drawField(
        ctx,
        fieldMeta,
        item.field2,
        certificateData[item.field2],
        rightX,
        y,
        field2Width,
      );

      // Use the maximum y position from both fields
      y = Math.max(endY1, endY2);
      return;
    }

    if (item.field) {
      y = drawField(
        ctx,
        fieldMeta,
        item.field,
        certificateData[item.field],
        column.x,
        y,
        columnWidth,
      );
    }
  });

  return y;
}

export async function drawCertificate({
  canvas,
  certificateData,
  fieldMeta,
  certificateConfig,
  loadImage,
  watermarkLogo,
  leftLogo,
  rightLogo,
}) {
  if (!canvas || !certificateData || !certificateConfig) return;

  const ctx = canvas.getContext('2d');
  const SCALE = 2;
  const W = 1191;
  const H = 842;

  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  ctx.scale(SCALE, SCALE);

  const [watermark, leftLogoImg, rightLogoImg] = await Promise.all([
    loadImage(watermarkLogo),
    loadImage(leftLogo),
    loadImage(rightLogo),
  ]);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  if (watermark) {
    ctx.globalAlpha = 0.04;
    ctx.drawImage(watermark, W / 2 - 280, H / 2 - 280, 550, 650);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = PRIMARY_BLUE;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  drawCoolCorner(ctx, 35, 35, 0);
  drawCoolCorner(ctx, W - 35, 35, Math.PI / 2);
  drawCoolCorner(ctx, W - 35, H - 35, Math.PI);
  drawCoolCorner(ctx, 35, H - 35, -Math.PI / 2);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px times new roman';
  ctx.fillText(certificateConfig.title || 'METER', W / 2 + 3, 95);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px times new roman';
  ctx.fillText(certificateConfig.subtitle || 'CERTIFICATE OF CALIBRATION', W / 2 + 20, 125);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px times new roman';
  ctx.fillText('CALIBRATION, INSTALLATION & CONFIGURATION DATA for', W / 2, 165);
  ctx.font = 'bold 16px times new roman';

  const headerLine = certificateConfig.headerLine || certificateConfig.title || 'METER';
  const headerModel = certificateData.model ? `Model ${certificateData.model}` : headerLine;
  ctx.fillText(`${headerLine} ${headerModel}`, W / 2, 188);

  if (certificateData.serialNo && certificateData.flowTubeSerialNo) {
    ctx.fillText(`Serial No. ${certificateData.serialNo}/${certificateData.flowTubeSerialNo}`, W / 2, 210);
  } else if (certificateData.serialNo) {
    ctx.fillText(`Serial No. ${certificateData.serialNo}`, W / 2, 210);
  }

  if (leftLogoImg) ctx.drawImage(leftLogoImg, 60, 70, 260, 110);
  if (rightLogoImg) ctx.drawImage(rightLogoImg, W - 290, 65, 210, 120);

  const startY = 255;
  ctx.textAlign = 'left';

  const columns = layoutCertificateColumns(getCertificateColumns(certificateConfig), W);
  columns.forEach((column) => {
    drawColumnContent(ctx, column, fieldMeta, certificateData, startY);
  });

  const sigY = 655;
  const calibratedByName = (certificateData.calibratedBy || '').trim();
  const calibrationDateText = formatStoredDateForDisplay((certificateData.date || '').trim());
  await drawCertificateSignatureBlock(ctx, {
    W,
    sigY,
    calibratedByName,
    calibrationDateText,
    signatureImageDataUrl: certificateData.signatureImageDataUrl,
    loadImage,
    showSideCalibratedByLabel: true,
  });

  const fY = 700;
  const footerBoxX = W / 2 - 400;
  const footerBoxWidth = 800;
  const footerText =
    certificateConfig.footerText ||
    'MIAL INSTRUMENTS PVT. LTD. certifies that this instrument was calibrated against primary standards.';
  const footerOptions = {
    font: 'bold 14px sans-serif',
    lineHeight: 16,
    paddingX: 28,
    paddingY: 0,
    minBoxHeight: 75,
  };

  const footerBoxHeight = measureCenteredTextBoxHeight(ctx, footerText, footerBoxWidth, footerOptions);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(footerBoxX, fY, footerBoxWidth, footerBoxHeight);
  ctx.strokeRect(footerBoxX + 3.5, fY + 3.5, footerBoxWidth - 6, footerBoxHeight - 6);

  drawCenteredTextInBox(ctx, footerText, footerBoxX, fY, footerBoxWidth, footerBoxHeight, footerOptions);
  
  // Draw address text aligned with footer box
  const addressY = fY + footerBoxHeight + 15;
  ctx.textAlign = 'center';
  ctx.font = 'italic bold 12px serif';
  ctx.fillText(
    '856/6 GIDC Makarpura, Vadodara- 390010 Gujarat, India Tel (+91) 9913449547/9913449548',
    W / 2,
    addressY,
  );
}
