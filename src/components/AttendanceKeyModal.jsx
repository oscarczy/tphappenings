import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://tphappenings.onrender.com';

function AttendanceKeyModal({ eventId, onClose, onSubmit }) {
  const [attendanceKey, setAttendanceKey] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newKey = [...attendanceKey];
    newKey[index] = value;
    setAttendanceKey(newKey);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`key-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !attendanceKey[index] && index > 0) {
      document.getElementById(`key-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const key = attendanceKey.join('');
    if (key.length !== 4) {
      setError('Please enter all 4 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/events/` + eventId);
      const event = await response.json();

      if (event.attendanceKey !== key) {
        setError('Invalid attendance key. Please try again.');
        setLoading(false);
        return;
      }

      onSubmit(key);
    } catch (error) {
      console.error('Error verifying key:', error);
      setError('Error verifying attendance key');
      setLoading(false);
    }
  };

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
            <h5 className="modal-title">Attendance Key</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body text-center p-5">
            <form onSubmit={handleSubmit}>
              <p className="text-muted mb-4">
                Enter the organiser's attendance key to mark your attendance
              </p>

              <div className="d-flex justify-content-center gap-3 mb-4">
                {attendanceKey.map((digit, index) => (
                  <input
                    key={index}
                    id={`key-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleKeyChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="form-control text-center fw-bold"
                    style={{
                      width: '60px',
                      height: '60px',
                      fontSize: '24px',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      padding: '0'
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-dark w-100 py-2"
                disabled={loading || attendanceKey.some(d => !d)}
              >
                {loading ? 'Verifying...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceKeyModal;