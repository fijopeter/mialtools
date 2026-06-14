import ExcelJS from 'exceljs'
import { METER_CONFIGS } from './datalogFields.js'

const HEADER_FILL = 'FF2E348E'
const SUBHEADER_FILL = 'FF4F55A8'
const DECIMAL_FORMAT = '0.000000'

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

    sheet.getCell(1, 1).value = 'Date'
    sheet.getCell(1, 2).value = 'Time'
    sheet.mergeCells(1, 1, 2, 1)
    sheet.mergeCells(1, 2, 2, 2)

    config.fields.forEach((field, i) => {
      const startCol = 3 + i * 2
      sheet.getCell(1, startCol).value = field.label
      sheet.mergeCells(1, startCol, 1, startCol + 1)
      sheet.getCell(2, startCol).value = 'Value'
      sheet.getCell(2, startCol + 1).value = 'Unit'
    })

    const headerRow1 = sheet.getRow(1)
    const headerRow2 = sheet.getRow(2)
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

    sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }]
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
