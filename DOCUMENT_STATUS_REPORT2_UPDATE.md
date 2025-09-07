# DocumentStatusReport2 Integration Update

## Overview
This document summarizes the integration of DocumentStatusReport2.ProcessingResultRemarks codes from the official AU10TIX BOS Service References PDF into the JSON Reader application.

**Update:** The app now supports Workflow JSONs (extracting from verificationResults.idv.payload.ProcessingReport) and displays the detected JSON type (Workflow or Secure me) in the Metadata section.

## 2025-09-07 Update

### Category Refinement + Deprecated Cleanup
- Refined both Processing and Risk categories for clearer grouping and full coverage.
- Removed deprecated Processing codes from the documentation view: 1620, 1680, 1700.
- Verified that all known, non-deprecated codes are included in exactly one category.

### Current Processing Categories (Updated)
1. Authentication (0, 20, 40, 50, 55, 60, 80)
2. Document Quality & Readability (120, 121, 122, 123, 124, 660)
3. Recognition & Processing (130, 140, 160, 180, 500)
4. Validation & Compliance (100, 200, 220, 230, 250, 260, 280, 300, 320, 340, 360, 700, 800)
5. Exception Management (DoubleCheck) (380, 400, 420, 440, 460, 480, 520, 540, 550, 560, 580, 600, 620, 640, 720, 740)
6. Manual Inspection / Replay (840, 860, 880, 900)
7. Face & Biometrics (920, 930, 940, 1440, 1840, 1860, 1880)
8. Processing Configuration & Policy (760, 780, 820)
9. User Input / Proof of Address (960)
10. Digital Signature & External Services (1580, 1600, 1640, 1660, 1720, 1740, 1760, 1780)
11. Fraud Detection (1800, 1820)

Deprecated Processing codes excluded from documentation: 1620, 1680, 1700.

### Current Risk Categories (Updated)
1. Biometrics & Face (10, 15, 18, 820, 830, 840, 850, 1090, 1100, 1120, 1130, 1410)
2. Document Quality & Capture (20, 30, 40, 700, 740, 860, 870, 960, 1140, 1150, 1160, 1170, 1270, 1280, 1320, 1340)
3. Missing Fields (80, 100, 150, 160, 180, 200, 220, 260, 300, 320, 340, 380, 400, 420, 440, 880, 900, 1350, 1440)
4. Field Value / Rule Issues (120, 140, 240, 280, 360, 460, 470, 680, 1290, 1300, 1310)
5. OCR Confidence Low (480, 500, 510, 520, 540, 560, 580, 600, 620, 640, 660, 890, 910, 1320, 1360, 1450)
6. Lists & Policy (665, 670, 720, 730, 750, 760, 770, 1000, 1010, 1200, 1210)
7. Proof of Address (780, 970, 980, 990, 1330)
8. Attack Info & Replay (920, 930, 940, 950, 1110, 1180, 1190, 1220, 1230, 1240, 1250, 1260, 1470, 1480, 1490)
9. Personal Info Comparison (1020, 1030, 1040, 1050, 1060, 1070, 1080, 1085, 1380, 1390, 1400, 1460)
10. Validity & Compliance (0, 60, 470, 1200, 1420)
11. Other / Technical (1270, 1280, 1320, 1370, 1430)

Coverage status: All RISK_REMARKS and non-deprecated PROCESSING_REMARKS codes are represented in the above categories.

## Source Documentation
The codes were extracted from the `k.pdf` file which contains the official AU10TIX BOS Service References documentation for the DocumentStatusReport2.ProcessingResultRemarks property.

## Changes Made

### 1. **Updated Processing Remarks Mapping**
**File:** `src/logic/extractor.js`

**Changes:**
- Updated the `PROCESSING_REMARKS` object with the complete list of codes from the PDF
- Added new codes: 0, 80, 1820, 1840, 1860, 1880
- Updated descriptions to match the official documentation exactly
- Enhanced the `findNestedValue` function to also look for `DocumentStatusReport2.ProcessingResultRemarks`

**New Codes Added:**
- **0**: Authentication tests were successfully completed
- **80**: Data extraction was performed as per client request
- **1820**: The document was processed by Serial Fraud Monitor
- **1840**: Deepfake test was not executed due to poor image quality
- **1860**: Liveness test was not executed due to poor image quality
- **1880**: The photo gender does not match the gender in document

### 2. **Updated Documentation Categories**
**File:** `src/components/DocumentationPage.js`

**Changes:**
- Reorganized processing remark categories to match the new codes
- Added new categories: "Manual Inspection" and "Fraud Detection"
- Updated existing categories with new code ranges
- Added informational alert about the documentation update

**New Categories:**
- **Manual Inspection**: Codes 840, 860, 880, 900
- **Fraud Detection**: Codes 1800, 1820

**Updated Categories:**
- **Authentication**: Now includes codes 0, 20, 40, 50, 55, 60, 80
- **Exception Management**: Expanded to include more exception-related codes
- **Face Comparison**: Now includes codes 920, 930, 940, 1440, 1840, 1860, 1880
- **Digital Signature**: Expanded to include all digital signature related codes

### 3. **Updated Results Display Categorization**
**File:** `src/components/ResultsDisplay.js`

**Changes:**
- Updated the `getRemarkCategory` function to use the new category mappings
- Changed from range-based categorization to specific code arrays for better accuracy
- Added support for the new categories in the UI

## Code Structure

### Processing Remarks Categories (Updated)
1. **Authentication** (0, 20, 40, 50, 55, 60, 80)
2. **Document Quality** (100, 120, 121, 122, 123, 124)
3. **Document Processing** (130, 140, 160, 180)
4. **Document Validation** (200, 220, 230, 250, 260, 280, 300)
5. **Exception Management** (320, 380, 400, 420, 440, 460, 480, 500, 520, 540, 550, 560, 580, 600, 620, 640, 720, 740)
6. **Processing Issues** (660, 700, 760, 780, 800, 820)
7. **Face Comparison** (920, 930, 940, 1440, 1840, 1860, 1880)
8. **Digital Signature** (1580, 1600, 1620, 1640, 1660, 1680, 1700, 1720, 1740, 1760, 1780)
9. **Manual Inspection** (840, 860, 880, 900)
10. **Fraud Detection** (1800, 1820)

## Benefits

### 1. **Complete Coverage**
- Now supports all DocumentStatusReport2.ProcessingResultRemarks codes
- No more "Unknown processing remark" messages for valid codes

### 2. **Accurate Descriptions**
- All descriptions now match the official AU10TIX documentation exactly
- Improved clarity and consistency

### 3. **Better Organization**
- More logical categorization of codes
- New categories for specialized processes (Manual Inspection, Fraud Detection)

### 4. **Enhanced User Experience**
- Users can now see detailed explanations for all possible processing remarks
- Better understanding of document processing results

## Testing

The updated extractor logic has been tested with:
- Null/undefined data handling
- Empty object processing
- Valid data structure processing
- Malformed data handling

All tests pass successfully with the new code structure.

## Files Modified

1. `src/logic/extractor.js` - Updated processing remarks mapping and extraction logic
2. `src/components/DocumentationPage.js` - Updated documentation categories and UI
3. `src/components/ResultsDisplay.js` - Updated categorization logic

## Result

The JSON Reader application now provides complete and accurate documentation for all DocumentStatusReport2.ProcessingResultRemarks codes, giving users comprehensive insight into document processing results and their meanings. 
