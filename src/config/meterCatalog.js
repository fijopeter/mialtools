// Form Schemas - Import from new app
import UltraSonicLevelMeter from '../formSchemas/UltraSonicLevelMeter/meter.json';
import A1Tag from '../formSchemas/UltraSonicLevelMeter/tag.json';
import A2Meter from '../formSchemas/RadarLevelMeter/meter.json';
import A2Tag from '../formSchemas/RadarLevelMeter/tag.json';
import B1Meter from '../formSchemas/ElectromagneticBTUMeter/meter.json';
import B1Tag from '../formSchemas/ElectromagneticBTUMeter/tag.json';
import B2Meter from '../formSchemas/ElectromagneticFLOWMeter/meter.json';
import B2Tag from '../formSchemas/ElectromagneticFLOWMeter/tag.json';
import C1_1Meter from '../formSchemas/InlineUltrasonicFLOWMeter/meter.json';
import C1_1Tag from '../formSchemas/InlineUltrasonicFLOWMeter/tag.json';
import C1_2Meter from '../formSchemas/InlineUltrasonicBTUMeter/meter.json';
import C1_2Tag from '../formSchemas/InlineUltrasonicBTUMeter/tag.json';
import C2_1_1Meter from '../formSchemas/ClampOnUltrasonicFLOWMeter5/meter.json';
import C2_1_1Tag from '../formSchemas/ClampOnUltrasonicFLOWMeter5/tag.json';
import C2_1_2Meter from '../formSchemas/ClampOnUltrasonicFLOWMeter1/meter.json';
import C2_1_2Tag from '../formSchemas/ClampOnUltrasonicFLOWMeter1/tag.json';
import C2_2_1Meter from '../formSchemas/ClampOnUltrasonicBTUMeter1/meter.json';
import C2_2_1Tag from '../formSchemas/ClampOnUltrasonicBTUMeter1/tag.json';
import C2_2_2Meter from '../formSchemas/ClampOnUltrasonicBTUMeter5/meter.json';
import C2_2_2Tag from '../formSchemas/ClampOnUltrasonicBTUMeter5/tag.json';

// Certificate Schemas - Import from new app
import UltraSonicLevelMeterCertificate from '../certificateSchemas/UltraSonicLevelMeter/certificate.json';
import A2Certificate from '../certificateSchemas/RadarLevelMeter/certificate.json';
import B1Certificate from '../certificateSchemas/ElectromagneticBTUMeter/certificate.json';
import B2Certificate from '../certificateSchemas/ElectromagneticFLOWMeter/certificate.json';
import C1_1Certificate from '../certificateSchemas/InlineUltrasonicFLOWMeter/certificate.json';
import C1_2Certificate from '../certificateSchemas/InlineUltrasonicBTUMeter/certificate.json';
import C2_1_1Certificate from '../certificateSchemas/ClampOnUltrasonicFLOWMeter5/certificate.json';
import C2_1_2Certificate from '../certificateSchemas/ClampOnUltrasonicFLOWMeter1/certificate.json';
import C2_2_1Certificate from '../certificateSchemas/ClampOnUltrasonicBTUMeter1/certificate.json';
import C2_2_2Certificate from '../certificateSchemas/ClampOnUltrasonicBTUMeter5/certificate.json';

// Tag Draw Schemas - Import from new app
import A1TagDraw from '../tagSchemas/UltraSonicLevelMeter/tag.json';
import A2TagDraw from '../tagSchemas/RadarLevelMeter/tag.json';
import B1TagDraw from '../tagSchemas/ElectromagneticBTUMeter/tag.json';
import B2TagDraw from '../tagSchemas/ElectromagneticFLOWMeter/tag.json';
import C1_1TagDraw from '../tagSchemas/InlineUltrasonicFLOWMeter/tag.json';
import C1_2TagDraw from '../tagSchemas/InlineUltrasonicBTUMeter/tag.json';
import C2_1_1TagDraw from '../tagSchemas/ClampOnUltrasonicFLOWMeter5/tag.json';
import C2_1_2TagDraw from '../tagSchemas/ClampOnUltrasonicFLOWMeter1/tag.json';
import C2_2_1TagDraw from '../tagSchemas/ClampOnUltrasonicBTUMeter1/tag.json';
import C2_2_2TagDraw from '../tagSchemas/ClampOnUltrasonicBTUMeter5/tag.json';

export const meterCatalog = [
  {
    id: 'A',
    code: 'A',
    label: 'Level Meter',
    description: 'Ultrasonic and radar level measurement instruments',
    options: [
      { id: 'UltraSonicLevelMeter', code: 'UltraSonicLevelMeter', label: 'Ultra Sonic Level Meter', meterSchema: UltraSonicLevelMeter, tagSchema: A1Tag, certificateConfig: UltraSonicLevelMeterCertificate, tagDrawConfig: A1TagDraw.tagDraw, description: 'Unveiling the MULR Ultrasonic Level Sensors: your ultimate choice for accurate liquid level detection without direct contact.' },
      { id: 'RadarLevelMeter', code: 'RadarLevelMeter', label: 'Radar Level Meter', meterSchema: A2Meter, tagSchema: A2Tag, certificateConfig: A2Certificate, tagDrawConfig: A2TagDraw.tagDraw, description: 'Meet our MRL radar level technology—designed to deliver fast, accurate, and reliable level measurement.' },
    ],
  },
  {
    id: 'B',
    code: 'B',
    label: 'Electromagnetic Meters',
    description: 'Electromagnetic BTU and flow measurement instruments',
    options: [
      { id: 'ElectromagneticBTUMeter', code: 'ElectromagneticBTUMeter', label: 'Electromagnetic BTU Meter', meterSchema: B1Meter, tagSchema: B1Tag, certificateConfig: B1Certificate, tagDrawConfig: B1TagDraw.tagDraw, description: 'Meet our MEF 2100 series inline electromagnetic flow and BTU meters.' },
      { id: 'ElectromagneticFLOWMeter', code: 'ElectromagneticFLOWMeter', label: 'Electromagnetic FLOW Meter', meterSchema: B2Meter, tagSchema: B2Tag, certificateConfig: B2Certificate, tagDrawConfig: B2TagDraw.tagDraw, description: 'Inline electromagnetic flow meters utilizing Faraday\'s Law of Electromagnetic Induction.' },
    ],
  },
  {
    id: 'C',
    code: 'C',
    label: 'Ultrasonic Meters',
    description: 'Inline and clamp-on ultrasonic flow and BTU measurement instruments',
    options: [
      {
        id: 'C1',
        code: 'C.1',
        label: 'Inline Ultrasonic Meter',
        description: 'Inline ultrasonic flow and BTU meters',
        subOptions: [
          { id: 'InlineUltrasonicFLOWMeter', code: 'InlineUltrasonicFLOWMeter', label: 'Inline Ultrasonic FLOW Meter', meterSchema: C1_1Meter, tagSchema: C1_1Tag, certificateConfig: C1_1Certificate, tagDrawConfig: C1_1TagDraw.tagDraw, description: 'Mial MUF 1200 Inline Ultrasonic Flow & BTU meter for precision water flow measurement.' },
          { id: 'InlineUltrasonicBTUMeter', code: 'InlineUltrasonicBTUMeter', label: 'Inline Ultrasonic BTU Meter', meterSchema: C1_2Meter, tagSchema: C1_2Tag, certificateConfig: C1_2Certificate, tagDrawConfig: C1_2TagDraw.tagDraw, description: 'Mial MUF 1200 Inline Ultrasonic Flow & BTU meter for thermal energy measurement.' },
        ],
      },
      {
        id: 'C2',
        code: 'C.2',
        label: 'Clamp On Ultrasonic Meter',
        description: 'Clamp-on ultrasonic flow and BTU meters',
        subOptions: [
          {
            id: 'C2.1',
            code: 'C.2.1',
            label: 'Clamp On Ultrasonic FLOW Meter',
            subOptions: [
              { id: 'ClampOnUltrasonicFLOW5', code: 'ClampOnUltrasonicFLOW5', label: 'Clamp On Ultrasonic FLOW Meter (±0.5%)', meterSchema: C2_1_1Meter, tagSchema: C2_1_1Tag, certificateConfig: C2_1_1Certificate, tagDrawConfig: C2_1_1TagDraw.tagDraw, description: 'Non-invasive clamp-on flow measurement with ±0.5% accuracy.' },
              { id: 'ClampOnUltrasonicFLOW1', code: 'ClampOnUltrasonicFLOW1', label: 'Clamp On Ultrasonic FLOW Meter (±0.1%)', meterSchema: C2_1_2Meter, tagSchema: C2_1_2Tag, certificateConfig: C2_1_2Certificate, tagDrawConfig: C2_1_2TagDraw.tagDraw, description: 'High-precision non-invasive clamp-on flow measurement with ±0.1% accuracy.' },
            ],
          },
          {
            id: 'C2.2',
            code: 'C.2.2',
            label: 'Clamp On Ultrasonic BTU Meter',
            subOptions: [
              { id: 'ClampOnUltrasonicBTU1', code: 'ClampOnUltrasonicBTU1', label: 'Clamp On Ultrasonic BTU Meter (±0.1%)', meterSchema: C2_2_1Meter, tagSchema: C2_2_1Tag, certificateConfig: C2_2_1Certificate, tagDrawConfig: C2_2_1TagDraw.tagDraw, description: 'High-precision non-invasive clamp-on BTU measurement with ±0.1% accuracy.' },
              { id: 'ClampOnUltrasonicBTU5', code: 'ClampOnUltrasonicBTU5', label: 'Clamp On Ultrasonic BTU Meter (±0.5%)', meterSchema: C2_2_2Meter, tagSchema: C2_2_2Tag, certificateConfig: C2_2_2Certificate, tagDrawConfig: C2_2_2TagDraw.tagDraw, description: 'Non-invasive clamp-on BTU measurement with ±0.5% accuracy.' },
            ],
          },
        ],
      },
    ],
  },
];

export function findMeterOption(categoryId, optionId) {
  const category = meterCatalog.find((item) => item.id === categoryId);
  if (!category) return null;
  
  // Helper function to recursively search through options and subOptions
  const searchOptions = (options) => {
    for (const opt of options) {
      if (opt.id === optionId) return opt;
      if (opt.subOptions) {
        const found = searchOptions(opt.subOptions);
        if (found) return found;
      }
    }
    return null;
  };
  
  const option = searchOptions(category.options);
  if (!option) return null;
  return { category, option };
}

// Flatten the catalog to get all final meter options
export function flattenMeterCatalog() {
  const finalOptions = [];

  function traverseOptions(options, categoryId, categoryLabel, path = [], idPath = []) {
    options.forEach((option) => {
      const currentPath = [...path, option.label];
      const currentIdPath = [...idPath, option.id];

      if (option.meterSchema && !option.subOptions) {
        finalOptions.push({
          id: option.id,
          code: option.code,
          label: option.label,
          description: option.description,
          categoryId,
          categoryLabel,
          fullPath: currentPath.join(' → '),
          navigationPath: currentIdPath,
          meterSchema: option.meterSchema,
          tagSchema: option.tagSchema,
          certificateConfig: option.certificateConfig,
          tagDrawConfig: option.tagDrawConfig,
        });
      } else if (option.subOptions) {
        traverseOptions(option.subOptions, categoryId, categoryLabel, currentPath, currentIdPath);
      }
    });
  }

  meterCatalog.forEach((category) => {
    traverseOptions(category.options, category.id, category.label);
  });

  return finalOptions;
}

// Extract categories for UI
export const categories = meterCatalog.map(cat => ({
  id: cat.id,
  code: cat.code,
  label: cat.label,
  description: cat.description,
  icon: '📊'
}));

// Get all meters in a specific category
export function getMetersByCategory(categoryId) {
  const allMeters = flattenMeterCatalog();
  return allMeters.filter(meter => meter.categoryId === categoryId);
}
