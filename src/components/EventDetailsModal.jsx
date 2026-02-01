import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

function EventDetailsModal({ event, show, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);

  if (!show || !event) return null;

  const handleRegisterClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Close modal and navigate to registration page
    onClose();
    navigate(`/events/${event._id}/register`);
  };

  const handleAddToCalendar = () => {
    console.log('Add to calendar');
  };

  const handleShare = () => {
    console.log('Share event');
  };

  const similarEvents = [
    {
      id: 101,
      title: 'Web Development Bootcamp',
      date: 'Nov 5, 2025',
      location: 'IT Blk',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      image: '[Event Image]'
    },
    {
      id: 102,
      title: 'AI & Machine Learning Talk',
      date: 'Oct 30, 2025',
      location: 'Auditorium',
      description: 'Lorem Ipsum is simply dummy text',
      image: '[Event Image]'
    }
  ];

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header border-0">
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              {/* Left Column - Event Details */}
              <div className="col-lg-7">
                {/* Event Banner */}
                <div className="event-banner bg-light d-flex align-items-center justify-content-center mb-4" style={{ height: '250px', borderRadius: '8px' }}>
                  <span className="text-muted">[Event Banner Image]</span>
                </div>

                {/* Event Title */}
                <h3 className="mb-3">{event.title}</h3>

                {/* Event Info */}
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2 text-muted">
                    <i className="bi bi-calendar me-2"></i>
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2 text-muted">
                    <i className="bi bi-geo-alt me-2"></i>
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <span className="badge bg-secondary me-2">Workshop</span>
                  <span className="badge bg-secondary">Technology</span>
                </div>

                {/* Organizer Info */}
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                  <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                    IT
                  </div>
                  <div>
                    <h6 className="mb-0">School of Informatics & IT</h6>
                    <small className="text-muted">Organizer</small>
                  </div>
                </div>

                {/* Event Description */}
                <div className="mb-4">
                  <p className="text-muted">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                  </p>
                </div>

                {/* Similar Events */}
                <div className="mb-4">
                  <h5 className="mb-3">Similar Events You Might Like</h5>
                  <div className="row row-cols-1 row-cols-md-2 g-3">
                    {similarEvents.map((simEvent) => (
                      <div key={simEvent._id} className="col">
                        <div className="card h-100">
                          <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                            <span className="text-muted">{simEvent.image}</span>
                          </div>
                          <div className="card-body">
                            <h6 className="card-title">{simEvent.title}</h6>
                            <div className="d-flex justify-content-between text-muted small mb-2">
                              <span>{simEvent.date}</span>
                              <span>{simEvent.location}</span>
                            </div>
                            <p className="card-text small text-muted">{simEvent.description}</p>
                            <button className="btn btn-sm btn-outline-secondary w-100">View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Registration Panel */}
              <div className="col-lg-5">
                <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                  <div className="card-body">
                    <div className="bg-light-blue text-center p-3 mb-3 rounded" style={{ backgroundColor: '#d4e9f7' }}>
                      <h6 className="mb-0 text-dark">Registration Open</h6>
                    </div>

                    <p className="text-center text-muted mb-3">
                      {event.spotsRemaining} spots remaining out of {event.maxParticipants}
                    </p>

                    <div className="d-grid gap-2">
                      {isRegistered ? (
                        <>
                          <button className="btn btn-success" disabled>
                            Registered 
                          </button>
                          <button className="btn btn-outline-secondary">
                            Enter Attendance Key
                          </button>
                        </>
                      ) : (
                        <button 
                          className="btn btn-dark"
                          onClick={handleRegisterClick}
                        >
                          Register Now
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handleAddToCalendar}
                      >
                        Add to Calendar
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handleShare}
                      >
                        Share Event
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;