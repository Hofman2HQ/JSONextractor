import config from '../../config.json';
import { PROCESSING_CATEGORIES, getProcessingRemarkCategory, getRiskRemarkCategory } from '../components/documentationCategories.js';

// Processing remarks mapping - Updated with DocumentStatusReport2 codes
const PROCESSING_REMARKS = {
  0: "Authentication tests were successfully completed",
  20: "One or more authentication tests failed",
  40: "One or more authentication tests yielded inconclusive results",
  50: "Authentication tests were performed on only one side of the document",
  55: "The back side was classified based on barcode recognition",
  60: "No authentication tests were applicable for this document type; only document data was extracted",
  80: "Data extraction was performed as per client request",
  100: "The document has expired",
  120: "The quality of the document image is too low",
  121: "The document image is blurry",
  122: "The document image is too dark",
  123: "The document image has excessive light exposure",
  124: "The document image has unacceptable saturation levels",
  130: "Certain authenticity checks were not completed",
  140: "The pages of the multi-page document do not match",
  160: "The processing request was rejected",
  180: "The document could not be recognized",
  200: "Multiple quality issues prevented data extraction and authentication",
  220: "The document is not identified as an ID",
  230: "The request was denied due to poor image quality",
  250: "The document is listed as blocked",
  260: "The document is flagged",
  280: "A second side is required for this ID type",
  300: "A second side is not supported for this ID type",
  320: "The second side was ignored as it is irrelevant to the document",
  340: "A barcode was expected but could not be extracted due to quality issues",
  360: "A barcode was expected but could not be decoded",
  380: "Exception Management was triggered based on a predefined customer rule",
  400: "The document was processed by Exception Management",
  420: "Exception Management identified two images in the same file",
  440: "Exception Management detected that the document is incomplete",
  460: "Exception Management could not recognize the document or its language",
  480: "Exception Management identified the document as a black-and-white image",
  500: "Pages are missing or mismatched",
  520: "Exception Management detected that the document or its language was destroyed",
  540: "The document was recognized, but no data was extracted and no authentication tests were performed",
  550: "The Exception Management request failed",
  560: "The Exception Management service is unavailable",
  580: "The Exception Management service timed out",
  600: "The daily Exception Management quota has been exceeded",
  620: "Face comparison request was forwarded to Exception Management",
  640: "Face comparison request was processed by Exception Management",
  660: "One or more fields could not be read or were partially extracted due to poor readability",
  700: "The declared country or ID type does not match the uploaded ID",
  720: "Only BOS results are available because the Exception Management SLA has been exceeded",
  740: "Exception Management detected that the document is not permitted by the customer",
  760: "The document is identified as a digital ID; no authentication tests were performed",
  780: "Personal information fields have been masked per request",
  800: "Front side missing",
  820: "No authenticity tests were defined for the document",
  840: "Manual Inspection detected Document Replay Screen",
  860: "Manual Inspection detected Document Replay Paper",
  880: "Manual Inspection detected Document Replay Digital",
  900: "Manual Face Comparison result superseded NIST Face Comparison result",
  920: "Face not detected on document",
  930: "Face not detected on selfie",
  940: "Identified as Deepfake",
  960: "Missing Proof Of Address data in user input",
  1440: "Enhanced checks were done by face comparison service",
  1580: "The digital signature has expired",
  1600: "The digital signature is validated",
  1620: "This value is deprecated",
  1640: "The digital signature is bad or broken",
  1660: "The digital signature is unsupported or can not be validated",
  1680: "This value is deprecated",
  1700: "This value is deprecated",
  1720: "Successful data extraction from external vendor",
  1740: "Data extraction from external vendor failed",
  1760: "The digital document is forged",
  1780: "No cryptographic signature to retrieve",
  1800: "Some forgeries prevent manual inspection",
  1820: "The document was processed by Serial Fraud Monitor",
  1840: "Deepfake test was not executed due to poor image quality",
  1860: "Liveness test was not executed due to poor image quality",
  1880: "The photo gender does not match the gender in document"
};

// Primary Processing Result mapping for DocumentStatusReport2
const PRIMARY_PROCESSING_RESULTS = {
  0: "The request passed OK.",
  20: "The request is conditional.",
  40: "The request failed. Please resubmit the request.",
  60: "The document is recognized, its data is extracted but no authentication tests were executed.",
  70: "Request rejected.",
  80: "Document not recognized.",
  100: "Extremely low quality or NonID image. Please submit a higher quality image or an ID image.",
  120: "The request was forwarded to DoubleCheck."
};

// Risk management remarks mapping
const RISK_REMARKS = {
  0: "The Expiry date is overdue.",
  10: "The Face comparison result has been failed.",
  15: "The Face comparison result has been overmatched.",
  18: "The Face comparison result has returned irregular status.",
  20: "The ID document was detected as Entropy quality.",
  30: "The ID document was detected as incomplete.",
  40: "The ID document was detected with bad layout or cut.",
  60: "The Issue date threshold rule has been exceeded.",
  80: "The Mandatory 'Address' field is missing.",
  100: "The Mandatory 'Birth Place' field is missing.",
  120: "The mandatory 'Coordinates' field value indicates an ID/classified country location issue.",
  140: "The mandatory 'Coordinates' field value indicates a picture location issue.",
  150: "The Mandatory 'Date of Birth' field is missing.",
  160: "The Mandatory 'Date of Expiry' field is missing.",
  180: "The Mandatory 'Date of Issue' field is missing.",
  200: "The Mandatory 'Document Number' field is missing.",
  220: "The mandatory 'EquipmentMaker' field is missing.",
  240: "The mandatory 'EquipmentMaker' field value indicates an equipment maker issue.",
  260: "The mandatory 'EquipmentModel' field is missing.",
  280: "The mandatory 'EquipmentModel' field value indicates an equipment model issue.",
  300: "The Mandatory 'First Name' field is missing.",
  320: "The Mandatory 'Full Name' field is missing.",
  340: "The mandatory 'ImageCreationDateTime' field is missing.",
  360: "The mandatory 'ImageCreationDateTime' field value indicates an image creation datetime issue.",
  380: "The Mandatory 'Last Name' field is missing.",
  400: "The Mandatory 'Middle Name' field is missing.",
  420: "The Mandatory 'Nationality' field is missing.",
  440: "The mandatory 'SoftwareUsed' field is missing.",
  460: "The mandatory 'SoftwareUsed' field value indicates a software usage issue.",
  470: "The 'Nationality' country code restriction rule has been activated.",
  480: "The OCR confidence of the 'Address' field is low.",
  500: "The OCR confidence of the 'Birth Place' field is low.",
  510: "The OCR confidence of the 'Date of Birth' field is low.",
  520: "The OCR confidence of the 'Date of Expiry' field is low.",
  540: "The OCR confidence of the 'Date of Issue' field is low.",
  560: "The OCR confidence of the 'Document Number' field is low.",
  580: "The OCR confidence of the 'First Name' field is low.",
  600: "The OCR confidence of the 'Last Name' field is low.",
  620: "The OCR confidence of the 'Full Name' field is low.",
  640: "The OCR confidence of the 'Middle Name' field is low.",
  660: "The OCR confidence of the 'Nationality' field is low.",
  665: "The Primary result has been changed due to liveness detection code rule in Policy Management.",
  670: "The Remark code threshold rule in Profile Manager has been activated.",
  680: "The 'Publicly Exposed Document' field value indicates a publicly exposed document issue.",
  700: "The image size of the ID document is below the threshold.",
  720: "The document was rejected because it is not in the predefined White List.",
  730: "The document is in the predefined block list.",
  740: "The visual text confidence of the ID document is low, please consider recapturing the image.",
  750: "Instinct risk flag of repeating document data. When there is one or more repetition value that exceeds the threshold.",
  760: "Instinct risk flag of conflicting document data. When there is one or more conflicts.",
  770: "Instinct risk flag of repeating and conflicting document data. When there is one or more repetition value that exceeds the threshold and there is one or more conflicts.",
  780: "Proof of address: names compare do not match",
  820: "Calculated age is higher than risk threshold",
  830: "Calculated age is lower than risk threshold",
  840: "Selfie estimated age is higher than calculated age",
  850: "Selfie estimated age is lower than calculated age",
  860: "Primary photo was not detected on either side",
  870: "The unexpected image corners indicator has been activated",
  880: "The Mandatory 'Gender' field is missing.",
  890: "The OCR confidence of the 'Gender' field is low.",
  900: "The 'OptionalData' field is missing.",
  910: "The OCR confidence of the 'OptionalData' field is low.",
  920: "Instinct risk flag of Attack Info is activated for the SeenThatDocumentNumber category.",
  930: "Instinct risk flag of Attack Info is activated for the SeenThatFacePicture category.",
  940: "Instinct risk flag of Attack Info is activated for the SeenThatImageTemplate category.",
  950: "Instinct risk flag of Attack Info is activated for the SeenThatPerson category.",
  960: "The image was detected as Black and White ID and failed Profile Manager threshold.",
  970: "Proof of address name match rule has been activated.",
  980: "Proof of address match rule has been activated.",
  990: "Proof of address valid date rule has been activated.",
  1000: "Instinct customer reported risk flag match.",
  1010: "Instinct risk flag of publicly exposed matched documents.",
  1020: "Personal information comparison status for country is 'not match'.",
  1030: "Personal information comparison status for date of birth is 'not match'.",
  1040: "Personal information comparison status for date of expiry is 'not match'.",
  1050: "Personal information comparison status for date of issue is 'not match'.",
  1060: "Personal information comparison status for document number is 'not match'.",
  1070: "Personal information comparison status for full name is 'not match'.",
  1080: "Personal information comparison status for personal number is 'not match'.",
  1085: "Personal information comparison status for registry code is 'not match'.",
  1090: "Selfie's estimated age is higher than the risk threshold.",
  1100: "Selfie's estimated age is lower than the risk threshold.",
  1110: "Document replay has detected an unauthorized capture type.",
  1120: "Photo gender validation has failed.",
  1130: "Selfie gender validation has failed.",
  1140: "The image DPI is below the risk threshold.",
  1150: "The cropped image height is below the risk threshold.",
  1160: "The cropped image width is below the risk threshold.",
  1170: "The cropped image jpeg compression is below the risk threshold.",
  1180: "Instinct risk flag of attack info is activated for seen that back side.",
  1190: "Instinct risk flag of attack info is activated for seen that selfie.",
  1200: "Unauthorized country detected by reverse geocoding risk rule.",
  1210: "Primary result has been changed because liveness check failed or was not requested.",
  1220: "Instinct risk flag of attack info is activated for seen that email.",
  1230: "Instinct risk flag of attack info is activated for seen that IP.",
  1240: "Instinct risk flag of attack info is activated for seen that phone.",
  1250: "Instinct risk flag of attack info is activated for seen that profile.",
  1260: "Instinct risk flag of attack info is activated for seen that user name.",
  1270: "The jpeg compression of the ID document is below the threshold.",
  1280: "Chip existence check failed.",
  1290: "The number of repetitions within the special period detected by instinct exceeds the threshold.",
  1300: "Driver license type check failure.",
  1310: "Video verification mismatch.",
  1320: "The MRZ text confidence of the ID document is low, please consider recapturing the image..",
  1330: "Non Proof of address",
  1340: "Document incomplete",
  1350: "Mandatory Personal Number field is missing",
  1360: "Ocr confidence of the Personal Number field is low",
  1370: "PII verification did not yield a matching result",
  1380: "Personal information comparison status for birth place is 'not match'.",
  1390: "Personal information comparison status for mother name is 'not match'.",
  1400: "Personal information comparison status for alternate name is 'not match'.",
  1410: "Identified as Deepfake.",
  1420: "Primary result changed due to VisaType check failure.",
  1430: "More than one word in FullName ignored.",
  1440: "The Mandatory 'Full Name Local' field is missing.",
  1450: "The OCR confidence of the 'Full Name Local' field is low.",
  1460: "Personal information comparison status for nationality is 'not match'.",
  1470: "Instinct risk flag of attack info is activated for seen that selfie background",
  1480: "Injection detected in secure selfie capture",
  1490: "Instinct risk flag of attack info is activated for seen that signature"
};

// --- Path aliasing helpers -------------------------------------------------
// We expose a unified canonical path for Risk Management Remarks regardless of
// their real location/key in the source JSON. The underlying source may use:
//  - RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks
//  - RiskManagementReport.EffectiveConclusion.Reasons.RiskManagerRemarks (legacy)
//  - DocumentStatusReport2.RiskManagementRemarks / RiskManagerRemarks (legacy flat)
//  - Root-level RiskManagementRemarks / RiskManagerRemarks
// For UI tooltips we alias them to a canonical form using 'ProcessingResultRemarks'
// under the closest known parent (Reasons.* or DocumentStatusReport2.*) so that
// business users see a single consistent path.
function aliasRiskRemarkPath(originalPath) {
  if (!originalPath || typeof originalPath !== 'string') return originalPath;
  let alias = originalPath;
  // Reasons variant
  alias = alias.replace(/RiskManagementReport\.EffectiveConclusion\.Reasons\.(RiskManagementRemarks|RiskManagerRemarks)/, 'RiskManagementReport.EffectiveConclusion.Reasons.ProcessingResultRemarks');
  // DocumentStatusReport2 variant
  alias = alias.replace(/DocumentStatusReport2\.(RiskManagementRemarks|RiskManagerRemarks)/, 'DocumentStatusReport2.ProcessingResultRemarks');
  // Root-level variant
  alias = alias.replace(/(^|\.)RiskManagementRemarks(\[)/, '$1ProcessingResultRemarks$2');
  alias = alias.replace(/(^|\.)RiskManagerRemarks(\[)/, '$1ProcessingResultRemarks$2');
  return alias;
}

// Helper: Recursively find all objects with a given key in a JSON tree
const findAllByKey = (obj, key) => {
  let results = [];
  if (!obj || typeof obj !== 'object') return results;
  if (obj.hasOwnProperty(key)) results.push(obj[key]);
  for (const k in obj) {
    if (obj.hasOwnProperty(k) && typeof obj[k] === 'object' && obj[k] !== null) {
      results = results.concat(findAllByKey(obj[k], key));
    }
  }
  return results;
};

export const processJsonData = (data, options = {}) => {
  const { forceResultKey } = options;
  if (!data) {
    if (process.env.NODE_ENV !== 'production') console.warn('No data provided to processJsonData');
    return {
      error: 'No data provided',
      summary: {
        primaryResult: 'No data',
        completionStatus: 'No data',
        failureReason: null
      },
      remarks: {
        processing: [],
        riskManagement: []
      },
      metadata: {
        processedAt: new Date().toISOString(),
        dataType: 'null',
        isArray: false,
        size: 0
      },
      paths: {}
    };
  }

  try {
    // Helper function to check for remark 140 in all possible locations
    const hasRemark140 = (data) => {
      // Check in DocumentStatusReport2.ProcessingResultRemarks
      if (data.DocumentStatusReport2 && Array.isArray(data.DocumentStatusReport2.ProcessingResultRemarks)) {
        if (data.DocumentStatusReport2.ProcessingResultRemarks.includes(140)) return true; // No merit in checking in Policy manager
      }
      // Check in root-level ProcessingResultRemarks
      if (Array.isArray(data.ProcessingResultRemarks)) {
        if (data.ProcessingResultRemarks.includes(140)) return true;
      }
      // Check in PageAsSeparateDocumentProcessingReports
      if (Array.isArray(data.PageAsSeparateDocumentProcessingReports)) {
        for (const page of data.PageAsSeparateDocumentProcessingReports) {
          if (page.RiskManagementReport && page.RiskManagementReport.EffectiveConclusion && 
              page.RiskManagementReport.EffectiveConclusion.Reasons && 
              Array.isArray(page.RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks)) {
            if (page.RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks.includes(140)) return true;
          }
        }
      }
      return false;
    };

    // --- Workflow JSON support ---
    let resultData;
    let jsonType = 'Secure me';
    let extractionRootPath = '';
    let isWorkflow = false;
    if (
      data &&
      data.verificationResults &&
      data.verificationResults.idv &&
      data.verificationResults.idv.payload &&
      data.verificationResults.idv.payload.ProcessingReport
    ) {
      resultData = data.verificationResults.idv.payload.ProcessingReport;
      jsonType = 'Workflow';
      extractionRootPath = 'verificationResults.idv.payload.ProcessingReport';
      isWorkflow = true;
    } else if (forceResultKey && data[forceResultKey]) {
      resultData = data[forceResultKey];
      extractionRootPath = forceResultKey;
    } else if (data.resultData) {
      resultData = data.resultData;
      extractionRootPath = 'resultData';
    } else if (data.idvResultData) {
      resultData = data.idvResultData;
      extractionRootPath = 'idvResultData';
    } else {
      resultData = data;
      extractionRootPath = 'root';
    }

    // Compose output
    const processed = {
      summary: {
        primaryResult: null,
        completionStatus: null,
        failureReason: null
      },
      remarks: {
        processing: [],
        riskManagement: []
      },
      metadata: {
        processedAt: new Date().toISOString(),
        dataType: typeof data,
        isArray: Array.isArray(data),
        size: JSON.stringify(data).length,
        documentData2Fields: {},
        documentData2Paths: {},
        jsonType,
        extractionRootPath
      },
      paths: {}
    };

    // --- Workflow-specific extraction ---
    if (isWorkflow) {
      // 1. Extract documentdata2 only from root.sessionResult.identity
      if (data.sessionResult && data.sessionResult.identity && typeof data.sessionResult.identity === 'object') {
        for (const [key, value] of Object.entries(data.sessionResult.identity)) {
          processed.metadata.documentData2Fields[key] = value;
          processed.metadata.documentData2Paths[key] = 'sessionResult.identity.' + key;
        }
        processed.metadata.documentData2Source = 'sessionResult.identity';
      }
      // 2. Extract processingremarks only from root.verificationResults.idv.remarks
      if (
        data.verificationResults &&
        data.verificationResults.idv &&
        Array.isArray(data.verificationResults.idv.remarks)
      ) {
        processed.remarks.processing = data.verificationResults.idv.remarks.map((code, idx) => ({
          code: Number(code),
          message: PROCESSING_REMARKS[Number(code)] || `Unknown processing remark (${code})`,
          path: `verificationResults.idv.remarks[${idx}]`
        }));
      }
      // 3. Extract workflowId and present as 'Au10tix{num}'
      if (data.sessionResult && data.sessionResult.workflowId !== undefined && data.sessionResult.workflowId !== null) {
        const wf = data.sessionResult.workflowId;
        if (typeof wf === 'string' && /^Au10tix/i.test(wf)) {
          processed.metadata.workflowNumber = wf; // already prefixed
        } else {
          processed.metadata.workflowNumber = `Au10tix${wf}`;
        }
      }
      // Optionally, extract other fields as before (primaryResult, etc.)
      // Primary Result (from ProcessingReport)
      let primaryResult = null;
      let primaryResultPath = null;
      if (resultData.DocumentStatusReport2 && resultData.DocumentStatusReport2.PrimaryProcessingResult !== undefined) {
        primaryResult = resultData.DocumentStatusReport2.PrimaryProcessingResult;
        primaryResultPath = `${extractionRootPath}.DocumentStatusReport2.PrimaryProcessingResult`;
      } else if (resultData.PrimaryProcessingResult !== undefined) {
        primaryResult = resultData.PrimaryProcessingResult;
        primaryResultPath = `${extractionRootPath}.PrimaryProcessingResult`;
      }
      if (primaryResult !== null && primaryResult !== undefined) {
        if (typeof primaryResult === 'number' && PRIMARY_PROCESSING_RESULTS[primaryResult]) {
          processed.summary.primaryResult = `${primaryResult} - ${PRIMARY_PROCESSING_RESULTS[primaryResult]}`;
        } else {
          processed.summary.primaryResult = String(primaryResult);
        }
        processed.paths.primaryResult = primaryResultPath;
      }
      // Completion Status
      let completionStatus = findNestedValue(resultData, ['CompletionStatus', 'completionStatus']);
      if (!completionStatus && resultData.CompletionStatus !== undefined) {
        completionStatus = { value: resultData.CompletionStatus, path: 'CompletionStatus' };
      }
      if (completionStatus && completionStatus.value !== undefined && completionStatus.value !== null) {
        processed.summary.completionStatus = String(completionStatus.value);
        processed.paths.completionStatus = completionStatus.path;
      }
      // Failure Reason
      const failureReason = findNestedValue(resultData, ['FailureReason', 'failureReason']);
      if (failureReason && failureReason.value !== undefined && failureReason.value !== null) {
        processed.summary.failureReason = String(failureReason.value);
        processed.paths.failureReason = failureReason.path;
      }
      // Risk Management Remarks (keep as before)
      let riskRemarksList = [];
      let riskRemarksPaths = [];
      // Top-level (new structure)
      if (resultData.RiskManagementReport && resultData.RiskManagementReport.EffectiveConclusion) {
        const eff = resultData.RiskManagementReport.EffectiveConclusion;
        if (eff.Reasons) {
          if (Array.isArray(eff.Reasons.RiskManagementRemarks)) {
            riskRemarksList = riskRemarksList.concat(eff.Reasons.RiskManagementRemarks);
            riskRemarksPaths = riskRemarksPaths.concat(eff.Reasons.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks[${idx}]`));
          }
          if (Array.isArray(eff.Reasons.ProcessingResultRemarks)) {
            // processingRemarksList = processingRemarksList.concat(eff.Reasons.ProcessingResultRemarks); // This line is now handled by the workflow-specific extraction
            // processingRemarksPaths = processingRemarksPaths.concat(eff.Reasons.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.ProcessingResultRemarks[${idx}]`)); // This line is now handled by the workflow-specific extraction
          }
        }
      }
      // Pages (new structure)
      if (Array.isArray(resultData.PageAsSeparateDocumentProcessingReports)) {
        resultData.PageAsSeparateDocumentProcessingReports.forEach((page, pageIdx) => {
          if (page.RiskManagementReport && page.RiskManagementReport.EffectiveConclusion) {
            const eff = page.RiskManagementReport.EffectiveConclusion;
            if (eff.Reasons) {
              if (Array.isArray(eff.Reasons.RiskManagementRemarks)) {
                riskRemarksList = riskRemarksList.concat(eff.Reasons.RiskManagementRemarks);
                riskRemarksPaths = riskRemarksPaths.concat(eff.Reasons.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[${pageIdx}].RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks[${idx}]`));
              }
              if (Array.isArray(eff.Reasons.ProcessingResultRemarks)) {
                // processingRemarksList = processingRemarksList.concat(eff.Reasons.ProcessingResultRemarks); // This line is now handled by the workflow-specific extraction
                // processingRemarksPaths = processingRemarksPaths.concat(eff.Reasons.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[${pageIdx}].DocumentStatusReport2.ProcessingResultRemarks[${idx}]`)); // This line is now handled by the workflow-specific extraction
              }
            }
          }
        });
      }
      // Flat/legacy structure (root-level fields)
      if (Array.isArray(resultData.ProcessingResultRemarks)) {
        // processingRemarksList = processingRemarksList.concat(resultData.ProcessingResultRemarks); // This line is now handled by the workflow-specific extraction
        // processingRemarksPaths = processingRemarksPaths.concat(resultData.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.ProcessingResultRemarks[${idx}]`)); // This line is now handled by the workflow-specific extraction
      }
      if (Array.isArray(resultData.RiskManagerRemarks)) {
        riskRemarksList = riskRemarksList.concat(resultData.RiskManagerRemarks);
        riskRemarksPaths = riskRemarksPaths.concat(resultData.RiskManagerRemarks.map((_, idx) => `${extractionRootPath}.RiskManagerRemarks[${idx}]`));
      }
      if (Array.isArray(resultData.RiskManagementRemarks)) {
        riskRemarksList = riskRemarksList.concat(resultData.RiskManagementRemarks);
        riskRemarksPaths = riskRemarksPaths.concat(resultData.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.RiskManagementRemarks[${idx}]`));
      }
      // Also check under DocumentStatusReport2 (legacy)
      if (resultData.DocumentStatusReport2) {
        if (Array.isArray(resultData.DocumentStatusReport2.ProcessingResultRemarks)) {
          // processingRemarksList = processingRemarksList.concat(resultData.DocumentStatusReport2.ProcessingResultRemarks); // This line is now handled by the workflow-specific extraction
          // processingRemarksPaths = processingRemarksPaths.concat(resultData.DocumentStatusReport2.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.ProcessingResultRemarks[${idx}]`)); // This line is now handled by the workflow-specific extraction
        }
        if (Array.isArray(resultData.DocumentStatusReport2.RiskManagerRemarks)) {
          riskRemarksList = riskRemarksList.concat(resultData.DocumentStatusReport2.RiskManagerRemarks);
          riskRemarksPaths = riskRemarksPaths.concat(resultData.DocumentStatusReport2.RiskManagerRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.RiskManagerRemarks[${idx}]`));
        }
        if (Array.isArray(resultData.DocumentStatusReport2.RiskManagementRemarks)) {
          riskRemarksList = riskRemarksList.concat(resultData.DocumentStatusReport2.RiskManagementRemarks);
          riskRemarksPaths = riskRemarksPaths.concat(resultData.DocumentStatusReport2.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.RiskManagementRemarks[${idx}]`));
        }
      }

      // Deduplicate
      // processingRemarksList = [...new Set(processingRemarksList.map(Number))]; // This line is now handled by the workflow-specific extraction
      riskRemarksList = [...new Set(riskRemarksList.map(Number))];

      processed.remarks.riskManagement = riskRemarksList
        .filter(code => code !== null && code !== undefined)
        .map((code, idx) => ({
          code: Number(code),
          message: RISK_REMARKS[Number(code)] || `Unknown risk remark (${code})`,
          path: aliasRiskRemarkPath(riskRemarksPaths[idx] || 'RiskManagerRemarks'),
          originalPath: riskRemarksPaths[idx] || 'RiskManagerRemarks'
        }));

      processed.metadata = extractMetadata(resultData, processed.metadata);
      
      // Check if remark 140 is present - if so, don't return early to allow DocumentData2 extraction
      if (!hasRemark140(resultData)) {
        return processed;
      }
    }
    // --- End workflow-specific extraction ---

  // For Secure me: extract from DocumentStatusReport2 if present
  let processedDocTypeDesc = false;
  let processedRiskManagement = false; // when true, skip generic aggregation to avoid duplication
    if (resultData.DocumentStatusReport2) {
      const dsr2 = resultData.DocumentStatusReport2;
      // Primary Result
      if (dsr2.PrimaryProcessingResult !== undefined) {
        if (typeof dsr2.PrimaryProcessingResult === 'number' && PRIMARY_PROCESSING_RESULTS[dsr2.PrimaryProcessingResult]) {
          processed.summary.primaryResult = `${dsr2.PrimaryProcessingResult} - ${PRIMARY_PROCESSING_RESULTS[dsr2.PrimaryProcessingResult]}`;
        } else {
          processed.summary.primaryResult = String(dsr2.PrimaryProcessingResult);
        }
        processed.paths.primaryResult = extractionRootPath + '.DocumentStatusReport2.PrimaryProcessingResult';
      }
      // Prefer DocumentStatusReport2.PrimaryProcessingResult as the canonical source.
      // Only fall back to RiskManagementReport.EffectiveConclusion.PrimaryProcessingResult if DSR2 is not present.
      if (
        processed.paths.primaryResult == null &&
        resultData.RiskManagementReport &&
        resultData.RiskManagementReport.EffectiveConclusion &&
        resultData.RiskManagementReport.EffectiveConclusion.PrimaryProcessingResult !== undefined
      ) {
        const rmPrim = resultData.RiskManagementReport.EffectiveConclusion.PrimaryProcessingResult;
        if (typeof rmPrim === 'number' && PRIMARY_PROCESSING_RESULTS[rmPrim]) {
          processed.summary.primaryResult = `${rmPrim} - ${PRIMARY_PROCESSING_RESULTS[rmPrim]}`;
        } else {
          processed.summary.primaryResult = String(rmPrim);
        }
        processed.paths.primaryResult = extractionRootPath + '.RiskManagementReport.EffectiveConclusion.PrimaryProcessingResult';
      }
      // Processing Remarks
      let processingRemarks = [];
      if (Array.isArray(dsr2.ProcessingResultRemarks)) {
        processingRemarks = dsr2.ProcessingResultRemarks.map((code) => ({
          code: Number(code),
          message: PROCESSING_REMARKS[Number(code)] || `Unknown processing remark (${code})`,
          path: extractionRootPath + '.DocumentStatusReport2.ProcessingResultRemarks',
          category: getProcessingRemarkCategory(Number(code))
        }));
      }
      processed.remarks.processing = processingRemarks;
      // Risk Management Remarks authoritative Secure me source (only ProcessingResultRemarks under Reasons)
      if (
        resultData.RiskManagementReport &&
        resultData.RiskManagementReport.EffectiveConclusion &&
        resultData.RiskManagementReport.EffectiveConclusion.Reasons &&
        Array.isArray(resultData.RiskManagementReport.EffectiveConclusion.Reasons.ProcessingResultRemarks)
      ) {
        processed.remarks.riskManagement = resultData.RiskManagementReport.EffectiveConclusion.Reasons.ProcessingResultRemarks.map((code, idx) => ({
          code: Number(code),
          message: PROCESSING_REMARKS[Number(code)] || `Unknown processing remark (${code})`,
          path: `${extractionRootPath}.RiskManagementReport.EffectiveConclusion.Reasons.ProcessingResultRemarks[${idx}]`,
          originalPath: `${extractionRootPath}.RiskManagementReport.EffectiveConclusion.Reasons.ProcessingResultRemarks[${idx}]`,
          category: getRiskRemarkCategory(Number(code))
        }));
        processedRiskManagement = true;
      }
      // DocumentData2 extraction for Secure me
      if (resultData.ProcessingResult && resultData.ProcessingResult.DocumentData2) {
        const docData2 = resultData.ProcessingResult.DocumentData2;
        for (const [key, value] of Object.entries(docData2)) {
          if (value && typeof value === 'object' && 'Value' in value) {
            processed.metadata.documentData2Fields[key] = value.Value;
            processed.metadata.documentData2Paths[key] = extractionRootPath + `.ProcessingResult.DocumentData2.${key}`;
          } else if (value && typeof value === 'object' && 'RawData' in value && value.RawData && 'Value' in value.RawData) {
            processed.metadata.documentData2Fields[key] = value.RawData.Value;
            processed.metadata.documentData2Paths[key] = extractionRootPath + `.ProcessingResult.DocumentData2.${key}.RawData.Value`;
          } else if (value !== null && value !== undefined) {
            processed.metadata.documentData2Fields[key] = value;
            processed.metadata.documentData2Paths[key] = extractionRootPath + `.ProcessingResult.DocumentData2.${key}`;
          }
        }
        processed.metadata.documentData2Source = extractionRootPath + '.ProcessingResult.DocumentData2';
      }
      // DocumentTypeDescriptor extraction for Secure me
      if (resultData.ProcessingResult && resultData.ProcessingResult.DocumentTypeDescriptor) {
        const docTypeDesc = resultData.ProcessingResult.DocumentTypeDescriptor;
        if (docTypeDesc.CountryIso3) processed.metadata.documentTypeDescriptorCountryIso3 = docTypeDesc.CountryIso3;
        if (docTypeDesc.DocumentType) processed.metadata.documentTypeDescriptorType = docTypeDesc.DocumentType;
        if (docTypeDesc.DocumentVersion) processed.metadata.documentTypeDescriptorVersion = docTypeDesc.DocumentVersion;
        processedDocTypeDesc = true;
      }
      // RiskManagementReport extraction will be handled below if present
      // Return will be after the next block
    }
  // Removed redundant RiskManagementRemarks extraction; only ProcessingResultRemarks path is used.
    // Always extract DocumentTypeDescriptor for Secure me
    if (!processedDocTypeDesc && resultData.ProcessingResult && resultData.ProcessingResult.DocumentTypeDescriptor) {
      const docTypeDesc = resultData.ProcessingResult.DocumentTypeDescriptor;
      if (docTypeDesc.CountryIso3) processed.metadata.documentTypeDescriptorCountryIso3 = docTypeDesc.CountryIso3;
      if (docTypeDesc.DocumentType) processed.metadata.documentTypeDescriptorType = docTypeDesc.DocumentType;
      if (docTypeDesc.DocumentVersion) processed.metadata.documentTypeDescriptorVersion = docTypeDesc.DocumentVersion;
    }
    
    // If we handled Secure me, return processed
    // Check if remark 140 is present - if so, don't return early to allow DocumentData2 extraction
    // Early return if we have handled Secure me structure (DocumentStatusReport2 present, or risk management or doc type descriptor already processed)
    // and remark 140 ("The pages of the multi-page document do not match") is NOT present.
    // If remark 140 is present, we continue to allow DocumentData2 extraction from multiple pages.
        if ((resultData.DocumentStatusReport2 || processedRiskManagement || processedDocTypeDesc) && !hasRemark140(resultData)) {
          return processed;
        }

    // Only use remarks from the main node (resultData and its new structure locations)
    let riskRemarksList = [];
    let riskRemarksPaths = [];
    let processingRemarksList = [];
    let processingRemarksPaths = [];
    // Top-level (new structure)
    if (resultData.RiskManagementReport && resultData.RiskManagementReport.EffectiveConclusion) {
      const eff = resultData.RiskManagementReport.EffectiveConclusion;
      if (eff.Reasons) {
        if (Array.isArray(eff.Reasons.RiskManagementRemarks)) {
          riskRemarksList = riskRemarksList.concat(eff.Reasons.RiskManagementRemarks);
          riskRemarksPaths = riskRemarksPaths.concat(eff.Reasons.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks[${idx}]`));
        }
        if (Array.isArray(eff.Reasons.ProcessingResultRemarks)) {
          processingRemarksList = processingRemarksList.concat(eff.Reasons.ProcessingResultRemarks);
          processingRemarksPaths = processingRemarksPaths.concat(eff.Reasons.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.ProcessingResultRemarks[${idx}]`));
        }
      }
    }
    // Pages (new structure)
    if (Array.isArray(resultData.PageAsSeparateDocumentProcessingReports)) {
      resultData.PageAsSeparateDocumentProcessingReports.forEach((page, pageIdx) => {
        if (page.RiskManagementReport && page.RiskManagementReport.EffectiveConclusion) {
          const eff = page.RiskManagementReport.EffectiveConclusion;
          if (eff.Reasons) {
            if (Array.isArray(eff.Reasons.RiskManagementRemarks)) {
              riskRemarksList = riskRemarksList.concat(eff.Reasons.RiskManagementRemarks);
              riskRemarksPaths = riskRemarksPaths.concat(eff.Reasons.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[${pageIdx}].RiskManagementReport.EffectiveConclusion.Reasons.RiskManagementRemarks[${idx}]`));
            }
            if (Array.isArray(eff.Reasons.ProcessingResultRemarks)) {
              processingRemarksList = processingRemarksList.concat(eff.Reasons.ProcessingResultRemarks);
              processingRemarksPaths = processingRemarksPaths.concat(eff.Reasons.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[${pageIdx}].DocumentStatusReport2.ProcessingResultRemarks[${idx}]`));
            }
          }
        }
      });
    }
    // Flat/legacy structure (root-level fields)
    if (Array.isArray(resultData.ProcessingResultRemarks)) {
      processingRemarksList = processingRemarksList.concat(resultData.ProcessingResultRemarks);
      processingRemarksPaths = processingRemarksPaths.concat(resultData.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.ProcessingResultRemarks[${idx}]`));
    }
    if (Array.isArray(resultData.RiskManagerRemarks)) {
      riskRemarksList = riskRemarksList.concat(resultData.RiskManagerRemarks);
      riskRemarksPaths = riskRemarksPaths.concat(resultData.RiskManagerRemarks.map((_, idx) => `${extractionRootPath}.RiskManagerRemarks[${idx}]`));
    }
    if (Array.isArray(resultData.RiskManagementRemarks)) {
      riskRemarksList = riskRemarksList.concat(resultData.RiskManagementRemarks);
      riskRemarksPaths = riskRemarksPaths.concat(resultData.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.RiskManagementRemarks[${idx}]`));
    }
    // Also check under DocumentStatusReport2 (legacy)
    if (resultData.DocumentStatusReport2) {
      if (Array.isArray(resultData.DocumentStatusReport2.ProcessingResultRemarks)) {
        processingRemarksList = processingRemarksList.concat(resultData.DocumentStatusReport2.ProcessingResultRemarks);
        processingRemarksPaths = processingRemarksPaths.concat(resultData.DocumentStatusReport2.ProcessingResultRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.ProcessingResultRemarks[${idx}]`));
      }
      if (Array.isArray(resultData.DocumentStatusReport2.RiskManagerRemarks)) {
        riskRemarksList = riskRemarksList.concat(resultData.DocumentStatusReport2.RiskManagerRemarks);
        riskRemarksPaths = riskRemarksPaths.concat(resultData.DocumentStatusReport2.RiskManagerRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.RiskManagerRemarks[${idx}]`));
      }
      if (Array.isArray(resultData.DocumentStatusReport2.RiskManagementRemarks)) {
        riskRemarksList = riskRemarksList.concat(resultData.DocumentStatusReport2.RiskManagementRemarks);
        riskRemarksPaths = riskRemarksPaths.concat(resultData.DocumentStatusReport2.RiskManagementRemarks.map((_, idx) => `${extractionRootPath}.DocumentStatusReport2.RiskManagementRemarks[${idx}]`));
      }
    }

    // Deduplicate
    processingRemarksList = [...new Set(processingRemarksList.map(Number))];
    riskRemarksList = [...new Set(riskRemarksList.map(Number))];

    // Compose output
    // Primary Result
    let primaryResult = null;
    let primaryResultPath = null;
    if (resultData.DocumentStatusReport2 && resultData.DocumentStatusReport2.PrimaryProcessingResult !== undefined) {
      primaryResult = resultData.DocumentStatusReport2.PrimaryProcessingResult;
      primaryResultPath = `${extractionRootPath}.DocumentStatusReport2.PrimaryProcessingResult`;
    } else if (resultData.PrimaryProcessingResult !== undefined) {
      primaryResult = resultData.PrimaryProcessingResult;
      primaryResultPath = `${extractionRootPath}.PrimaryProcessingResult`;
    }
    if (primaryResult !== null && primaryResult !== undefined) {
      if (typeof primaryResult === 'number' && PRIMARY_PROCESSING_RESULTS[primaryResult]) {
        processed.summary.primaryResult = `${primaryResult} - ${PRIMARY_PROCESSING_RESULTS[primaryResult]}`;
      } else {
        processed.summary.primaryResult = String(primaryResult);
      }
      processed.paths.primaryResult = primaryResultPath;
    }

    // Completion Status
    let completionStatus = findNestedValue(resultData, ['CompletionStatus', 'CompletionStatus']);
    if (!completionStatus && resultData.CompletionStatus !== undefined) {
      completionStatus = { value: resultData.CompletionStatus, path: 'CompletionStatus' };
    }
    if (completionStatus && completionStatus.value !== undefined && completionStatus.value !== null) {
      processed.summary.completionStatus = String(completionStatus.value);
      processed.paths.completionStatus = completionStatus.path;
    }

    // Processing Remarks
    processed.remarks.processing = processingRemarksList
      .filter(code => code !== null && code !== undefined)
      .map((code, idx) => ({
        code: Number(code),
        message: PROCESSING_REMARKS[Number(code)] || `Unknown processing remark (${code})`,
        path: processingRemarksPaths[idx] || 'ProcessingResultRemarks',
        category: getProcessingRemarkCategory(Number(code))
      }));

    // Risk Management Remarks
    processed.remarks.riskManagement = riskRemarksList
      .filter(code => code !== null && code !== undefined)
      .map((code, idx) => ({
        code: Number(code),
        message: RISK_REMARKS[Number(code)] || `Unknown risk remark (${code})`,
  path: aliasRiskRemarkPath(riskRemarksPaths[idx] || 'RiskManagerRemarks'),
  originalPath: riskRemarksPaths[idx] || 'RiskManagerRemarks',
        category: getRiskRemarkCategory(Number(code))
      }));

    // Failure Reason
    const failureReason = findNestedValue(resultData, ['FailureReason', 'failureReason']);
    if (failureReason && failureReason.value !== undefined && failureReason.value !== null) {
      processed.summary.failureReason = String(failureReason.value);
      processed.paths.failureReason = failureReason.path;
    }

    // --- Robust DocumentData2 extraction logic ---
    // Try all plausible locations for DocumentData2
    let docData2 = null;
    let docData2Path = '';
    
    // If remark 140 is present and multi-page structure exists, use advanced logic
    if (hasRemark140(resultData) && Array.isArray(resultData.PageAsSeparateDocumentProcessingReports) && resultData.PageAsSeparateDocumentProcessingReports.length >= 2) {
      const pages = resultData.PageAsSeparateDocumentProcessingReports;
      const docData2_0 = pages[0]?.ProcessingResult?.DocumentData2 || {};
      const docData2_1 = pages[1]?.ProcessingResult?.DocumentData2 || {};
      const allKeys = Array.from(new Set([...Object.keys(docData2_0), ...Object.keys(docData2_1)]));
      for (const key of allKeys) {
        const v0 = docData2_0[key] && typeof docData2_0[key] === 'object' && 'Value' in docData2_0[key] ? docData2_0[key].Value :
          (docData2_0[key] && typeof docData2_0[key] === 'object' && 'RawData' in docData2_0[key] && docData2_0[key].RawData && 'Value' in docData2_0[key].RawData ? docData2_0[key].RawData.Value : docData2_0[key]);
        const v1 = docData2_1[key] && typeof docData2_1[key] === 'object' && 'Value' in docData2_1[key] ? docData2_1[key].Value :
          (docData2_1[key] && typeof docData2_1[key] === 'object' && 'RawData' in docData2_1[key] && docData2_1[key].RawData && 'Value' in docData2_1[key].RawData ? docData2_1[key].RawData.Value : docData2_1[key]);
        if (v0 !== undefined && v1 !== undefined) {
          if (v0 === v1) {
            processed.metadata.documentData2Fields[key] = v0;
            processed.metadata.documentData2Paths[key] = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[0/1].ProcessingResult.DocumentData2.${key}`;
            processed.metadata.documentData2Compare = processed.metadata.documentData2Compare || {};
            processed.metadata.documentData2Compare[key] = 'Same on both pages';
          } else {
            processed.metadata.documentData2Fields[`${key}_front`] = v0;
            processed.metadata.documentData2Paths[`${key}_front`] = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[0].ProcessingResult.DocumentData2.${key}`;
            processed.metadata.documentData2Fields[`${key}_back`] = v1;
            processed.metadata.documentData2Paths[`${key}_back`] = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[1].ProcessingResult.DocumentData2.${key}`;
            processed.metadata.documentData2Compare = processed.metadata.documentData2Compare || {};
            processed.metadata.documentData2Compare[`${key}_front`] = 'Front';
            processed.metadata.documentData2Compare[`${key}_back`] = 'Back';
          }
        } else if (v0 !== undefined) {
          processed.metadata.documentData2Fields[`${key}_front`] = v0;
          processed.metadata.documentData2Paths[`${key}_front`] = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[0].ProcessingResult.DocumentData2.${key}`;
          processed.metadata.documentData2Compare = processed.metadata.documentData2Compare || {};
          processed.metadata.documentData2Compare[`${key}_front`] = 'Front';
        } else if (v1 !== undefined) {
          processed.metadata.documentData2Fields[`${key}_back`] = v1;
          processed.metadata.documentData2Paths[`${key}_back`] = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[1].ProcessingResult.DocumentData2.${key}`;
          processed.metadata.documentData2Compare = processed.metadata.documentData2Compare || {};
          processed.metadata.documentData2Compare[`${key}_back`] = 'Back';
        }
        // Extract dataSource for front
        let dataSourceValueFront, dataSourcePathFront;
        if (docData2_0[key] && typeof docData2_0[key] === 'object' && 'dataSource' in docData2_0[key]) {
          dataSourceValueFront = docData2_0[key].dataSource;
          dataSourcePathFront = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[0].ProcessingResult.DocumentData2.${key}.dataSource`;
        } else if (docData2_0[key] && typeof docData2_0[key] === 'object' && 'RawData' in docData2_0[key] && docData2_0[key].RawData && 'dataSource' in docData2_0[key].RawData) {
          dataSourceValueFront = docData2_0[key].RawData.dataSource;
          dataSourcePathFront = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[0].ProcessingResult.DocumentData2.${key}.RawData.dataSource`;
        }
        if (dataSourceValueFront !== undefined) {
          processed.metadata.documentData2DataSource = processed.metadata.documentData2DataSource || {};
          processed.metadata.documentData2DataSource[`${key}_front`] = dataSourceValueFront;
          processed.metadata.documentData2DataSourcePaths = processed.metadata.documentData2DataSourcePaths || {};
          processed.metadata.documentData2DataSourcePaths[`${key}_front`] = dataSourcePathFront;
        }
        // Extract dataSource for back
        let dataSourceValueBack, dataSourcePathBack;
        if (docData2_1[key] && typeof docData2_1[key] === 'object' && 'dataSource' in docData2_1[key]) {
          dataSourceValueBack = docData2_1[key].dataSource;
          dataSourcePathBack = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[1].ProcessingResult.DocumentData2.${key}.dataSource`;
        } else if (docData2_1[key] && typeof docData2_1[key] === 'object' && 'RawData' in docData2_1[key] && docData2_1[key].RawData && 'dataSource' in docData2_1[key].RawData) {
          dataSourceValueBack = docData2_1[key].RawData.dataSource;
          dataSourcePathBack = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[1].ProcessingResult.DocumentData2.${key}.RawData.dataSource`;
        }
        if (dataSourceValueBack !== undefined) {
          processed.metadata.documentData2DataSource = processed.metadata.documentData2DataSource || {};
          processed.metadata.documentData2DataSource[`${key}_back`] = dataSourceValueBack;
          processed.metadata.documentData2DataSourcePaths = processed.metadata.documentData2DataSourcePaths || {};
          processed.metadata.documentData2DataSourcePaths[`${key}_back`] = dataSourcePathBack;
        }
        // If both v0 and v1 are defined and equal, also store dataSource for the base key
        if (v0 !== undefined && v1 !== undefined && v0 === v1) {
          if (dataSourceValueFront !== undefined) {
            processed.metadata.documentData2DataSource[key] = dataSourceValueFront;
            processed.metadata.documentData2DataSourcePaths[key] = dataSourcePathFront;
          }
        }
      }
      processed.metadata.documentData2Source = `${extractionRootPath}.PageAsSeparateDocumentProcessingReports[0/1].ProcessingResult.DocumentData2`;
    } else {
      // Try all plausible locations for DocumentData2
      if (resultData.ProcessingResult && resultData.ProcessingResult.DocumentData2) {
        docData2 = resultData.ProcessingResult.DocumentData2;
        docData2Path = `${extractionRootPath}.ProcessingResult.DocumentData2`;
      } else if (resultData.DocumentData2) {
        docData2 = resultData.DocumentData2;
        docData2Path = `${extractionRootPath}.DocumentData2`;
      } else if (data.DocumentData2) {
        docData2 = data.DocumentData2;
        docData2Path = 'DocumentData2';
      }
      if (docData2 && typeof docData2 === 'object') {
        for (const [key, value] of Object.entries(docData2)) {
          if (value && typeof value === 'object' && 'Value' in value) {
            processed.metadata.documentData2Fields[key] = value.Value;
            processed.metadata.documentData2Paths[key] = `${docData2Path}.${key}`;
          } else if (value && typeof value === 'object' && 'RawData' in value && value.RawData && 'Value' in value.RawData) {
            processed.metadata.documentData2Fields[key] = value.RawData.Value;
            processed.metadata.documentData2Paths[key] = `${docData2Path}.${key}.RawData.Value`;
          } else if (value !== null && value !== undefined) {
            processed.metadata.documentData2Fields[key] = value;
            processed.metadata.documentData2Paths[key] = `${docData2Path}.${key}`;
          }
          // Extract dataSource if present
          let dataSourceValue, dataSourcePath;
          if (value && typeof value === 'object' && 'dataSource' in value) {
            dataSourceValue = value.dataSource;
            dataSourcePath = `${docData2Path}.${key}.dataSource`;
          } else if (value && typeof value === 'object' && 'RawData' in value && value.RawData && 'dataSource' in value.RawData) {
            dataSourceValue = value.RawData.dataSource;
            dataSourcePath = `${docData2Path}.${key}.RawData.dataSource`;
          }
          if (dataSourceValue !== undefined) {
            processed.metadata.documentData2DataSource = processed.metadata.documentData2DataSource || {};
            processed.metadata.documentData2DataSource[key] = dataSourceValue;
            processed.metadata.documentData2DataSourcePaths = processed.metadata.documentData2DataSourcePaths || {};
            processed.metadata.documentData2DataSourcePaths[key] = dataSourcePath;
          }
        }
        processed.metadata.documentData2Source = docData2Path;
      }
    }

    // Enhanced metadata extraction (keep as fallback for extra fields)
    processed.metadata = extractMetadata(resultData, processed.metadata);

    return processed;
  } catch (error) {
  if (process.env.NODE_ENV !== 'production') console.error('Error processing JSON data:', error);
    return {
      error: error.message,
      summary: {
        primaryResult: 'Error processing data',
        completionStatus: 'Error processing data',
        failureReason: error.message
      },
      remarks: {
        processing: [],
        riskManagement: []
      },
      metadata: {
        processedAt: new Date().toISOString(),
        dataType: typeof data,
        isArray: Array.isArray(data),
        size: data ? JSON.stringify(data).length : 0
      },
      paths: {},
      originalData: data
    };
  }
};

// Enhanced metadata extraction function
const extractMetadata = (data, baseMetadata) => {
  const metadata = { ...baseMetadata };
  try {
    // Extract document type information
    const documentType = findNestedValue(data, ['DocumentType', 'documentType', 'Type']);
    if (documentType) {
      metadata.documentType = documentType.value;
    }
    // Extract country information
    const country = findNestedValue(data, ['Country', 'country', 'CountryCode']);
    if (country) {
      metadata.country = country.value;
    }
    // Extract request ID
    const requestId = findNestedValue(data, ['RequestId', 'requestId', 'ID']);
    if (requestId) {
      metadata.requestId = requestId.value;
    }
    // Extract processing date
    const processingDate = findNestedValue(data, ['ProcessingDate', 'processingDate', 'Date']);
    if (processingDate) {
      metadata.processingDate = processingDate.value;
    }
    // Extract document status
    const documentStatus = findNestedValue(data, ['DocumentStatus', 'documentStatus', 'Status']);
    if (documentStatus) {
      metadata.documentStatus = documentStatus.value;
    }
    // Remove confidence extraction
    // Extract DocumentTypeDescriptor fields
    let docTypeDesc = null;
    if (
      data &&
      data.ProcessingResult &&
      data.ProcessingResult.DocumentTypeDescriptor
    ) {
      docTypeDesc = data.ProcessingResult.DocumentTypeDescriptor;
    } else if (
      data &&
      data.verificationResults &&
      data.verificationResults.idv &&
      data.verificationResults.idv.payload &&
      data.verificationResults.idv.payload.ProcessingReport &&
      data.verificationResults.idv.payload.ProcessingReport.ProcessingResult &&
      data.verificationResults.idv.payload.ProcessingReport.ProcessingResult.DocumentTypeDescriptor
    ) {
      docTypeDesc = data.verificationResults.idv.payload.ProcessingReport.ProcessingResult.DocumentTypeDescriptor;
    }
    if (docTypeDesc) {
      if (docTypeDesc.CountryIso3) metadata.documentTypeDescriptorCountryIso3 = docTypeDesc.CountryIso3;
      if (docTypeDesc.DocumentType) metadata.documentTypeDescriptorType = docTypeDesc.DocumentType;
      if (docTypeDesc.DocumentVersion) metadata.documentTypeDescriptorVersion = docTypeDesc.DocumentVersion;
    }
    // Remove DocumentStatusReport2 metadata
    // Extract any other relevant metadata fields
    const additionalFields = ['Version', 'Source', 'Timestamp', 'CreatedAt', 'UpdatedAt'];
    additionalFields.forEach(field => {
      const value = findNestedValue(data, [field, field.toLowerCase()]);
      if (value) {
        metadata[field.toLowerCase()] = value.value;
      }
    });
  } catch (error) {
  if (process.env.NODE_ENV !== 'production') console.warn('Error extracting metadata:', error);
  }
  return metadata;
};

// Helper function to find nested values in the JSON structure
const findNestedValue = (obj, fieldNames, currentPath = '') => {
  if (!obj || typeof obj !== 'object') return null;

  try {
    for (const field of fieldNames) {
      if (obj[field] !== undefined) {
        return {
          value: obj[field],
          path: currentPath ? `${currentPath}.${field}` : field
        };
      }
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
        const result = findNestedValue(
          obj[key],
          fieldNames,
          currentPath ? `${currentPath}.${key}` : key
        );
        if (result) return result;
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.warn('Error in findNestedValue:', error);
    return null;
  }

  return null;
};

export { PROCESSING_REMARKS, RISK_REMARKS, PRIMARY_PROCESSING_RESULTS };
