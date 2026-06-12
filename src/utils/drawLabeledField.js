export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;

  const lines = getWrappedLines(ctx, text, maxWidth);
  let currentY = y;

  lines.forEach((lineText) => {
    ctx.fillText(lineText, x, currentY);
    currentY += lineHeight;
  });

  return lines.length > 0 ? currentY - lineHeight : y;
}

/** Returns array of lines for a given max width (caller must set ctx.font first). */
export function getWrappedLines(ctx, text, maxWidth) {
  if (!text) return [];

  const words = String(text).split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  return lines;
}

/** Returns height needed for centered wrapped text in a box. */
export function measureCenteredTextBoxHeight(ctx, text, boxWidth, options = {}) {
  const {
    font = 'bold 14px sans-serif',
    lineHeight = 16,
    paddingX = 14,
    paddingY = 10,
    minBoxHeight = 50,
  } = options;

  const content = String(text ?? '').trim();
  if (!content) return minBoxHeight;

  ctx.font = font;
  const innerWidth = boxWidth - paddingX * 2;
  const lines = getWrappedLines(ctx, content, innerWidth);
  const contentHeight = lines.length * lineHeight;
  return Math.max(minBoxHeight, contentHeight + paddingY * 2);
}

/** Draws centered, wrapped text inside a box (text only; draw border separately). */
export function drawCenteredTextInBox(ctx, text, boxX, boxY, boxWidth, boxHeight, options = {}) {
  const {
    font = 'bold 14px sans-serif',
    fillStyle = '#000',
    lineHeight = 16,
    paddingX = 14,
    paddingY = 10,
  } = options;

  const content = String(text ?? '').trim();
  if (!content) return;

  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = 'left';

  const innerWidth = boxWidth - paddingX * 2;
  const lines = getWrappedLines(ctx, content, innerWidth);
  const contentHeight = lines.length * lineHeight;
  const verticalGap = Math.max(0, (boxHeight - contentHeight) / 2);
  const startY = boxY + verticalGap + lineHeight * 0.7;

  lines.forEach((lineText, index) => {
    const lineY = startY + index * lineHeight;
    const lineWidth = ctx.measureText(lineText).width;
    const lineX = boxX + (boxWidth - lineWidth) / 2;
    ctx.fillText(lineText, lineX, lineY);
  });
}

/**
 * Draws "Label: value" without overlap. Value wraps to the next line when
 * there is not enough room after the colon on the current line.
 */
export function drawLabeledField(ctx, options) {
  const {
    label,
    value,
    x,
    y,
    maxWidth,
    labelFont = '15px times new roman',
    valueFont = 'bold 15px times new roman',
    labelColor = '#000000',
    valueColor = '#000000',
    lineHeight = 16,
    rowGap = 10,
    underlineValue = false,
  } = options;

  const valueText = String(value ?? '').trim();
  if (!valueText) return y;

  ctx.textAlign = 'left';
  ctx.font = labelFont;
  ctx.fillStyle = labelColor;
  ctx.fillText(label, x, y);
  const labelWidth = ctx.measureText(label).width;

  const colon = ':';
  ctx.font = labelFont;
  const colonWidth = ctx.measureText(colon).width;
  const gapAfterColon = 4;
  const valueX = x + labelWidth + colonWidth + gapAfterColon;
  const valueAreaWidth = maxWidth - (valueX - x);

  ctx.fillText(colon, x + labelWidth, y);

  ctx.font = valueFont;
  ctx.fillStyle = valueColor;

  if (valueAreaWidth <= 8) {
    const wrappedY = wrapText(ctx, valueText, valueX, y + lineHeight, valueAreaWidth, lineHeight);
    if (underlineValue) {
      ctx.font = valueFont;
      ctx.strokeStyle = valueColor;
      ctx.lineWidth = 1;
      const lines = getWrappedLines(ctx, valueText, valueAreaWidth);
      let lineY = y + lineHeight;
      lines.forEach((lineText) => {
        const lineWidth = ctx.measureText(lineText).width;
        ctx.beginPath();
        ctx.moveTo(valueX, lineY + 2);
        ctx.lineTo(valueX + lineWidth, lineY + 2);
        ctx.stroke();
        lineY += lineHeight;
      });
    }
    return wrappedY + lineHeight + rowGap;
  }

  const words = valueText.split(' ');
  let line = '';
  let currentY = y;
  let currentX = valueX;
  let currentMaxWidth = valueAreaWidth;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > currentMaxWidth && line) {
      ctx.fillText(line, currentX, currentY);
      if (underlineValue) {
        const lineWidth = ctx.measureText(line).width;
        ctx.strokeStyle = valueColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY + 2);
        ctx.lineTo(currentX + lineWidth, currentY + 2);
        ctx.stroke();
      }
      line = word;
      currentY += lineHeight;
      currentX = valueX;
      currentMaxWidth = valueAreaWidth;
    } else {
      line = testLine;
    }
  });

  if (line) {
    ctx.fillText(line, currentX, currentY);
    if (underlineValue) {
      const lineWidth = ctx.measureText(line).width;
      ctx.strokeStyle = valueColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(currentX, currentY + 2);
      ctx.lineTo(currentX + lineWidth, currentY + 2);
      ctx.stroke();
    }
  }

  return currentY + lineHeight + rowGap;
}

/**
 * Draws inline label/value pairs with wrapping when the row exceeds maxWidth.
 */
export function drawInlineLabeledParts(ctx, parts, x, y, maxWidth, options = {}) {
  const {
    labelFont = '12px sans-serif',
    valueFont = 'bold 13px sans-serif',
    labelColor = '#555',
    valueColor = '#000',
    lineHeight = 16,
    rowGap = 4,
  } = options;

  let currentX = x;
  let currentY = y;
  const visibleParts = parts.filter((part) => part.value);

  visibleParts.forEach((part, index) => {
    ctx.font = labelFont;
    ctx.fillStyle = labelColor;
    const labelWidth = ctx.measureText(part.label).width;

    ctx.font = valueFont;
    ctx.fillStyle = valueColor;
    const valueWidth = ctx.measureText(part.value).width;
    const segmentWidth = labelWidth + valueWidth;

    if (currentX !== x && currentX + segmentWidth > x + maxWidth) {
      currentY += lineHeight + rowGap;
      currentX = x;
    }

    ctx.font = labelFont;
    ctx.fillStyle = labelColor;
    ctx.fillText(part.label, currentX, currentY);
    currentX += labelWidth;

    ctx.font = valueFont;
    ctx.fillStyle = valueColor;
    ctx.fillText(part.value, currentX, currentY);
    currentX += valueWidth;

    if (index < visibleParts.length - 1) {
      currentX += 16;
    }
  });

  return currentY + lineHeight;
}
