export const toolsCatalog = [
  {
    id: 'both-gen',
    name: 'Generate Certificate & Tag',
    description: 'Generate certificates and tags together in one workflow - Perfect for complete meter documentation',
    category: 'Generation',
    locked: false,
    lastUsed: '--',
    usageCount: 0,
    status: 'active',
    action: 'both'
  },
  {
    id: 'certificate-gen',
    name: 'Certificate Generator',
    description: 'Generate professional certificates for meters with detailed information and signatures',
    category: 'Generation',
    locked: false,
    lastUsed: '--',
    usageCount: 0,
    status: 'active',
    action: 'certificate'
  },
  {
    id: 'tag-gen',
    name: 'Tag Generator',
    description: 'Create QR codes and RFID tags for meters with automatic encoding',
    category: 'Generation',
    locked: false,
    lastUsed: '--',
    usageCount: 0,
    status: 'active',
    action: 'tag'
  },
  {
    id: 'certificate-vault',
    name: 'Certificate Repository',
    description: 'Upload certificates and tags, then search and download them by file name',
    category: 'Management',
    locked: false,
    lastUsed: '--',
    usageCount: 0,
    status: 'active',
    action: 'vault'
  },
  {
    id: 'datalog-converter',
    name: 'Datalog to Excel Converter',
    description: 'Convert raw flow meter text/CSV log exports into a formatted Excel report with flow rate, velocity and totalizer columns',
    category: 'Conversion',
    locked: true,
    lastUsed: '--',
    usageCount: 0,
    status: 'locked',
    action: 'datalog-converter',
    unlockMessage: 'Coming soon'
  }
]
