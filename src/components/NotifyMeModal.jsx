import { useState } from 'react';

function NotifyMeModal({ show, onClose, userEmail }) {
    // State to track if the user has been notified
    const [isNotified, setIsNotified] = useState(false);

    // If the modal should not be shown, return null
    if (!show) return null;

    // Function to handle confirmation of notifications
    const handleConfirm = () => {
        setIsNotified(true); // Set notified state to true
        // Automatically close the modal after 2 seconds
        setTimeout(() => {
            onClose(); // Close the modal
            setIsNotified(false); // Reset notified state
        }, 2000);
    };

    // If the user has been notified, show the success message
    if (isNotified) {
        return (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body text-center py-5">
                            <div className="mb-3">
                                <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h5 className="mb-3">You're in the know!</h5>
                            <p className="text-muted mb-0">
                                You'll now receive timely updates for your registered events at<br />
                                <strong>{userEmail}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render the modal for enabling notifications
    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title">Enable Notifications</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-muted">
                            You'll receive timely email updates for your registered events at:
                        </p>
                        <div className="alert alert-light" role="alert">
                            <strong>{userEmail}</strong>
                        </div>
                        <p className="text-muted small mb-0">
                            You can manage your notification preferences anytime in your account settings.
                        </p>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-dark" onClick={handleConfirm}>
                            Enable Notifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotifyMeModal;