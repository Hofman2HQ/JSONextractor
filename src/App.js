import React, { useState, useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload.js';
import ResultsDisplay from './components/ResultsDisplay.js';
import DocumentationPage from './components/DocumentationPage.js';
import GetRequestForm from './components/GetRequestForm.js';
import DoubleCheckTabs from './components/DoubleCheckTabs.js';
import InstructionsModal from './components/InstructionsModal.js';

import './App.css';
import { processJsonData } from './logic/extractor.js';

function App() {
  const [activeTab, setActiveTab] = useState('file');
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [documentationType, setDocumentationType] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const tooltipInstances = useRef([]);

  useEffect(() => {
    // Initialize Bootstrap tooltips with error handling
    try {
      if (window.bootstrap && window.bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipInstances.current = tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
      }
    } catch (error) {
      console.warn('Bootstrap tooltips not available:', error);
    }

    // Cleanup function to destroy tooltips
    return () => {
      tooltipInstances.current.forEach(tooltip => {
        try {
          if (tooltip && typeof tooltip.dispose === 'function') {
            tooltip.dispose();
          }
        } catch (error) {
          console.warn('Error disposing tooltip:', error);
        }
      });
      tooltipInstances.current = [];
    };
  }, [processedData]); // Re-initialize tooltips when processed data changes

  const handleDataReceived = (data) => {
    if (!data) {
      setError('No data received');
      return;
    }
    // Debug log: show the received data
    console.log('Received data:', data);
    // Always process the data before displaying
    const processed = processJsonData(data);
    // If remark 400 is present and idvResultData exists, process both datasets
    let finalProcessed = processed;
    if (
      processed?.remarks?.processing?.some(r => r.code === 400) &&
      data && data.idvResultData
    ) {
      const bosProcessed = processJsonData(data, { forceResultKey: 'idvResultData' });
      finalProcessed = { doubleCheck: processed, bos: bosProcessed };
    }
    // Debug log: show the processed data
    console.log('Processed data:', finalProcessed);
    setProcessedData(finalProcessed);
    setError(null);
    setShowDocumentation(false); // Reset documentation view when new data is received
  };

  const handleError = (error) => {
    setError(error || 'An unknown error occurred');
    setProcessedData(null);
    setShowDocumentation(false); // Reset documentation view on error
  };

  const handleFileUpload = (data) => {
    handleDataReceived(data); // Use the same handler for consistency
  };

  const handleShowDocumentation = (type) => {
    if (!type) {
      setError('Documentation type not specified');
      return;
    }
    setDocumentationType(type);
    setShowDocumentation(true);
  };

  const handleBackToResults = () => {
    setShowDocumentation(false);
    setDocumentationType(null);
  };

  const handleTabChange = (tab) => {
    if (!tab) return;
    setActiveTab(tab);
    setProcessedData(null); // Clear processed data when switching tabs
    setError(null);
    setShowDocumentation(false); // Reset documentation view when switching tabs
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-2">JSON Reader</h1>
      <p className="text-center text-muted mb-3">All processing happens locally and no information is saved.</p>
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-info btn-sm"
          onClick={() => setShowInstructions(true)}
        >
          <i className="bi bi-info-circle me-1"></i> Instructions
        </button>
      </div>
      <InstructionsModal show={showInstructions} onClose={() => setShowInstructions(false)} />
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => handleTabChange('file')}
          >
            Upload File
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => handleTabChange('api')}
          >
            Get from API
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'file' ? (
          <div className="tab-pane active">
            <FileUpload onFileUpload={handleFileUpload} onError={handleError} />
          </div>
        ) : (
          <div className="tab-pane active">
            <GetRequestForm onDataReceived={handleDataReceived} onError={handleError} />
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      {processedData && (
        <div className="mt-4">
          {showDocumentation ? (
            <DocumentationPage
              type={documentationType}
              onBack={handleBackToResults}
            />
          ) : (
            processedData.doubleCheck && processedData.bos ? (
              <DoubleCheckTabs
                doubleCheck={processedData.doubleCheck}
                bos={processedData.bos}
                onShowDocumentation={handleShowDocumentation}
              />
            ) : (
              <ResultsDisplay
                data={processedData}
                onShowDocumentation={handleShowDocumentation}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default App;