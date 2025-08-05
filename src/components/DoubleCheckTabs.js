import React, { useState } from 'react';
import ResultsDisplay from './ResultsDisplay.js';

const DoubleCheckTabs = ({ doubleCheck, bos, onShowDocumentation }) => {
  const [active, setActive] = useState('double');

  return (
    <div>
      <ul className="nav nav-tabs mb-3">
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
        <div className={`tab-pane ${active === 'double' ? 'active' : ''}`}>
          <ResultsDisplay data={doubleCheck} onShowDocumentation={onShowDocumentation} />
        </div>
        <div className={`tab-pane ${active === 'bos' ? 'active' : ''}`}>
          <ResultsDisplay data={bos} onShowDocumentation={onShowDocumentation} />
        </div>
      </div>
    </div>
  );
};

export default DoubleCheckTabs;
