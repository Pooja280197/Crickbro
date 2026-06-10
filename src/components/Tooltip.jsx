// components/Tooltip.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Info } from 'lucide-react';

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX + (rect.width / 2),
      });
    }
  }, [show]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center gap-1 cursor-help relative"
      >
        {children}
        <Info className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
      </div>
      
      {show && ReactDOM.createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
            zIndex: 99999,
          }}
          className="w-64 p-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
        >
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 left-1/2 -translate-x-1/2" />
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;