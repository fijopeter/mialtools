import ExcelJS from 'exceljs'
import { METER_CONFIGS } from './datalogFields.js'

const HEADER_FILL = 'FF2E348E'
const SUBHEADER_FILL = 'FF4F55A8'
const TITLE_FILL = 'FF06B6D4'
const DECIMAL_FORMAT = '0.000000'
const HEADER_BLOCK_ROWS = 5
const COMPANY_LOGO_URL = new URL('../images/fullLogo.jpg', import.meta.url).href
const COMPANY_LINK = 'https://www.mialinstruments.com'

function parseValueUnit(raw) {
  const tokens = raw.trim().split(/\s+/)
  const value = parseFloat(tokens[0])
  return {
    value: Number.isFinite(value) ? value : null,
    unit: tokens[1] || '',
  }
}

self.onmessage = async (event) => {
  const { file, meterType } = event.data
  const config = METER_CONFIGS[meterType] || METER_CONFIGS.flow

  try {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(config.sheetName)

    const columns = [
      { key: 'date', width: 14 },
      { key: 'time', width: 12 },
    ]
    config.fields.forEach((field) => {
      columns.push({ key: `${field.name}Value`, width: 14 })
      columns.push({ key: `${field.name}Unit`, width: 10 })
    })
    sheet.columns = columns

    // Company logo + link in the top-left corner
    try {
      const logoBuffer = await (await fetch(COMPANY_LOGO_URL)).arrayBuffer()
      const logoImageId = workbook.addImage({ buffer: logoBuffer, extension: 'jpeg' })
      sheet.addImage(logoImageId, { tl: { col: 0, row: 0 }, ext: { width: 180, height: 75 } })
    } catch {
      // Logo is decorative - continue without it if it can't be loaded
    }

    sheet.mergeCells(HEADER_BLOCK_ROWS, 1, HEADER_BLOCK_ROWS, 2)
    const linkCell = sheet.getCell(HEADER_BLOCK_ROWS, 1)
    linkCell.value = { text: 'www.mialinstruments.com', hyperlink: COMPANY_LINK }
    linkCell.font = { color: { argb: 'FF0563C1' }, underline: true, size: 10 }
    linkCell.alignment = { vertical: 'middle', horizontal: 'left' }

    // Row HEADER_BLOCK_ROWS + 1 is left blank as a gap before the table
    const TITLE_ROW = HEADER_BLOCK_ROWS + 2
    const TABLE_HEADER_ROW_1 = HEADER_BLOCK_ROWS + 3
    const TABLE_HEADER_ROW_2 = HEADER_BLOCK_ROWS + 4

    sheet.mergeCells(TITLE_ROW, 1, TITLE_ROW, columns.length)
    const titleCell = sheet.getCell(TITLE_ROW, 1)
    titleCell.value = `Data Analysis - ${config.label}`
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TITLE_FILL } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    sheet.getRow(TITLE_ROW).height = 26

    sheet.getCell(TABLE_HEADER_ROW_1, 1).value = 'Date'
    sheet.getCell(TABLE_HEADER_ROW_1, 2).value = 'Time'
    sheet.mergeCells(TABLE_HEADER_ROW_1, 1, TABLE_HEADER_ROW_2, 1)
    sheet.mergeCells(TABLE_HEADER_ROW_1, 2, TABLE_HEADER_ROW_2, 2)

    config.fields.forEach((field, i) => {
      const startCol = 3 + i * 2
      sheet.getCell(TABLE_HEADER_ROW_1, startCol).value = field.label
      sheet.mergeCells(TABLE_HEADER_ROW_1, startCol, TABLE_HEADER_ROW_1, startCol + 1)
      sheet.getCell(TABLE_HEADER_ROW_2, startCol).value = 'Value'
      sheet.getCell(TABLE_HEADER_ROW_2, startCol + 1).value = 'Unit'
    })

    const headerRow1 = sheet.getRow(TABLE_HEADER_ROW_1)
    const headerRow2 = sheet.getRow(TABLE_HEADER_ROW_2)
    headerRow1.height = 22
    headerRow2.height = 22
    headerRow1.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
    headerRow2.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 2) return // Date/Time merge into row 1, keep its fill
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUBHEADER_FILL } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: TABLE_HEADER_ROW_2 }]
    const valueColumnWidths = {}
    config.fields.forEach((field) => {
      const key = `${field.name}Value`
      sheet.getColumn(key).numFmt = DECIMAL_FORMAT
      valueColumnWidths[key] = 14
    })

    const fieldByKey = {}
    config.fields.forEach((field) => {
      fieldByKey[field.key] = field
    })
    const lastKey = config.fields[config.fields.length - 1].key

    const reader = file.stream().getReader()
    const decoder = new TextDecoder('utf-8')
    const totalBytes = file.size

    let buffer = ''
    let bytesRead = 0
    let rowCount = 0
    let record = {}

    const processLine = (line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      const eq = trimmed.indexOf('=')
      if (eq === -1) return

      const key = trimmed.slice(0, eq)
      const value = trimmed.slice(eq + 1)

      if (key === 'a') {
        const [date, time] = value.split(',')
        record.date = (date || '').trim()
        record.time = (time || '').trim()
        return
      }

      const field = fieldByKey[key]
      if (!field) return

      const parsed = parseValueUnit(value)
      const valueKey = `${field.name}Value`
      record[valueKey] = parsed.value
      record[`${field.name}Unit`] = parsed.unit

      if (parsed.value != null) {
        const displayLength = parsed.value.toFixed(6).length
        if (displayLength > valueColumnWidths[valueKey]) {
          valueColumnWidths[valueKey] = displayLength
        }
      }

      if (key === lastKey) {
        sheet.addRow(record)
        rowCount += 1
        record = {}
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      bytesRead += value.byteLength
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) processLine(line)

      const readProgress = totalBytes > 0 ? bytesRead / totalBytes : 0
      self.postMessage({ type: 'progress', progress: Math.min(90, Math.round(readProgress * 90)), rowCount })
    }

    buffer += decoder.decode()
    if (buffer.trim()) processLine(buffer)

    if (rowCount === 0) {
      throw new Error('No valid records found. Please check the file format and try again.')
    }

    Object.entries(valueColumnWidths).forEach(([key, len]) => {
      sheet.getColumn(key).width = len + 2
    })

    self.postMessage({ type: 'progress', progress: 95, rowCount })

    const result = await workbook.xlsx.writeBuffer()
    const arrayBuffer = result.buffer
      ? result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength)
      : result

    self.postMessage({ type: 'done', buffer: arrayBuffer, rowCount }, [arrayBuffer])
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message || 'Failed to convert the file.' })
  }
}
