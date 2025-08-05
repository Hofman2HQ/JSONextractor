// Categories for DocumentStatusReport2 Processing Remarks (single source of truth for documentation and logic)
export const PROCESSING_CATEGORIES = {
  'Authentication': {
    description: 'Results from document authenticity verification tests',
    codes: [0, 20, 40, 50, 55, 60, 80]
  },
  'Document Quality': {
    description: 'Issues related to document image quality and clarity',
    codes: [120, 121, 122, 123, 124]
  },
  'Document Processing': {
    description: 'Results from document processing and recognition',
    codes: [130, 140, 160, 180]
  },
  'Document Validation': {
    description: 'Results from document validation and verification',
    codes: [100, 200, 220, 230, 250, 260, 280, 300]
  },
  'DoubleCheck': {
    description: 'DoubleCheck and related processing',
    codes: [320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 550, 560, 580, 600, 620, 640, 720, 740]
  },
  'Processing Issues': {
    description: 'General processing and technical issues',
    codes: [700, 760, 780, 800, 820, 960]
  },
  'Manual Inspection': {
    description: 'Results from manual inspection processes',
    codes: [840, 860, 880]
  },
  'Face Comparison': {
    description: 'Results from face comparison and detection',
    codes: [900, 920, 930, 940, 1440]
  },
  'Digital Signature': {
    description: 'Results from digital signature verification',
    codes: [1580, 1600, 1620, 1640, 1660, 1680, 1700, 1720, 1740, 1760]
  },
  'Fraud Detection': {
    description: 'Results from fraud detection and monitoring',
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
    name: 'Face Comparison',
    description: 'Results from face comparison and related checks',
    codes: [10, 15, 18, 860, 870, 840, 850, 1090, 1100, 1120, 1130, 1410]
  },
  {
    name: 'Document Quality',
    description: 'Issues with document quality and integrity',
    codes: [20, 30, 40, 60, 700, 720, 730, 740, 1140, 1150, 1160, 1170, 1270, 1280, 1340]
  },
  {
    name: 'Missing Fields',
    description: 'Required fields that are missing from the document',
    codes: [80, 100, 150, 160, 180, 200, 220, 260, 300, 320, 340, 380, 400, 420, 440, 880, 900, 1350]
  },
  {
    name: 'Field Issues',
    description: 'Problems with specific document fields',
    codes: [120, 140, 240, 280, 360, 460, 470, 1290, 1300, 1310, 1330]
  },
  {
    name: 'OCR Confidence',
    description: 'Low confidence in OCR results for specific fields',
    codes: [480, 500, 510, 520, 540, 560, 580, 600, 620, 640, 660, 890, 910, 1360, 1450]
  },
  {
    name: 'Instinct/Policy',
    description: 'Instinct risk flags, policy, and threshold rules',
    codes: [665, 670, 680, 750, 760, 770, 1000, 1010, 1180, 1190, 1200, 1210, 1220, 1230, 1240, 1250, 1260, 1470, 1480, 1490]
  },
  {
    name: 'Proof of Address',
    description: 'Proof of address and related rules',
    codes: [780, 960, 970, 980, 990]
  },
  {
    name: 'Age/Photo',
    description: 'Age, photo, and biometric checks',
    codes: [820, 830]
  },
  {
    name: 'Attack Info',
    description: 'Attack info and seen that... risk flags',
    codes: [920, 930, 940, 950, 1180, 1190, 1220, 1230, 1240, 1250, 1260, 1470, 1480, 1490]
  },
  {
    name: 'Personal Info Comparison',
    description: 'Personal information comparison status',
    codes: [1020, 1030, 1040, 1050, 1060, 1070, 1080, 1085, 1380, 1390, 1400, 1460]
  },
  {
    name: 'Technical/Other',
    description: 'Technical, replay, and other remarks',
    codes: [0, 1110, 1320, 1370, 1420, 1430, 1440]
  }
];

// Returns the category name for a given risk remark code, or 'Uncategorized' if not found
export function getRiskRemarkCategory(code) {
  for (const cat of RISK_CATEGORIES) {
    if (cat.codes.includes(Number(code))) return cat.name;
  }
  return 'Uncategorized';
} 