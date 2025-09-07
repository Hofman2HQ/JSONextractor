// Categories for DocumentStatusReport2 Processing Remarks (single source of truth for documentation and logic)
export const PROCESSING_CATEGORIES = {
  'Authentication': {
    description: 'Authentication flow and basic test execution status',
    codes: [0, 20, 40, 50, 55, 60, 80]
  },
  'Document Quality & Readability': {
    description: 'Image quality, lighting, blur and readability issues',
    codes: [120, 121, 122, 123, 124, 660]
  },
  'Recognition & Processing': {
    description: 'Recognition, multi-page consistency and processing outcomes',
    codes: [130, 140, 160, 180, 500]
  },
  'Validation & Compliance': {
    description: 'Validity, structural checks and compliance expectations',
    codes: [100, 200, 220, 230, 250, 260, 280, 300, 320, 340, 360, 700, 800]
  },
  'Exception Management (DoubleCheck)': {
    description: 'Exception Management/DoubleCheck routing and service conditions',
    codes: [380, 400, 420, 440, 460, 480, 520, 540, 550, 560, 580, 600, 620, 640, 720, 740]
  },
  'Manual Inspection / Replay': {
    description: 'Manual inspection outcomes and replay detections',
    codes: [840, 860, 880, 900]
  },
  'Face & Biometrics': {
    description: 'Face detection, deepfake, and biometric-related checks',
    codes: [920, 930, 940, 1440, 1840, 1860, 1880]
  },
  'Processing Configuration & Policy': {
    description: 'Configuration-driven outcomes (e.g., digital ID, masking, undefined tests)',
    codes: [760, 780, 820]
  },
  'User Input / Proof of Address': {
    description: 'User-provided inputs impacting processing (e.g., POA missing)',
    codes: [960]
  },
  'Digital Signature & External Services': {
    description: 'Digital signature validation and external data extraction',
    // Exclude deprecated codes (1620, 1680, 1700) from documentation
    codes: [1580, 1600, 1640, 1660, 1720, 1740, 1760, 1780]
  },
  'Fraud Detection': {
    description: 'Serial Fraud Monitor and forgery-related detections',
    codes: [1800, 1820]
  }
};

// Returns the category name for a given processing remark code, or 'Other' if not found
export function getProcessingRemarkCategory(code) {
  for (const [catName, catObj] of Object.entries(PROCESSING_CATEGORIES)) {
    if (catObj.codes.includes(Number(code))) return catName;
  }
  return 'Other';
}

// Risk categories for Risk Management Remarks (single source of truth)
export const RISK_CATEGORIES = [
  {
    name: 'Biometrics & Face',
    description: 'Face comparison outcomes, age/gender checks and deepfake',
    codes: [10, 15, 18, 820, 830, 840, 850, 1090, 1100, 1120, 1130, 1410]
  },
  {
    name: 'Document Quality & Capture',
    description: 'Image quality, capture integrity and completeness',
    codes: [20, 30, 40, 700, 740, 860, 870, 960, 1140, 1150, 1160, 1170, 1270, 1280, 1320, 1340]
  },
  {
    name: 'Missing Fields',
    description: 'Required fields that are missing from the document',
    codes: [80, 100, 150, 160, 180, 200, 220, 260, 300, 320, 340, 380, 400, 420, 440, 880, 900, 1350, 1440]
  },
  {
    name: 'Field Value / Rule Issues',
    description: 'Field values indicate issues or violated restrictions',
    codes: [120, 140, 240, 280, 360, 460, 470, 680, 1290, 1300, 1310]
  },
  {
    name: 'OCR Confidence Low',
    description: 'Low OCR/text confidence for specific fields',
    codes: [480, 500, 510, 520, 540, 560, 580, 600, 620, 640, 660, 890, 910, 1320, 1360, 1450]
  },
  {
    name: 'Lists & Policy',
    description: 'Instinct threshold/whitelist/blacklist/policy and liveness policy',
    codes: [665, 670, 720, 730, 750, 760, 770, 1000, 1010, 1200, 1210]
  },
  {
    name: 'Proof of Address',
    description: 'Proof-of-address checks and rules',
    codes: [780, 970, 980, 990, 1330]
  },
  {
    name: 'Attack Info & Replay',
    description: 'Attack info flags, replay/injection, and digital identity signals',
    codes: [920, 930, 940, 950, 1110, 1180, 1190, 1220, 1230, 1240, 1250, 1260, 1470, 1480, 1490]
  },
  {
    name: 'Personal Info Comparison',
    description: 'Personal information comparison status mismatches',
    codes: [1020, 1030, 1040, 1050, 1060, 1070, 1080, 1085, 1380, 1390, 1400, 1460]
  },
  {
    name: 'Validity & Compliance',
    description: 'Expiry/visa/nationality compliance and related checks',
    codes: [0, 60, 470, 1200, 1420]
  },
  {
    name: 'Other / Technical',
    description: 'Miscellaneous or system-level signals',
    codes: [1270, 1280, 1320, 1370, 1430]
  }
];

// Returns the category name for a given risk remark code, or 'Uncategorized' if not found
export function getRiskRemarkCategory(code) {
  for (const cat of RISK_CATEGORIES) {
    if (cat.codes.includes(Number(code))) return cat.name;
  }
  return 'Uncategorized';
} 
