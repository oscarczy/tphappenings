import { useState } from 'react';

function GeneratedAttendanceKeyModal({ attendanceKey, eventTitle, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(attendanceKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const keyDigits = attendanceKey.toString().padStart(4, '0').split('');

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header bg-light border-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title">Generated Attendance Key</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body text-center p-5">
            <p className="text-muted mb-4">
              Share this code with attendees to record their attendance
            </p>

            <div className="d-flex justify-content-center gap-3 mb-4">
              {keyDigits.map((digit, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '60px',
                    height: '60px',
                    fontSize: '24px',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>

            <button 
              type="button"
              className="btn btn-outline-secondary w-100 mb-3"
              onClick={handleCopy}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>

            <p className="text-muted small mb-0">
              This code is valid for the duration of the event
            </p>
          </div>

          <div className="modal-footer border-top p-3">
            <button 
              type="button" 
              className="btn btn-dark"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratedAttendanceKeyModal;