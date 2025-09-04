import React, { useState, useCallback } from 'react';
import config from '../../config.json';

const FileUpload = React.memo(({ onFileUpload, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const maxFileSize = config.app.maxFileSize || 5242880;

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) {
      if (onError) onError('No file selected');
      return;
    }
    
    // Some browsers provide generic MIME types for drag/drop; allow .json extension as fallback
    const isJsonMime = file.type === 'application/json' || file.type === 'text/json';
    const isJsonExt = typeof file.name === 'string' && file.name.toLowerCase().endsWith('.json');
    if (!isJsonMime && !isJsonExt) {
      if (onError) onError('Please upload a JSON file (.json)');
      return;
    }
    
    if (file.size > maxFileSize) {
      if (onError) onError(`File size exceeds the limit of ${maxFileSize / 1024 / 1024} MB`);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (onFileUpload) onFileUpload(jsonData);
      } catch (error) {
        if (onError) onError('Error parsing JSON file: ' + error.message);
      }
    };
    
    reader.onerror = () => {
      if (onError) onError('Error reading file');
    };
    
    try {
      reader.readAsText(file);
    } catch (error) {
      if (onError) onError('Error reading file: ' + error.message);
    }
  }, [maxFileSize, onFileUpload, onError]);

  const handleBrowseClick = useCallback(() => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }, []);

  return (
    <div 
      className={`upload-area p-5 text-center border rounded ${dragActive ? 'border-primary' : 'border-secondary'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".json"
        onChange={handleChange}
        className="d-none"
        id="fileInput"
      />
      <label htmlFor="fileInput" className="mb-0">
        <div className="upload-icon mb-3">
          <i className="bi bi-cloud-upload fs-1"></i>
        </div>
        <h4>Drag and drop your JSON file here</h4>
        <p className="text-muted">or</p>
        <button 
          className="btn btn-primary"
          type="button"
          onClick={handleBrowseClick}
        >
          Browse Files
        </button>
      </label>
    </div>
  );
});

export default FileUpload;
