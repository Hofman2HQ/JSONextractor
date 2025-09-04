import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import './App.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
