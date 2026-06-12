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

  const ctx = canvasElement.getContext('2d');
  const SCALE = 2;
  const TAG_WIDTH = 450;
  const TAG_HEIGHT =  320;

  canvasElement.width = TAG_WIDTH * SCALE;
  canvasElement.height = TAG_HEIGHT * SCALE;
  canvasElement.style.width = `${TAG_WIDTH}px`;
  canvasElement.style.height = `${TAG_HEIGHT}px`;
  ctx.scale(SCALE, SCALE);

  const tagLogo = await loadImage(leftLogo);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, TAG_WIDTH, TAG_HEIGHT);

  const doNotRemoveX = TAG_WIDTH - 80;
  const doNotRemoveY = 80;
  const doNotRemoveWidth = 25;
  const doNotRemoveHeight = TAG_HEIGHT - 140;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(doNotRemoveX, doNotRemoveY, doNotRemoveWidth, doNotRemoveHeight);
  ctx.save();
  ctx.translate(doNotRemoveX + doNotRemoveWidth / 2, doNotRemoveY + doNotRemoveHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DO NOT REMOVE TAG', 0, 3);
  ctx.restore();

  const contentLeft = 15;
  const contentTop = 15;
  const contentWidth = doNotRemoveX - contentLeft - 10;
  
  let currentY = contentTop + 25;

  ctx.textAlign = 'left';
  
  const logoX = TAG_WIDTH - 450;
  const logoY = 10;
  if (tagLogo) ctx.drawImage(tagLogo, logoX, logoY, 148, 60);
  ctx.fillStyle = '#0066cc';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('www.mialinstruments.com', logoX + 70, logoY + 60);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000';

  currentY = logoY + 90;

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
}
