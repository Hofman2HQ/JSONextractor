// Global React components
const { useState } = React;

// Endpoint utilities
const PRD_URLS = [
  "https://weu-api.au10tixservices.com",
  "https://eus-api.au10tixservices.com",
  "https://ejp-api.au10tixservices.com",
  "https://wus-api.au10tixservices.com"
];

const STG_URLS = [
  "https://weu-api.au10tixservicesstaging.com",
  "https://eus-api.au10tixservicesstaging.com"
];

const BOS_URLS = [
  "https://bos-weu.au10tixservices.com",
  "https://bos-eus.au10tixservices.com",
  "https://bos-ejp.au10tixservices.com",
  "https://bos-wus.au10tixservices.com",
  "https://bos-weu.au10tixservicesstaging.com",
  "https://bos-eus.au10tixservicesstaging.com"
];

const DATA_SOURCE_MAP = {
  "0": "Visual Inspection",
  "1": "MRZ Reading",
  "2": "Barcode Reading"
};

// Shared utility functions
const formatFieldName = (field) => {
  // Handle special cases first
  if (field === 'DateOfBirth') return 'Date of Birth';
  if (field === 'FirstName') return 'First Name';
  if (field === 'LastName') return 'Last Name';
  if (field === 'MiddleName') return 'Middle Name';
  if (field === 'DocumentNumber') return 'Document Number';
  if (field === 'DocumentType') return 'Document Type';
  if (field === 'ExpiryDate') return 'Expiry Date';
  if (field === 'IssueDate') return 'Issue Date';
  if (field === 'Nationality') return 'Nationality';
  if (field === 'PlaceOfBirth') return 'Place of Birth';
  if (field === 'Sex') return 'Gender';
  if (field === 'PersonalNumber') return 'Personal Number';
  if (field === 'DocumentClass') return 'Document Class';
  if (field === 'DocumentSubclass') return 'Document Subclass';
  if (field === 'DocumentSeries') return 'Document Series';
  if (field === 'DocumentIssuingCountry') return 'Issuing Country';
  if (field === 'DocumentIssuingAuthority') return 'Issuing Authority';
  if (field === 'DocumentIssuingDate') return 'Issuing Date';
  if (field === 'DocumentExpiryDate') return 'Expiry Date';

  // Handle ExtendedData fields
  if (field.startsWith('ExtendedData.')) {
    const subField = field.replace('ExtendedData.', '');
    return 'Additional ' + formatFieldName(subField);
  }

  // General case: split by capital letters and join with spaces
  return field
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
};

const getDataSourceDisplay = (dataSource) => {
  // Handle null/undefined
  if (dataSource === null || dataSource === undefined) return 'Unknown Source';
  
  // Convert to string if it's a number
  const sourceKey = String(dataSource);
  
  // Return mapped value or fallback
  return DATA_SOURCE_MAP[sourceKey] || 'Unknown Source';
};

const parseDocumentData = (documentData) => {
  const results = [];
  if (!documentData) return results;

  // Process main DocumentData2 fields
  Object.entries(documentData).forEach(([key, value]) => {
    if (value && value.Value !== null && value.Value !== undefined) {
      results.push({
        field: formatFieldName(key),
        originalField: key,
        value: value.Value,
        dataSource: getDataSourceDisplay(value.DataSource)
      });
    }
  });

  // Process ExtendedData if it exists
  if (documentData.ExtendedData) {
    Object.entries(documentData.ExtendedData).forEach(([key, value]) => {
      if (value && value.Value !== null && value.Value !== undefined) {
        results.push({
          field: formatFieldName('ExtendedData.' + key),
          originalField: 'ExtendedData.' + key,
          value: value.Value,
          dataSource: getDataSourceDisplay(value.DataSource)
        });
      }
    });
  }

  return results;
};

const compareAndMergeResults = (results1, results2) => {
  const mergedResults = [];
  const processedFields = new Set();

  // Helper function to find matching result
  const findMatchingResult = (results, field) => {
    return results.find(r => r.originalField === field);
  };

  // Process all results
  [...results1, ...results2].forEach(result => {
    if (processedFields.has(result.originalField)) return;

    const result1 = findMatchingResult(results1, result.originalField);
    const result2 = findMatchingResult(results2, result.originalField);

    if (result1 && result2) {
      // Same field found in both pages
      if (result1.value === result2.value) {
        mergedResults.push({
          ...result1,
          comment: 'Extracted from both pages'
        });
      } else {
        // Different values, show both with their respective sources
        mergedResults.push({
          ...result1,
          comment: 'Extracted from Front side'
        });
        mergedResults.push({
          ...result2,
          comment: 'Extracted from Back side'
        });
      }
    } else {
      // Field only in one page
      if (result1) {
        mergedResults.push({
          ...result1,
          comment: 'Extracted from Front side'
        });
      } else if (result2) {
        mergedResults.push({
          ...result2,
          comment: 'Extracted from Back side'
        });
      }
    }

    processedFields.add(result.originalField);
  });

  return mergedResults;
};

const parseResponseData = (data) => {
  if (!data) return null;

  // Determine the type of response and get the base object
  let baseData = null;
  let isWorkflow = false;

  // Check if this is a workflow response
  if (data.verificationResults?.idv) {
    isWorkflow = true;
    baseData = data.verificationResults.idv;
  }
  // Check if this is a BOS response
  else if (!data.resultData && (data.ProcessingResult || data.PageAsSeparateDocumentProcessingReports)) {
    baseData = data;
  }
  // Check if this is a regular response
  else if (data.resultData) {
    baseData = data.resultData;
  }

  if (!baseData) return null;

  // Check for remark 140 in the appropriate location
  const hasRemark140 = isWorkflow 
    ? baseData.remarks?.includes(140)
    : baseData.DocumentStatusReport2?.ProcessingResultRemarks?.some(remark => remark === 140);

  if (hasRemark140) {
    // Scenario 2: Uncoupled Front and Back
    const frontPageResults = parseDocumentData(
      isWorkflow
        ? baseData.payload?.ProcessingReport?.PageAsSeparateDocumentProcessingReports?.[0]?.ProcessingResult?.DocumentData2
        : baseData.PageAsSeparateDocumentProcessingReports?.[0]?.ProcessingResult?.DocumentData2
    );
    const backPageResults = parseDocumentData(
      isWorkflow
        ? baseData.payload?.ProcessingReport?.PageAsSeparateDocumentProcessingReports?.[1]?.ProcessingResult?.DocumentData2
        : baseData.PageAsSeparateDocumentProcessingReports?.[1]?.ProcessingResult?.DocumentData2
    );

    return {
      type: 'Uncoupled Documents - Remark 140 detected',
      results: compareAndMergeResults(frontPageResults, backPageResults)
    };
  } else {
    // Scenario 1: Coupled Front and Back
    return {
      type: 'Coupled Documents',
      results: parseDocumentData(
        isWorkflow
          ? baseData.payload?.ProcessingReport?.ProcessingResult?.DocumentData2
          : baseData.ProcessingResult?.DocumentData2
      )
    };
  }
};

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

function determineApiTypeFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  if (decoded.scp) {
    if (decoded.scp.includes('workflow:api')) return 'workflow';
    if (decoded.scp.includes('secure.me:request')) return 'secureme';
    if (decoded.scp.includes('bos')) return 'bos';
  }
  return null;
}

function getRegionFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  // First try to get region from apiUrl
  if (decoded.apiUrl) {
    const match = decoded.apiUrl.match(/https:\/\/([a-z]+)-api\./);
    if (match) return match[1].toUpperCase();
  }

  // Then try other sources
  const regionSources = [
    decoded.region,
    decoded.securemeUrl?.match(/api\.([^.]+)\./)?.[1],
    decoded.bosUrl?.match(/bos-([^.]+)\./)?.[1]
  ];

  for (const source of regionSources) {
    if (source) return source.toUpperCase();
  }
  return null;
}

function getEnvironmentFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  // Check apiUrl first
  if (decoded.apiUrl) {
    return decoded.apiUrl.includes('staging') ? 'STG' : 'PRD';
  }

  // Then check other sources
  const stagingIndicators = [
    decoded.securemeUrl?.includes('staging'),
    decoded.bosUrl?.includes('staging')
  ];

  return stagingIndicators.some(Boolean) ? 'STG' : 'PRD';
}

function getBaseUrlFromToken(token) {
  const apiType = determineApiTypeFromToken(token);
  const region = getRegionFromToken(token);
  const environment = getEnvironmentFromToken(token);

  if (!apiType || !region || !environment) {
    console.log('Debug info:', { apiType, region, environment });
    return null;
  }

  // Convert region to lowercase for URL matching
  const regionLower = region.toLowerCase();

  if (apiType === 'bos') {
    // For BOS type, use the predefined BOS_URLS
    const bosUrls = environment === 'STG' 
      ? BOS_URLS.filter(url => url.includes('staging'))
      : BOS_URLS.filter(url => !url.includes('staging'));
    return bosUrls.find(url => url.includes(regionLower)) || null;
  }

  // For Secureme and workflow:api types, use PRD_URLS or STG_URLS
  const urls = environment === 'STG' ? STG_URLS : PRD_URLS;
  return urls.find(url => url.includes(regionLower)) || null;
}

function getOrganizationInfo(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  return {
    name: decoded.clientOrganizationName,
    id: decoded.clientOrganizationId
  };
}

function getTokenInfo(token) {
  const apiType = determineApiTypeFromToken(token);
  const region = getRegionFromToken(token);
  const environment = getEnvironmentFromToken(token);
  const baseUrl = getBaseUrlFromToken(token);
  const organization = getOrganizationInfo(token);

  return {
    apiType,
    region,
    environment,
    baseUrl,
    organization,
    isValid: !!(apiType && region && environment && baseUrl)
  };
}

// FileUploader component
const FileUploader = ({ onDataReceived, onError }) => {
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [parsedResults, setParsedResults] = useState(null);
  const [showDataSelection, setShowDataSelection] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      onError('No file selected');
      return;
    }

    if (file.type !== 'application/json') {
      onError('Please select a JSON file');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        console.log('Parsed JSON data:', jsonData); // Debug log
        setResponseData(jsonData);
        const parsed = parseResponseData(jsonData);
        console.log('Parsed results:', parsed); // Debug log
        if (!parsed) {
          throw new Error('Failed to parse document data. Please ensure the JSON file contains valid document data.');
        }
        setParsedResults(parsed);
        setShowDataSelection(true);
      } catch (error) {
        console.error('Error processing file:', error); // Debug log
        onError('Error processing file: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      console.error('Error reading file'); // Debug log
      onError('Error reading file');
      setLoading(false);
    };

    try {
      reader.readAsText(file);
    } catch (error) {
      console.error('Error starting file read:', error); // Debug log
      onError('Error reading file: ' + error.message);
      setLoading(false);
    }
  };

  const handleFieldSelection = (field) => {
    setSelectedFields(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      }
      return [...prev, field];
    });
  };

  const handleSelectAll = () => {
    if (parsedResults) {
      const allFields = parsedResults.results.map(r => r.originalField);
      setSelectedFields(allFields);
    }
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleDataSelectionSubmit = () => {
    if (selectedFields.length > 0) {
      onDataReceived(responseData);
    } else {
      onError('Please select at least one field');
    }
  };

  const getBadgeClass = (dataSource) => {
    switch (dataSource) {
      case 'Visual Inspection': return 'primary';  // Blue
      case 'MRZ Reading': return 'success';       // Green
      case 'Barcode Reading': return 'warning';   // Yellow
      default: return 'secondary';                // Gray
    }
  };

  const renderDataSelection = () => {
    if (!parsedResults) return null;

    // Filter out fields that don't have values
    const fieldsWithValues = parsedResults.results
      .filter(r => r.value !== null && r.value !== undefined && r.value !== '')
      .map(r => r.originalField);
    const uniqueFields = [...new Set(fieldsWithValues)];

    return React.createElement('div', { className: 'mt-4' },
      React.createElement('div', { 
        className: 'alert alert-info mb-4',
        role: 'alert'
      },
        React.createElement('h5', { className: 'alert-heading mb-2' }, parsedResults.type),
        React.createElement('p', { className: 'mb-0' }, 
          'Select the fields you want to display from the parsed data.'
        )
      ),
      React.createElement('div', { className: 'card mb-4 shadow-sm' },
        React.createElement('div', { className: 'card-header bg-light' },
          React.createElement('div', { className: 'd-flex justify-content-between align-items-center' },
            React.createElement('h6', { className: 'mb-0' }, 'Available Fields'),
            React.createElement('div', null,
              React.createElement('button', {
                className: 'btn btn-outline-primary btn-sm me-2',
                onClick: handleSelectAll
              }, 'Select All'),
              React.createElement('button', {
                className: 'btn btn-outline-secondary btn-sm',
                onClick: handleDeselectAll
              }, 'Deselect All')
            )
          )
        ),
        React.createElement('div', { className: 'card-body' },
          React.createElement('div', { className: 'row g-3' },
            uniqueFields.map(field => {
              const displayName = formatFieldName(field);
              return React.createElement('div', {
                key: field,
                className: 'col-md-4'
              },
                React.createElement('div', { className: 'form-check' },
                  React.createElement('input', {
                    type: 'checkbox',
                    className: 'form-check-input',
                    id: 'field-' + field,
                    checked: selectedFields.includes(field),
                    onChange: () => handleFieldSelection(field)
                  }),
                  React.createElement('label', {
                    className: 'form-check-label',
                    htmlFor: 'field-' + field
                  }, displayName)
                )
              );
            })
          )
        )
      ),
      selectedFields.length > 0 && React.createElement('div', { className: 'card shadow-sm' },
        React.createElement('div', { className: 'card-header bg-light' },
          React.createElement('h6', { className: 'mb-0' }, 'Selected Data')
        ),
        React.createElement('div', { className: 'card-body' },
          React.createElement('div', { className: 'table-responsive' },
            React.createElement('table', { className: 'table table-hover' },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Field'),
                  React.createElement('th', null, 'Value'),
                  React.createElement('th', null, 'Source'),
                  React.createElement('th', null, 'Notes')
                )
              ),
              React.createElement('tbody', null,
                parsedResults.results
                  .filter(result => selectedFields.includes(result.originalField))
                  .map((result, index) => React.createElement('tr', {
                    key: index
                  },
                    React.createElement('td', { className: 'fw-bold' }, result.field),
                    React.createElement('td', null, result.value),
                    React.createElement('td', null,
                      React.createElement('span', {
                        className: 'badge bg-' + getBadgeClass(result.dataSource)
                      }, result.dataSource)
                    ),
                    React.createElement('td', null,
                      result.comment && React.createElement('span', {
                        className: 'text-muted small'
                      }, result.comment)
                    )
                  ))
              )
            )
          )
        )
      ),
      React.createElement('div', { className: 'mt-3' },
        React.createElement('button', {
          className: 'btn btn-primary',
          onClick: handleDataSelectionSubmit,
          disabled: selectedFields.length === 0
        }, 'Process Selected Fields')
      )
    );
  };

  return React.createElement('div', { className: 'card' },
    React.createElement('div', { className: 'card-body' },
      React.createElement('h5', { className: 'card-title' }, 'Upload JSON File'),
      React.createElement('form', null,
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { htmlFor: 'jsonFile', className: 'form-label' }, 'Select JSON File'),
          React.createElement('input', {
            type: 'file',
            className: 'form-control',
            id: 'jsonFile',
            accept: '.json',
            onChange: handleFileUpload,
            disabled: loading
          })
        )
      ),
      loading && React.createElement('div', { className: 'alert alert-info', role: 'alert' },
        'Processing file...'
      ),
      showDataSelection && renderDataSelection()
    )
  );
};

// GetRequestForm component
const GetRequestForm = ({ onDataReceived, onError }) => {
  const [accessToken, setAccessToken] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [parsedResults, setParsedResults] = useState(null);
  const [showDataSelection, setShowDataSelection] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);

  const handleTokenChange = (e) => {
    const token = e.target.value;
    setAccessToken(token);
    if (token) {
      const info = getTokenInfo(token);
      setTokenInfo(info);
      if (!info.isValid) {
        onError('Invalid token or unable to determine endpoint');
      }
    } else {
      setTokenInfo(null);
    }
  };

  const getEndpointPath = (apiType, requestId) => {
    switch (apiType) {
      case 'workflow':
        return `/result/v2/results/person/${requestId}?includeDetailed=true`;
      case 'secureme':
        return `/cm/v2/documentprocessingrequests/${requestId}`;
      case 'bos':
        return `/Au10tixBos4/IdentityDocuments/Results/${requestId}?imageTypes=all&sasToken=true&sasLifetimeInSeconds=600`;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId || !accessToken) {
      onError('Please provide both Request ID and Access Token');
      return;
    }

    if (!tokenInfo?.isValid) {
      onError('Invalid token or unable to determine endpoint');
      return;
    }

    const endpointPath = getEndpointPath(tokenInfo.apiType, requestId);
    if (!endpointPath) {
      onError('Invalid API type');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${tokenInfo.baseUrl}${endpointPath}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      console.log('API Response data:', data); // Debug log
      setResponseData(data);
      const parsed = parseResponseData(data);
      console.log('Parsed results:', parsed); // Debug log
      if (!parsed) {
        throw new Error('Failed to parse document data. Please ensure the response contains valid document data.');
      }
      setParsedResults(parsed);
      setShowDataSelection(true);
    } catch (error) {
      console.error('Error fetching data:', error); // Debug log
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSelection = (field) => {
    setSelectedFields(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      }
      return [...prev, field];
    });
  };

  const handleSelectAll = () => {
    if (parsedResults) {
      const allFields = parsedResults.results.map(r => r.originalField);
      setSelectedFields(allFields);
    }
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleDataSelectionSubmit = () => {
    if (selectedFields.length > 0) {
      onDataReceived(responseData);
    } else {
      onError('Please select at least one field');
    }
  };

  const getBadgeClass = (dataSource) => {
    switch (dataSource) {
      case 'Visual Inspection': return 'primary';  // Blue
      case 'MRZ Reading': return 'success';       // Green
      case 'Barcode Reading': return 'warning';   // Yellow
      default: return 'secondary';                // Gray
    }
  };

  const renderDataSelection = () => {
    if (!parsedResults) return null;

    // Filter out fields that don't have values
    const fieldsWithValues = parsedResults.results
      .filter(r => r.value !== null && r.value !== undefined && r.value !== '')
      .map(r => r.originalField);
    const uniqueFields = [...new Set(fieldsWithValues)];

    return React.createElement('div', { className: 'mt-4' },
      React.createElement('div', { 
        className: 'alert alert-info mb-4',
        role: 'alert'
      },
        React.createElement('h5', { className: 'alert-heading mb-2' }, parsedResults.type),
        React.createElement('p', { className: 'mb-0' }, 
          'Select the fields you want to display from the parsed data.'
        )
      ),
      React.createElement('div', { className: 'card mb-4 shadow-sm' },
        React.createElement('div', { className: 'card-header bg-light' },
          React.createElement('div', { className: 'd-flex justify-content-between align-items-center' },
            React.createElement('h6', { className: 'mb-0' }, 'Available Fields'),
            React.createElement('div', null,
              React.createElement('button', {
                className: 'btn btn-outline-primary btn-sm me-2',
                onClick: handleSelectAll
              }, 'Select All'),
              React.createElement('button', {
                className: 'btn btn-outline-secondary btn-sm',
                onClick: handleDeselectAll
              }, 'Deselect All')
            )
          )
        ),
        React.createElement('div', { className: 'card-body' },
          React.createElement('div', { className: 'row g-3' },
            uniqueFields.map(field => {
              const displayName = formatFieldName(field);
              return React.createElement('div', {
                key: field,
                className: 'col-md-4'
              },
                React.createElement('div', { className: 'form-check' },
                  React.createElement('input', {
                    type: 'checkbox',
                    className: 'form-check-input',
                    id: 'field-' + field,
                    checked: selectedFields.includes(field),
                    onChange: () => handleFieldSelection(field)
                  }),
                  React.createElement('label', {
                    className: 'form-check-label',
                    htmlFor: 'field-' + field
                  }, displayName)
                )
              );
            })
          )
        )
      ),
      selectedFields.length > 0 && React.createElement('div', { className: 'card shadow-sm' },
        React.createElement('div', { className: 'card-header bg-light' },
          React.createElement('h6', { className: 'mb-0' }, 'Selected Data')
        ),
        React.createElement('div', { className: 'card-body' },
          React.createElement('div', { className: 'table-responsive' },
            React.createElement('table', { className: 'table table-hover' },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Field'),
                  React.createElement('th', null, 'Value'),
                  React.createElement('th', null, 'Source'),
                  React.createElement('th', null, 'Notes')
                )
              ),
              React.createElement('tbody', null,
                parsedResults.results
                  .filter(result => selectedFields.includes(result.originalField))
                  .map((result, index) => React.createElement('tr', {
                    key: index
                  },
                    React.createElement('td', { className: 'fw-bold' }, result.field),
                    React.createElement('td', null, result.value),
                    React.createElement('td', null,
                      React.createElement('span', {
                        className: 'badge bg-' + getBadgeClass(result.dataSource)
                      }, result.dataSource)
                    ),
                    React.createElement('td', null,
                      result.comment && React.createElement('span', {
                        className: 'text-muted small'
                      }, result.comment)
                    )
                  ))
              )
            )
          )
        )
      )
    );
  };

  return React.createElement('div', { className: 'card shadow-sm' },
    React.createElement('div', { className: 'card-header bg-light' },
      React.createElement('h5', { className: 'mb-0' }, 'Get Data from API')
    ),
    React.createElement('div', { className: 'card-body' },
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { 
            htmlFor: 'accessToken', 
            className: 'form-label fw-bold' 
          }, 'Access Token'),
          React.createElement('input', {
            type: 'password',
            className: 'form-control',
            id: 'accessToken',
            value: accessToken,
            onChange: handleTokenChange,
            placeholder: 'Enter Access Token',
            required: true
          })
        ),
        tokenInfo?.isValid && React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { 
            htmlFor: 'requestId', 
            className: 'form-label fw-bold' 
          }, 'Request ID'),
          React.createElement('input', {
            type: 'text',
            className: 'form-control',
            id: 'requestId',
            value: requestId,
            onChange: (e) => setRequestId(e.target.value),
            placeholder: 'Enter Request ID',
            required: true
          })
        ),
        tokenInfo?.isValid && React.createElement('button', {
          type: 'submit',
          className: 'btn btn-primary',
          disabled: loading
        }, loading ? 
          React.createElement(React.Fragment, null,
            React.createElement('span', { 
              className: 'spinner-border spinner-border-sm me-2',
              role: 'status',
              'aria-hidden': 'true'
            }),
            'Fetching...'
          ) : 'Fetch Data'
        )
      ),
      tokenInfo && React.createElement('div', { className: 'mt-4' },
        React.createElement('div', { className: 'card bg-light' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h6', { className: 'card-subtitle mb-3' }, 'Token Information'),
            React.createElement('div', { className: 'row g-3' },
              React.createElement('div', { className: 'col-md-6' },
                React.createElement('p', { className: 'mb-1' },
                  React.createElement('strong', null, 'API Type: '),
                  React.createElement('span', { className: 'badge bg-primary' }, 
                    tokenInfo.apiType || 'Unknown'
                  )
                ),
                React.createElement('p', { className: 'mb-1' },
                  React.createElement('strong', null, 'Region: '),
                  React.createElement('span', { className: 'badge bg-info' }, 
                    tokenInfo.region || 'Unknown'
                  )
                ),
                React.createElement('p', { className: 'mb-1' },
                  React.createElement('strong', null, 'Environment: '),
                  React.createElement('span', { 
                    className: 'badge bg-' + (tokenInfo.environment === 'PRD' ? 'success' : 'warning')
                  }, tokenInfo.environment || 'Unknown')
                )
              ),
              React.createElement('div', { className: 'col-md-6' },
                tokenInfo.organization && React.createElement(React.Fragment, null,
                  React.createElement('p', { className: 'mb-1' },
                    React.createElement('strong', null, 'Organization: '),
                    tokenInfo.organization.name
                  ),
                  React.createElement('p', { className: 'mb-1' },
                    React.createElement('strong', null, 'Organization ID: '),
                    tokenInfo.organization.id
                  )
                ),
                React.createElement('p', { className: 'mb-1' },
                  React.createElement('strong', null, 'Base URL: '),
                  React.createElement('code', null, tokenInfo.baseUrl || 'Unknown')
                ),
                React.createElement('p', { className: 'mb-1' },
                  React.createElement('strong', null, 'Status: '),
                  React.createElement('span', {
                    className: 'badge bg-' + (tokenInfo.isValid ? 'success' : 'danger')
                  }, tokenInfo.isValid ? 'Valid' : 'Invalid')
                )
              )
            )
          )
        )
      ),
      showDataSelection && renderDataSelection()
    )
  );
};

// App component
const App = () => {
  const [activeTab, setActiveTab] = useState('file');
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataReceived = (data) => {
    setProcessedData(data);
    setError(null);
  };

  const handleError = (error) => {
    setError(error);
    setProcessedData(null);
  };

  return React.createElement('div', { className: 'container mt-4' },
    React.createElement('h1', { className: 'mb-4' }, 'JSON Reader'),
    React.createElement('ul', { className: 'nav nav-tabs mb-4' },
      React.createElement('li', { className: 'nav-item' },
        React.createElement('button', {
          className: 'nav-link ' + (activeTab === 'file' ? 'active' : ''),
          onClick: () => setActiveTab('file')
        }, 'Upload File')
      ),
      React.createElement('li', { className: 'nav-item' },
        React.createElement('button', {
          className: 'nav-link ' + (activeTab === 'api' ? 'active' : ''),
          onClick: () => setActiveTab('api')
        }, 'Get from API')
      )
    ),
    React.createElement('div', { className: 'tab-content' },
      activeTab === 'file' ? React.createElement('div', { className: 'tab-pane active' },
        React.createElement(FileUploader, {
          onDataReceived: handleDataReceived,
          onError: handleError
        })
      ) : React.createElement('div', { className: 'tab-pane active' },
        React.createElement(GetRequestForm, {
          onDataReceived: handleDataReceived,
          onError: handleError
        })
      )
    ),
    error && React.createElement('div', { className: 'alert alert-danger mt-3', role: 'alert' },
      error
    ),
    processedData && React.createElement('div', { className: 'mt-4' },
      React.createElement('h3', null, 'Processed Data:'),
      React.createElement('pre', { className: 'bg-light p-3 rounded' },
        JSON.stringify(processedData, null, 2)
      )
    )
  );
};

// Initialize the app
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App)); 