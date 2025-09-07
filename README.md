# JSONreaderV2

JSONreaderV2 is a lightweight viewer for AU10TIX processing outputs. It parses SecureMe and Workflow JSON payloads, extracts key results (Primary Processing Result, Processing Remarks, Risk Management Remarks), and presents them with clear categorization and helpful metadata, including clickable JSON paths.

## Features

- File upload and API fetch flows for JSON input
- Primary Processing Result mapping and display
- Full Processing Remarks mapping with sensible categories
- Full Risk Management Remarks mapping with categories
- Interactive documentation page for all known codes
- Metadata extraction (document type, country, request id, etc.)
- JSON path tooltips for quick debugging

## Quick Start

Prerequisites: Node.js >= 16

1. Install dependencies:
   `npm install`

2. Build client bundle (optional for dev):
   `npm run build`

3. Start the server:
   `npm start`

4. Open the app:
   http://localhost:3000

Useful scripts:
- `npm run dev`: start server with nodemon
- `npm run client`: serve the `public` folder directly
- `npm run dev:full`: run server (nodemon) and static client concurrently
- `npm run watch`: webpack dev watch

Package entry points:
- Server: `server.js`
- Client entry: `src/index.js`

## Project Structure

- `src/App.js`: Root React app
- `src/components/ResultsDisplay.js`: Main results UI
- `src/components/DocumentationPage.js`: Interactive documentation
- `src/components/documentationCategories.js`: Single source of truth for categories and category helpers
- `src/logic/extractor.js`: Core extraction logic and code mappings
- `public/`: Static assets and built bundles
- `k.pdf`, `RiskManagement.pdf`: Source references for code descriptions

## How Categorization Works

- The code-to-text mappings live in `src/logic/extractor.js`:
  - Processing: `PROCESSING_REMARKS`
  - Risk: `RISK_REMARKS`
- Category definitions live in `src/components/documentationCategories.js`:
  - Processing: `PROCESSING_CATEGORIES` + `getProcessingRemarkCategory(code)`
  - Risk: `RISK_CATEGORIES` + `getRiskRemarkCategory(code)`
- The documentation page and results view both use these structures so there is one source of truth.

### Deprecated Codes

Some processing codes in the official references are marked as deprecated. These are kept in the runtime mapping for compatibility but intentionally excluded from the documentation categories so they don’t show up in the docs:

- Deprecated processing codes (excluded from docs): 1620, 1680, 1700

## Updating Code Mappings

1. Add or update code descriptions in `src/logic/extractor.js` under `PROCESSING_REMARKS` or `RISK_REMARKS`.
2. Add the new codes to the correct category in `src/components/documentationCategories.js`.
3. If a code is deprecated, keep it in the mapping (to show if present) but omit it from the documentation categories.
4. Rebuild if needed: `npm run build`.

## Data Sources Supported

- SecureMe JSON
- Workflow JSON (`verificationResults.idv.payload.ProcessingReport`)

The extractor will auto-detect and normalize paths, exposing user-friendly JSON path tooltips in the UI.

## Notes

- This app focuses on mapping and presentation. It does not perform any verification itself.
- Refer to `k.pdf` and `RiskManagement.pdf` for the official AU10TIX code references used.

