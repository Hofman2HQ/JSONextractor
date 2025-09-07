import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './components/FileUpload.js';
import ResultsDisplay from './components/ResultsDisplay.js';
import GetRequestForm from './components/GetRequestForm.js';
import DoubleCheckTabs from './components/DoubleCheckTabs.js';

// Lazy load heavy components to reduce initial bundle size
const DocumentationPage = React.lazy(() => import('./components/DocumentationPage.js'));
const InstructionsModal = React.lazy(() => import('./components/InstructionsModal.js'));
import secureMeDemo from '../SecureMe.json';
// Updated demo Workflow JSON (user-supplied latest version)
import workflowDemo from '../Workflow.json';
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
  }, [processedData, activeTab, showDocumentation]); // Re-init on data, tab, or docs view changes

  const handleDataReceived = (data) => {
    if (!data) {
      setError('No data received');
      return;
    }
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

  const handleBackToMain = () => {
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

  const handleLoadDemoJson = (type) => {
    if (type === 'secure') {
      handleDataReceived(secureMeDemo);
    } else if (type === 'workflow') {
      handleDataReceived(workflowDemo);
    }
  };

  return (
    <motion.div
      className="container app-shell"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className="app-header glass-card">
        <div className="brand">
          <motion.h1
            className="app-title gradient-text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            JSON Reader
          </motion.h1>
          <p className="subtitle">All processing is local. Nothing is saved.</p>
        </div>
        <div className="action-bar">
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-ghost dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Demo JSONs
              </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => handleLoadDemoJson('secure')}>Secure Me</button></li>
              <li><button className="dropdown-item" onClick={() => handleLoadDemoJson('workflow')}>Workflow</button></li>
            </ul>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => handleShowDocumentation('processing')}
          >
            <i className="bi bi-book me-1"></i> Docs
          </button>
          <button
            className="btn btn-primary-soft"
            onClick={() => setShowInstructions(true)}
          >
            <i className="bi bi-info-circle me-1"></i> Instructions
          </button>
        </div>
      </header>

      <Suspense
        fallback={(
          <div className="center-row py-3">
            <div className="dot-pulse" aria-label="Loading" />
          </div>
        )}
      >
        <InstructionsModal show={showInstructions} onClose={() => setShowInstructions(false)} />
      </Suspense>

      <div className="tabs-wrapper">
        <ul className="nav nav-tabs nav-modern mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => handleTabChange('file')}
            >
              <i className="bi bi-upload me-1"></i>
              Upload File
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => handleTabChange('api')}
            >
              <i className="bi bi-cloud-download me-1"></i>
              Get from API
            </button>
          </li>
        </ul>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'file' ? (
          <motion.div
            key="tab-file"
            className="tab-pane active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <FileUpload onFileUpload={handleFileUpload} onError={handleError} />
          </motion.div>
        ) : (
          <motion.div
            key="tab-api"
            className="tab-pane active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <GetRequestForm onDataReceived={handleDataReceived} onError={handleError} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-danger mt-3"
            role="alert"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3">
        <AnimatePresence mode="wait">
          {showDocumentation ? (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense
                fallback={(
                  <div className="center-row py-3"><div className="dot-pulse" /></div>
                )}
              >
                <DocumentationPage
                  type={documentationType}
                  onBack={processedData ? handleBackToResults : undefined}
                  onBackToMain={handleBackToMain}
                />
              </Suspense>
            </motion.div>
          ) : (
            processedData && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {processedData.doubleCheck && processedData.bos ? (
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
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default App;
