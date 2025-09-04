import React from 'react';
import { PROCESSING_CATEGORIES, RISK_CATEGORIES, getRiskRemarkCategory } from './documentationCategories.js';
import { PROCESSING_REMARKS, RISK_REMARKS, PRIMARY_PROCESSING_RESULTS } from '../logic/extractor.js';

const DocumentationPage = ({ onBack, onBackToMain }) => {
  // Use statically imported mappings (no globals)
  const processingRemarks = PROCESSING_REMARKS || {};
  const riskRemarks = RISK_REMARKS || {};
  const primaryProcessingResults = PRIMARY_PROCESSING_RESULTS || {};

  const categories = PROCESSING_CATEGORIES;

  const handleBack = () => {
    if (onBack && typeof onBack === 'function') {
      onBack();
    }
  };

  const getRemarkDescription = (code, remarksMap) => {
    try {
      return remarksMap[code] || `Unknown remark code: ${code}`;
    } catch (error) {
  if (process.env.NODE_ENV !== 'production') console.warn('Error getting remark description:', error);
      return `Error retrieving description for code: ${code}`;
    }
  };

  return (
    <div className="documentation-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Documentation</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => onBackToMain && onBackToMain()}>
            <i className="bi bi-house"></i> Back to Main Page
          </button>
          {onBack && (
            <button className="btn btn-outline-primary" onClick={handleBack}>
              <i className="bi bi-arrow-left"></i> Back to Results
            </button>
          )}
        </div>
      </div>

      <div className="alert alert-info" role="alert">
        <h5 className="alert-heading">Updated Documentation</h5>
        <p className="mb-0">
          This documentation has been updated with the complete list of DocumentStatusReport2 codes 
          from the official AU10TIX BOS Service References, including both ProcessingResultRemarks and PrimaryProcessingResult.
        </p>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              <h3 className="h5 mb-0">Primary Processing Results</h3>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                DocumentStatusReport2.PrimaryProcessingResult codes and their meanings
              </p>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(primaryProcessingResults).map(([code, description]) => (
                      <tr key={code}>
                        <td><span className="badge bg-warning text-dark">{code}</span></td>
                        <td>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">Processing Remarks (DocumentStatusReport2)</h3>
            </div>
            <div className="card-body">
              {Object.entries(categories).map(([category, info]) => (
                <div key={category} className="mb-4">
                  <h4 className="h6 text-primary">{category}</h4>
                  <p className="text-muted small">{info.description}</p>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {info.codes.map(code => (
                          <tr key={code}>
                            <td><span className="badge bg-secondary">{code}</span></td>
                            <td>{getRemarkDescription(code, processingRemarks)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="h5 mb-0">Risk Management Remarks</h3>
            </div>
            <div className="card-body">
              {RISK_CATEGORIES.map(category => (
                <div key={category.name} className="mb-4">
                  <h4 className="h6 text-success">{category.name}</h4>
                  <p className="text-muted small">{category.description}</p>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.codes
                          .filter(code => riskRemarks[code] !== undefined)
                          .sort((a, b) => a - b)
                          .map(code => (
                            <tr key={code}>
                              <td><span className="badge bg-secondary">{code}</span></td>
                              <td>{getRemarkDescription(code, riskRemarks)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage; 
