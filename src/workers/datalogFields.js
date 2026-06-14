export const METER_CONFIGS = {
  flow: {
    id: 'flow',
    label: 'Flow Meter',
    description: 'Flow rate, velocity and flow totals',
    sheetName: 'Flow Meter Data',
    fields: [
      { key: 'b', label: 'Flow Rate', name: 'flowRate', sample: '+1.245081E+02 m3/h' },
      { key: 'c', label: 'Flow Velocity', name: 'flowVelocity', sample: '+1.957143E+00 m/s' },
      { key: 'd', label: 'Positive Flow Total', name: 'positiveTotal', sample: '+1.202761E+00 m3' },
      { key: 'e', label: 'Net Flow Total', name: 'netTotal', sample: '+1.202761E+00 m3' },
      { key: 'f', label: 'Negative Flow Total', name: 'negativeTotal', sample: '+0.000000E+00 m3' },
    ],
  },
  btu: {
    id: 'btu',
    label: 'BTU Meter',
    description: 'Flow, energy and temperature readings',
    sheetName: 'BTU Meter Data',
    fields: [
      { key: 'b', label: 'Flow Rate', name: 'flowRate', sample: '+1.245081E+02 m3/h' },
      { key: 'c', label: 'Flow Velocity', name: 'flowVelocity', sample: '+1.957143E+00 m/s' },
      { key: 'd', label: 'Positive Flow Total', name: 'positiveTotal', sample: '+1.202761E+00 m3' },
      { key: 'e', label: 'Net Flow Total', name: 'netTotal', sample: '+1.202761E+00 m3' },
      { key: 'f', label: 'Negative Flow Total', name: 'negativeTotal', sample: '+0.000000E+00 m3' },
      { key: 'g', label: 'Energy Rate', name: 'energyRate', sample: '+5.432100E+01 kW' },
      { key: 'h', label: 'Heat Energy Total', name: 'heatEnergyTotal', sample: '+1.234567E+03 kWh' },
      { key: 'i', label: 'Cold Energy Total', name: 'coldEnergyTotal', sample: '+0.000000E+00 kWh' },
      { key: 'j', label: 'Supply Temperature', name: 'supplyTemp', sample: '+6.500000E+01 C' },
      { key: 'k', label: 'Return Temperature', name: 'returnTemp', sample: '+4.500000E+01 C' },
    ],
  },
}

export function buildSampleFormat(config) {
  const lines = ['a=2024-01-19,13:23:08']
  config.fields.forEach((field) => {
    lines.push(`${field.key}=${field.sample}`)
  })
  return lines.join('\n')
}
