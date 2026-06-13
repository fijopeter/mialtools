import { formatStoredDateForDisplay } from './formatStoredDateForDisplay.js';
import { getFieldValue } from './mergeSchemas.js';
import { drawLabeledField } from './drawLabeledField.js';

const TAG_FIELD_OPTIONS = {
  labelFont: '12px Arial',
  valueFont: 'bold 12px Arial',
  labelColor: '#000',
  valueColor: '#000',
  lineHeight: 14,
  rowGap: 4,
  valueIndent: 8,
  underlineValue: true,
};

const TAG_FOOTER_FIELD_KEYS = new Set(['calibratedBy', 'date', 'calibrationDate']);

function shouldSkipTagDrawField(field, headerKey) {
  if (!field?.key) return true;
  if (field.key === 'model' || field.key === 'serialNo') return true;
  if (headerKey && field.key === headerKey) return true;
  if (TAG_FOOTER_FIELD_KEYS.has(field.key)) return true;
  return false;
}

function drawTagField(ctx, label, value, x, y, maxWidth) {
  return drawLabeledField(ctx, {
    label,
    value,
    x,
    y,
    maxWidth,
    ...TAG_FIELD_OPTIONS,
  });
}

export async function drawTag({ canvasElement, dataToRender, tagDrawConfig, leftLogo, loadImage }) {
  if (!canvasElement || !dataToRender) return;

  const SCALE = 2;
  const TAG_WIDTH = 450;
  const BOX_MARGIN = 4;
  const DO_NOT_REMOVE_COL_WIDTH = 28;
  const BOTTOM_PADDING = 16;

  const tagLogo = await loadImage(leftLogo);

  const boxWidth = TAG_WIDTH - BOX_MARGIN * 2;
  const dividerX = BOX_MARGIN + boxWidth - DO_NOT_REMOVE_COL_WIDTH;
  const contentLeft = BOX_MARGIN + 10;
  const contentWidth = dividerX - contentLeft - 10;

  // Draws the tag's content (logo, fields, footer text) and returns the Y
  // position of the last line, used to size the tag so it hugs the content
  // instead of leaving a large gap before the bottom border.
  const renderContent = (ctx) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000';

    const logoX = contentLeft;
    const logoY = 10;
    if (tagLogo) ctx.drawImage(tagLogo, logoX, logoY, 148, 60);
    ctx.fillStyle = '#0066cc';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('www.mialinstruments.com', logoX + 70, logoY + 60);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000';

    let currentY = logoY + 90;

    currentY = drawTagField(
      ctx,
      'METER TAG',
      dataToRender[tagDrawConfig.headerKey] || '',
      contentLeft,
      currentY,
      contentWidth,
    );

    currentY += 3;
    const fields = tagDrawConfig.fields || [];
    const modelField = fields.find((field) => field.key === 'model');
    const serialField = fields.find((field) => field.key === 'serialNo');
    const modelValue = modelField
      ? getFieldValue(dataToRender, modelField.key, modelField.fallbackKey)
      : '';
    const serialValue = serialField
      ? getFieldValue(dataToRender, serialField.key, serialField.fallbackKey)
      : '';

    if (modelField && serialField && modelValue && serialValue) {
      ctx.font = TAG_FIELD_OPTIONS.labelFont;
      const modelLabelWidth = ctx.measureText(`${modelField.label}:`).width + 4;
      ctx.font = TAG_FIELD_OPTIONS.valueFont;
      const modelValueWidth = ctx.measureText(modelValue).width;
      const serialStartX = contentLeft + (serialField.offsetX || 140);

      if (serialStartX > contentLeft + modelLabelWidth + modelValueWidth + 8) {
        drawTagField(ctx, modelField.label, modelValue, contentLeft, currentY, serialStartX - contentLeft - 8);
        drawTagField(ctx, serialField.label, serialValue, serialStartX, currentY, contentWidth - (serialStartX - contentLeft));
        currentY += TAG_FIELD_OPTIONS.lineHeight + TAG_FIELD_OPTIONS.rowGap + 4;
      } else {
        currentY = drawTagField(ctx, modelField.label, modelValue, contentLeft, currentY, contentWidth);
        currentY = drawTagField(ctx, serialField.label, serialValue, contentLeft, currentY, contentWidth);
      }
    } else {
      if (modelField) {
        currentY = drawTagField(
          ctx,
          modelField.label,
          modelValue,
          contentLeft,
          currentY,
          contentWidth,
        );
      }
      if (serialField) {
        currentY = drawTagField(
          ctx,
          serialField.label,
          serialValue,
          contentLeft,
          currentY,
          contentWidth,
        );
      }
    }

    currentY += 4;

    currentY += 10;
    const headerKey = tagDrawConfig.headerKey;
    fields
      .filter((field) => !shouldSkipTagDrawField(field, headerKey))
      .forEach((field) => {
        currentY = drawTagField(
          ctx,
          field.label,
          getFieldValue(dataToRender, field.key, field.fallbackKey),
          contentLeft,
          currentY,
          contentWidth,
        );
      });

    currentY += 13;
    // Draw both footer fields on the same row
    ctx.font = TAG_FIELD_OPTIONS.labelFont;
    const calibratedByLabelWidth = ctx.measureText('CALIBRATED BY:').width + 4;
    ctx.font = TAG_FIELD_OPTIONS.valueFont;
    const calibratedByValueWidth = ctx.measureText(dataToRender.calibratedBy || '').width;
    const dateStartX = contentLeft + calibratedByLabelWidth + calibratedByValueWidth + 16;

    drawTagField(ctx, 'CALIBRATED BY', dataToRender.calibratedBy, contentLeft, currentY, dateStartX - contentLeft - 8);
    drawTagField(ctx, 'DATE', formatStoredDateForDisplay(dataToRender.date || dataToRender.calibrationDate), dateStartX, currentY, contentWidth - (dateStartX - contentLeft));
    currentY += TAG_FIELD_OPTIONS.lineHeight + TAG_FIELD_OPTIONS.rowGap;
    currentY += 13;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText('MIAL INSTRUMENTS PVT.LTD. INDIA', TAG_WIDTH / 2, currentY);

    return currentY;
  };

  // Pass 1: measure the content on an offscreen canvas to find out how tall
  // the tag needs to be for this meter's fields.
  const measureCanvas = document.createElement('canvas');
  measureCanvas.width = TAG_WIDTH * SCALE;
  measureCanvas.height = 600 * SCALE;
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.scale(SCALE, SCALE);
  const contentBottomY = renderContent(measureCtx);
  const TAG_HEIGHT = Math.ceil(contentBottomY) + BOTTOM_PADDING;

  // Pass 2: size the real canvas to fit and draw the border, side notice and content.
  canvasElement.width = TAG_WIDTH * SCALE;
  canvasElement.height = TAG_HEIGHT * SCALE;
  canvasElement.style.width = `${TAG_WIDTH}px`;
  canvasElement.style.height = `${TAG_HEIGHT}px`;
  const ctx = canvasElement.getContext('2d');
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, TAG_WIDTH, TAG_HEIGHT);

  // Outer border around the whole tag: a main column for the data and a narrow
  // right column for the "DO NOT REMOVE TAG" notice (previously a separate box).
  const boxX = BOX_MARGIN;
  const boxY = BOX_MARGIN;
  const boxHeight = TAG_HEIGHT - BOX_MARGIN * 2;

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
  ctx.beginPath();
  ctx.moveTo(dividerX, boxY);
  ctx.lineTo(dividerX, boxY + boxHeight);
  ctx.stroke();

  ctx.save();
  ctx.translate(dividerX + DO_NOT_REMOVE_COL_WIDTH / 2, boxY + boxHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DO NOT REMOVE TAG', 0, 3);
  ctx.restore();

  renderContent(ctx);
}
