const COLUMN_SUFFIXES = [
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
];

function parseWidth(value) {
  if (value == null) return null;
  const numeric = parseFloat(String(value).replace('%', '').trim());
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Reads columnOne, columnTwo, … from a certificate config.
 * Each column is an ordered array of layout items:
 *   { "width": "50%" }           — column width (optional)
 *   { "title": "Section Name" }  — section heading
 *   { "field": "fieldKey" }      — label + value from form data
 *   { "blank": "blank" }         — empty vertical spacing (blank line)
 *   { "staticText": "Any text" } — fixed text (not from form data)
 *   { "communicationBlock": true, "fields": ["a","b","c","d"] }
 */
export function getCertificateColumns(certificateConfig) {
  if (!certificateConfig) return [];

  const columns = [];

  COLUMN_SUFFIXES.forEach((suffix) => {
    const keys = [`column${suffix}`, `columns${suffix}`];
    keys.forEach((key) => {
      if (Array.isArray(certificateConfig[key]) && !columns.some((col) => col.sourceKey === key)) {
        columns.push(parseColumnDefinition(certificateConfig[key], key));
      }
    });
  });

  for (let index = 1; index <= 10; index += 1) {
    const key = `column${index}`;
    if (Array.isArray(certificateConfig[key]) && !columns.some((col) => col.sourceKey === key)) {
      columns.push(parseColumnDefinition(certificateConfig[key], key));
    }
  }

  if (columns.length === 0 && Array.isArray(certificateConfig.columns)) {
    certificateConfig.columns.forEach((columnItems, index) => {
      if (Array.isArray(columnItems)) {
        columns.push(parseColumnDefinition(columnItems, `columns[${index}]`));
      }
    });
  }

  applyDefaultWidths(columns);
  return columns;
}

/** Collects all form field keys referenced in a certificate layout. */
export function getCertificateFieldKeys(certificateConfig) {
  if (!certificateConfig) return new Set();

  const keys = new Set();

  const collectFromItems = (items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      if (item.field) keys.add(item.field);
      if (item.communicationBlock && Array.isArray(item.fields)) {
        item.fields.forEach((fieldKey) => keys.add(fieldKey));
      }
    });
  };

  COLUMN_SUFFIXES.forEach((suffix) => {
    [`column${suffix}`, `columns${suffix}`].forEach((key) => {
      if (Array.isArray(certificateConfig[key])) {
        collectFromItems(certificateConfig[key]);
      }
    });
  });

  for (let index = 1; index <= 10; index += 1) {
    const key = `column${index}`;
    if (Array.isArray(certificateConfig[key])) {
      collectFromItems(certificateConfig[key]);
    }
  }

  if (Array.isArray(certificateConfig.columns)) {
    certificateConfig.columns.forEach(collectFromItems);
  }

  return keys;
}

function parseColumnDefinition(items, sourceKey = '') {
  let width = null;
  let textAlign = null;
  const content = [];

  items.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    if (item.width != null) {
      width = parseWidth(item.width);
      if (item.textAlign != null) {
        textAlign = item.textAlign;
      }
      return;
    }

    content.push(item);
  });

  return { sourceKey, width, textAlign, content };
}

function applyDefaultWidths(columns) {
  const specifiedTotal = columns.reduce((sum, col) => sum + (col.width ?? 0), 0);
  const unspecifiedCount = columns.filter((col) => col.width == null).length;

  if (unspecifiedCount === 0 && specifiedTotal > 0) {
    columns.forEach((col) => {
      col.width = (col.width / specifiedTotal) * 100;
    });
    return;
  }

  const remaining = Math.max(0, 100 - specifiedTotal);
  const defaultShare = unspecifiedCount > 0 ? remaining / unspecifiedCount : 100 / Math.max(columns.length, 1);

  columns.forEach((col) => {
    if (col.width == null) col.width = defaultShare;
  });
}

export function layoutCertificateColumns(columns, canvasWidth, marginLeft = 90, marginRight = 90) {
  const contentWidth = canvasWidth - marginLeft - marginRight;
  let currentX = marginLeft;

  return columns.map((column) => {
    const widthPx = (column.width / 100) * contentWidth;
    const layout = {
      ...column,
      x: currentX,
      widthPx,
      maxFieldWidth: Math.max(120, widthPx - 155),
      textAlign: column.textAlign || 'left',
    };
    currentX += widthPx;
    return layout;
  });
}
