import React, { useState } from 'react';
import { getProcessingRemarkCategory, RISK_CATEGORIES, getRiskRemarkCategory } from './documentationCategories.js';

const InfoTooltip = React.memo(({ path, additionalInfo, category }) => (
  <span 
    className="ms-2" 
    data-bs-toggle="tooltip" 
    data-bs-placement="top" 
    title={`JSON Path: ${path || 'N/A'}${additionalInfo ? `\n\n${additionalInfo}` : ''}${category ? `\n\nCategory: ${category}` : ''}`}
  >
    <i className="bi bi-info-circle"></i>
  </span>
));

const ResultCard = React.memo(({ title, value, path, className = '', additionalInfo = '', category = '' }) => (
  <div className={`card mb-3 ${className}`}>
    <div className="card-body">
      <h5 className="card-title d-flex align-items-center">
        {title || 'Unknown Field'}
        {path && <InfoTooltip path={path} additionalInfo={additionalInfo} category={category} />}
      </h5>
      <p className="card-text">{value || 'No value available'}</p>
    </div>
  </div>
));

const RemarksList = ({ remarks, title, type, category, onShowDocumentation }) => {
  const [openCategories, setOpenCategories] = useState({});

  const getRemarkCategory = (code) => {
    if (!code && code !== 0) return 'Other';
    if (type === 'risk') {
      return getRiskRemarkCategory(code);
    }
    if (type === 'processing') {
      return getProcessingRemarkCategory(code);
    } else {
      if (code <= 20) return 'Face Comparison';
      if (code <= 60) return 'Document Quality';
      if (code <= 200) return 'Missing Fields';
      if (code <= 460) return 'Field Issues';
      if (code <= 680) return 'OCR Confidence';
      return 'Other';
    }
  };

  if (!remarks || !Array.isArray(remarks)) {
    return (
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">{title || 'Remarks'}</h5>
          <p className="text-muted">No remarks data available</p>
        </div>
      </div>
    );
  }

  const categorizedRemarks = remarks.reduce((acc, remark) => {
    if (!remark || typeof remark.code === 'undefined') return acc;
    
    const category = getRemarkCategory(remark.code);
    if (!acc[category]) acc[category] = [];
    acc[category].push(remark);
    return acc;
  }, {});

  const handleShowDocumentation = () => {
    if (onShowDocumentation && type) {
      onShowDocumentation(type);
    }
  };

  const handleToggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleOpenAll = () => {
    const allOpen = {};
    Object.keys(categorizedRemarks).forEach((cat) => { allOpen[cat] = true; });
    setOpenCategories(allOpen);
  };

  const handleCloseAll = () => {
    setOpenCategories({});
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0 }}>
            <h5 className="card-title d-flex align-items-center mb-0" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title || 'Remarks'}
              {/* Add InfoTooltip next to the title for both types */}
              {type === 'processing' && remarks[0]?.path && (
                (() => {
                  const firstPath = remarks[0].path || '';
                  const arrayPath = firstPath.replace(/\[\d+\]$/, '');
                  return <InfoTooltip path={arrayPath} additionalInfo={arrayPath ? 'Array location' : ''} />;
                })()
              )}
              {type === 'risk' && remarks[0]?.path && (
                (() => {
                  const firstPath = remarks[0].path || '';
                  const arrayPath = firstPath.replace(/\[\d+\]$/, '');
                  return <InfoTooltip path={arrayPath} additionalInfo={arrayPath ? 'Array location' : ''} />;
                })()
              )}
            </h5>
          </div>
          <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
            <button className="btn btn-sm btn-outline-secondary me-1" onClick={handleOpenAll} type="button">
              <i className="bi bi-arrows-angle-expand"></i> Open all
            </button>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleCloseAll} type="button">
              <i className="bi bi-arrows-angle-contract"></i> Close all
            </button>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={handleShowDocumentation}
            >
              <i className="bi bi-book"></i> View Documentation
            </button>
          </div>
        </div>
        {remarks.length > 0 && (
          <div className="mb-2">
            {/* Remove InfoTooltip from here, now shown next to the title */}
          </div>
        )}
        {remarks.length > 0 ? (
          <div className="accordion" id={`${type}Accordion`}>
            {Object.entries(categorizedRemarks).map(([category, categoryRemarks], index) => {
              const isOpen = !!openCategories[category];
              return (
                <div key={category} className="accordion-item">
                  <h2 className="accordion-header" id={`${type}Heading${index}`}> 
                    <button
                      className={`accordion-button${isOpen ? '' : ' collapsed'}`}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${type}Collapse${index}`}
                      onClick={() => handleToggleCategory(category)}
                    >
                      {category} ({categoryRemarks.length})
                    </button>
                  </h2>
                  <div
                    id={`${type}Collapse${index}`}
                    className={`accordion-collapse collapse${isOpen ? ' show' : ''}`}
                    aria-labelledby={`${type}Heading${index}`}
                    data-bs-parent={null}
                  >
                    <div className="accordion-body p-0">
                      <ul className="list-group list-group-flush">
                        {categoryRemarks.map((remark, idx) => (
                          <li key={idx} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>
                                {remark.message || `Remark ${remark.code}`}
                                {remark.path && (
                                  type === 'risk'
                                    ? <InfoTooltip path={remark.path.replace(/\[\d+\]$/, '')} />
                                    : <InfoTooltip path={remark.path} additionalInfo={remark.path.match(/\[\d+\]$/) ? 'Array location' : ''} />
                                )}
                              </span>
                              <span className="badge bg-secondary">{remark.code}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted">No {type} remarks found</p>
        )}
      </div>
    </div>
  );
};

const ResultsDisplay = ({ data, onShowDocumentation }) => {
  if (!data || typeof data !== 'object' || !data.summary) {
    return (
      <div className="alert alert-danger" role="alert">
        Invalid or incomplete data format received
      </div>
    );
  }

  // Safely extract data with fallbacks
  const primaryResult = data.summary?.primaryResult || 'No primary result available';
  const completionStatus = data.summary?.completionStatus || 'No completion status available';
  const failureReason = data.summary?.failureReason;
  const processingRemarks = data.remarks?.processing || [];
  const riskManagementRemarks = data.remarks?.riskManagement || [];
  const metadata = data.metadata || {};
  const paths = data.paths || {};
  const jsonType = metadata.jsonType || '';

  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'inconclusive':
        return 'warning';
      case 'incomplete':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusInfo = (status) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'passed':
        return 'Document passed all verification checks';
      case 'failed':
        return 'Document failed one or more verification checks';
      case 'inconclusive':
        return 'Verification results are inconclusive';
      case 'incomplete':
        return 'Verification process was not completed';
      default:
        return '';
    }
  };

  const handleShowDocumentation = (type) => {
    if (onShowDocumentation && type) {
      onShowDocumentation(type);
    }
  };

  // Enhanced metadata display
  const renderMetadata = () => {
    const metadataFields = [];
    // Basic metadata
    if (metadata.processedAt) {
      metadataFields.push(
        <p key="processedAt"><strong>Processed At:</strong> {new Date(metadata.processedAt).toLocaleString()}</p>
      );
    }
    if (metadata.jsonType) {
      metadataFields.push(
        <p key="jsonType"><strong>JSON Type:</strong> {metadata.jsonType}</p>
      );
    }
    // Document-specific metadata
    // Only show Document Type once if both are present and equal
    const docType = metadata.documentType;
    const docTypeDesc = metadata.documentTypeDescriptorType;
    if (docType && docTypeDesc) {
      if (docType === docTypeDesc) {
        metadataFields.push(
          <p key="documentType"><strong>Document Type:</strong> {docType}</p>
        );
      } else {
        metadataFields.push(
          <p key="documentType"><strong>Document Type:</strong> {docType}</p>,
          <p key="docTypeDescType"><strong>Document Type (Descriptor):</strong> {docTypeDesc}</p>
        );
      }
    } else if (docType) {
      metadataFields.push(
        <p key="documentType"><strong>Document Type:</strong> {docType}</p>
      );
    } else if (docTypeDesc) {
      metadataFields.push(
        <p key="docTypeDescType"><strong>Document Type:</strong> {docTypeDesc}</p>
      );
    }
    if (metadata.country) {
      metadataFields.push(
        <p key="country"><strong>Country:</strong> {metadata.country}</p>
      );
    }
    if (metadata.requestId) {
      metadataFields.push(
        <p key="requestId"><strong>Request ID:</strong> {metadata.requestId}</p>
      );
    }
    if (metadata.processingDate) {
      metadataFields.push(
        <p key="processingDate"><strong>Processing Date:</strong> {metadata.processingDate}</p>
      );
    }
    if (metadata.documentStatus) {
      metadataFields.push(
        <p key="documentStatus"><strong>Document Status:</strong> {metadata.documentStatus}</p>
      );
    }
    // Add DocumentTypeDescriptor fields
    if (metadata.documentTypeDescriptorCountryIso3) {
      metadataFields.push(
        <p key="docTypeDescCountryIso3"><strong>Document Country (ISO3):</strong> {metadata.documentTypeDescriptorCountryIso3}</p>
      );
    }
    if (metadata.documentTypeDescriptorVersion) {
      metadataFields.push(
        <p key="docTypeDescVersion"><strong>Document Version:</strong> {metadata.documentTypeDescriptorVersion}</p>
      );
    }
    // DocumentData2 fields table (unchanged)
    if (metadata.documentData2Fields && Object.keys(metadata.documentData2Fields).length > 0) {
      const renderExtendedData = (extendedData, parentKey = '', parentPath = '') => {
        if (!extendedData || typeof extendedData !== 'object') return [];
        return Object.entries(extendedData).flatMap(([k, v]) => {
          const keyName = parentKey === 'ExtendedData' ? k : (parentKey ? `${parentKey}.${k}` : k);
          const pathName = parentPath ? `${parentPath}.${k}` : k;
          if (v === null || v === undefined) return [];
          if (typeof v === 'object' && !Array.isArray(v)) {
            if ('Value' in v) {
              return [[keyName, v.Value, pathName]];
            } else if ('RawData' in v && v.RawData && 'Value' in v.RawData) {
              return [[keyName, v.RawData.Value, `${pathName}.RawData.Value`]];
            } else {
              return renderExtendedData(v, keyName, pathName);
            }
          } else if (Array.isArray(v)) {
            if (v.length === 0) return [];
            return [[keyName, JSON.stringify(v), pathName]];
          } else {
            return [[keyName, v, pathName]];
          }
        });
      };
      const docData2Rows = Object.entries(metadata.documentData2Fields)
        .filter(([k, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, v, metadata.documentData2Paths && metadata.documentData2Paths[k]]);
      let extendedRows = [];
      if (metadata.documentData2Fields.ExtendedData) {
        extendedRows = renderExtendedData(
          metadata.documentData2Fields.ExtendedData,
          'ExtendedData',
          metadata.documentData2Paths && metadata.documentData2Paths['ExtendedData'] ? metadata.documentData2Paths['ExtendedData'] : 'ExtendedData'
        );
      }
      const allRows = [...docData2Rows.filter(([k]) => k !== 'ExtendedData'), ...extendedRows];
      metadataFields.push(
        <div key="docdata2" className="mt-3">
          <h6 className="text-primary">Extracted Document Data (DocumentData2)</h6>
          {metadata.documentData2Source && (
            <p className="text-muted small mb-2">Source: <code>{metadata.documentData2Source}</code></p>
          )}
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle text-nowrap" style={{ fontSize: '0.92em', tableLayout: 'auto', width: '100%' }}>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                  <th>JSON Path</th>
                  <th>Data Source</th>
                  <th>Data Source Path</th>
                  <th>Info</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map(([k, v, path]) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{v !== null && v !== undefined ? String(v) : ''}</td>
                    <td><code>{path || (metadata.documentData2Paths && metadata.documentData2Paths[k])}</code></td>
                    <td>{metadata.documentData2DataSource && metadata.documentData2DataSource[k] !== undefined ? dataSourceMap[metadata.documentData2DataSource[k]] || metadata.documentData2DataSource[k] : ''}</td>
                    <td><code>{metadata.documentData2DataSourcePaths && metadata.documentData2DataSourcePaths[k]}</code></td>
                    <td>{(metadata.documentData2Compare && metadata.documentData2Compare[k]) ? metadata.documentData2Compare[k] : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Additional metadata fields
    ['version', 'source', 'timestamp', 'createdat', 'updatedat'].forEach(field => {
      if (metadata[field]) {
        metadataFields.push(
          <p key={field}><strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {metadata[field]}</p>
        );
      }
    });

    return metadataFields.length > 0 ? metadataFields : <p className="text-muted">No metadata available</p>;
  };

  return (
    <div className="results-display">
      {/* Documentation Button */}
      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => onShowDocumentation ? onShowDocumentation('processing') : null}
          title="View Documentation"
        >
          <i className="bi bi-book me-1"></i> Documentation
        </button>
      </div>
      {/* JSON Type and Workflow Number near Summary */}
      {(jsonType || metadata.workflowNumber) && (
        <div className="mb-2">
          <span className="badge bg-info text-dark">
            {jsonType ? `JSON Type: ${jsonType}` : ''}
            {jsonType && metadata.workflowNumber ? ' ' : ''}
            {/* Only show the numeric part of workflowNumber if it starts with 'Au10tix' */}
            {metadata.workflowNumber ? `(${metadata.workflowNumber.replace(/^Au10tix/, '')})` : ''}
          </span>
        </div>
      )}
      {/* Summary Section */}
      <div className="summary-section mb-4">
        <h3>Summary</h3>
        <div className="row">
          <div className="col-md-6">
            <ResultCard
              title="Primary Result"
              value={primaryResult}
              path={paths.primaryResult}
              className={`border-${getStatusColor(primaryResult)}`}
              additionalInfo={getStatusInfo(primaryResult)}
            />
          </div>
          <div className="col-md-6">
            <ResultCard
              title="Completion Status"
              value={completionStatus}
              path={paths.completionStatus}
            />
          </div>
        </div>
        {failureReason && (
          <ResultCard
            title="Failure Reason"
            value={failureReason}
            path={paths.failureReason}
            className="border-danger"
          />
        )}
      </div>

      {/* Remarks Section */}
      <div className="remarks-section">
        <h3>Remarks</h3>
        <div className="row">
          <div className="col-md-6">
            <RemarksList
              remarks={processingRemarks}
              title="Processing Remarks"
              type="processing"
              onShowDocumentation={handleShowDocumentation}
            />
          </div>
          <div className="col-md-6">
            <RemarksList
              remarks={riskManagementRemarks}
              title="Risk Management Remarks"
              type="risk"
              onShowDocumentation={handleShowDocumentation}
            />
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="metadata-section mt-4">
        <h3>Metadata</h3>
        <div className="card">
          <div className="card-body">
            {renderMetadata()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;