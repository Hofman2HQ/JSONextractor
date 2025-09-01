import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import './App.css';
import { PROCESSING_REMARKS, RISK_REMARKS, PRIMARY_PROCESSING_RESULTS } from './logic/extractor.js';

const container = document.getElementById('root');
const root = createRoot(container);

// Safely inject global variables with error handling
try {
  window.PROCESSING_REMARKS = PROCESSING_REMARKS;
  window.RISK_REMARKS = RISK_REMARKS;
  window.PRIMARY_PROCESSING_RESULTS = PRIMARY_PROCESSING_RESULTS;
} catch (error) {
  if (process.env.NODE_ENV !== 'production') console.warn('Failed to inject global variables:', error);
  // Fallback to empty objects if injection fails
  window.PROCESSING_REMARKS = window.PROCESSING_REMARKS || {};
  window.RISK_REMARKS = window.RISK_REMARKS || {};
  window.PRIMARY_PROCESSING_RESULTS = window.PRIMARY_PROCESSING_RESULTS || {};
}

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);