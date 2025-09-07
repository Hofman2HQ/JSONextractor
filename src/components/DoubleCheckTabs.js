import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResultsDisplay from './ResultsDisplay.js';

const DoubleCheckTabs = ({ doubleCheck, bos, onShowDocumentation }) => {
  const [active, setActive] = useState('double');

  return (
    <div>
      <ul className="nav nav-tabs nav-modern mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${active === 'double' ? 'active' : ''}`}
            onClick={() => setActive('double')}
          >
            Double Check
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${active === 'bos' ? 'active' : ''}`}
            onClick={() => setActive('bos')}
          >
            BOS
          </button>
        </li>
      </ul>
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {active === 'double' ? (
            <motion.div
              key="double"
              className="tab-pane active"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ResultsDisplay data={doubleCheck} onShowDocumentation={onShowDocumentation} />
            </motion.div>
          ) : (
            <motion.div
              key="bos"
              className="tab-pane active"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ResultsDisplay data={bos} onShowDocumentation={onShowDocumentation} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoubleCheckTabs;
