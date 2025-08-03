# JSON Data Extractor (JSON Reader)

## Overview

**JSON Data Extractor** (also called "JSON Reader") is a web application for uploading, processing, and analyzing JSON files containing document processing results, or for fetching such data from an API using an access token and request ID.

## Main Features

- **File Upload**: Upload a JSON file with document processing results. The app parses and displays key fields in a user-friendly format.
- **API Request**: Enter an access token and request ID to fetch document processing results from an external API. The app validates the token, determines the endpoint, and retrieves the data.
- **Data Extraction & Display**: Extracts and categorizes primary results, processing remarks, risk management remarks, and metadata. Displays results with tooltips and documentation for remark codes.
- **Field Selection**: After parsing, users can select which fields to display from the extracted data.
- **Documentation**: Provides detailed documentation for processing and risk management remark codes, now grouped by category for easier navigation.
- **Workflow JSON Support**: Automatically detects and extracts from Workflow JSONs (path: verificationResults.idv.payload.ProcessingReport) as well as Secure me JSONs.
- **JSON Type Display**: The app automatically detects and displays the type of JSON (Workflow or Secure me) in the Metadata section for every upload or API call.

## Technical Overview

- **Frontend**: React, Bootstrap, and custom CSS for a modern, responsive UI.
- **Backend**: Node.js with Express serves the frontend and provides API endpoints for file processing and API proxying.
- **Token & Endpoint Utilities**: Parses JWT tokens, determines API type/region/environment, and constructs API endpoints.
- **Data Processing Logic**: 
  - Robust extraction logic for all fields (summary, remarks, metadata) from both flat and nested JSON structures (root, DocumentStatusReport2, resultData, ProcessingResult, etc.).
  - Aggregates and deduplicates remarks from all plausible locations.
  - Advanced DocumentData2 comparison logic for remark 140 (split-page), with fallback to simpler extraction if not present.
  - Compatible with both legacy and new JSONs.
  - JSON paths and sources for all extracted fields are displayed in the UI for transparency.

## Typical Use Cases

- View and analyze document verification results exported as JSON.
- Fetch and review document processing results from a remote API using secure tokens.
- Understand the meaning of processing and risk management codes from document verification systems.

## Example Workflow

1. Upload a JSON file or enter an access token and request ID.
2. The app parses and processes the data, extracting key results and remarks from all possible locations.
3. Select which fields to display and view documentation for any remark codes.
4. Results and metadata are presented in a clear, categorized format, with JSON paths and sources shown for each field.

---

## Recent Changes & Bug Fixes

- **Robust Extraction Logic:**
  - Now supports both flat and nested JSON structures for all fields (summary, remarks, metadata).
  - Aggregates and deduplicates remarks from all plausible locations (root, nested, DocumentStatusReport2, etc.).
  - Advanced DocumentData2 comparison logic for remark 140 (split-page), with fallback to simpler extraction if not present.
  - Improved compatibility with legacy and new JSONs.
- **UI Improvements:**
  - JSON paths and sources are now displayed for all extracted fields, making it clear where each value was found.
  - Risk Management Remarks documentation is now grouped by category for easier navigation and completeness.
- **Error Handling:**
  - Improved error handling and fallback logic for missing or malformed data.
  - More descriptive error messages and user feedback.
- **Testing:**
  - All main flows tested for null/undefined, empty, valid, and malformed data.
  - Consistent results for both file upload and API flows.
- **Workflow JSON Support:**
  - The app now detects and fully supports Workflow JSONs, extracting data from verificationResults.idv.payload.ProcessingReport and processing it identically to Secure me JSONs.
- **JSON Type Display:**
  - The type of JSON (Workflow or Secure me) is now automatically detected and shown in the Metadata section of the results, for both file uploads and API calls.

---

For more details on any part of the project, see the source files or ask for a specific breakdown.
