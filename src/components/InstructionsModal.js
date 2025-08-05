import React from 'react';

const InstructionsModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Instructions</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              Load a JSON document by dropping a file or issuing an HTTP GET request. The file is parsed in the browser and the
              DocumentStatusReport2 payload is processed to extract summary fields, metadata and categorized remarks. All
              computation occurs in-memory in your session; nothing is transmitted to a backend service or written to disk.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
