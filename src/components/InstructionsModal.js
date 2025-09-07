import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InstructionsModal = ({ show, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-dialog"
          role="document"
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        >
          <div className="modal-content glass-card">
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
              <p>Upload a JSON file or use the API tab to fetch data. All processing happens locally and no information is stored.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary-soft" onClick={onClose}>Close</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default InstructionsModal;
