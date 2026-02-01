import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://tphappenings.onrender.com';

function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    adminNo: '',
    email: '',
    course: '',
    yearOfStudy: '',
    reasons: '',
    agreeTerms: false,
    receiveUpdates: false,
    consentPhoto: false
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
          
          if (data.spotsRemaining === 0) {
            setError('Registration for this event is closed - no spots available');
          }

          if (user?.id) {
            const registrationsResponse = await fetch(`${API_URL}/registrations`);
            const registrations = await registrationsResponse.json();
            
            const alreadyRegistered = registrations.some(
              reg => (String(reg.userId) === String(user.id) || String(reg.userId) === String(user._id) || reg.email === user.email) && String(reg.eventId) === String(id)
            );
            
            if (alreadyRegistered) {
              setError('You are already registered for this event');
            }
          }
        } else {
          setError(`Event not found. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading event:', error);
        setError('Failed to load event');
      }
    };
    
    fetchEvent();
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        adminNo: user.adminNo || '',
        email: user.email || '',
        course: user.course || '',
        yearOfStudy: user.yearOfStudy || ''
      }));
    }
  }, [id, user, user?.id, user?.email]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      alert('Please agree to the event terms and conditions');
      return;
    }

    if (event.spotsRemaining <= 0) {
      alert('Sorry, this event is full. No more spots available.');
      return;
    }

    // Validate yearOfStudy before submission
    const yearNum = parseInt(formData.yearOfStudy);
    if (isNaN(yearNum) || yearNum < 1 || yearNum > 3) {
      alert('Please enter a valid year of study (1-3)');
      return;
    }

    try {
      const registrationsResponse = await fetch(`${API_URL}/registrations`);
      const registrations = await registrationsResponse.json();
      
      const alreadyRegistered = registrations.some(
        reg => (String(reg.userId) === String(user.id) || String(reg.userId) === String(user._id)) && String(reg.eventId) === String(id)
      );
      
      if (alreadyRegistered) {
        alert('You are already registered for this event');
        return;
      }

      // Build registration object with validated data
      const registration = {
        userId: user.id || user._id,
        eventId: id,
        fullName: formData.fullName.trim(),
        adminNo: formData.adminNo.trim(),
        email: formData.email.trim(),
        course: formData.course.trim(),
        yearOfStudy: formData.yearOfStudy.toString(),
        reasons: formData.reasons.trim() || "",
        registrationDate: new Date().toISOString().split('T')[0],
        status: "registered",
        receiveUpdates: formData.receiveUpdates || false,
        consentPhoto: formData.consentPhoto || false,
        attended: false
      };

      console.log('Sending registration:', registration); // Debug

      const response = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registration)
      });

      if (response.ok) {
        const updatedEvent = {
          ...event,
          spotsRemaining: event.spotsRemaining - 1,
          stats: {
            ...event.stats,
            registered: (event.stats?.registered || 0) + 1
          }
        };

        await fetch(`${API_URL}/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedEvent)
        });

        alert('Registration successful!');
        
        if (user.userType === 'organiser') {
          navigate('/organiser-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Failed to register: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Error submitting registration: ' + error.message);
    }
  };

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Event Registration</h3>
          <button 
            className="btn-close" 
            onClick={() => navigate(`/events/${id}`)}
            aria-label="Close"
          ></button>
        </div>

        <div className="row">
          <div className="col-lg-7 mb-4">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h5 className="mb-4">Registration Details</h5>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Admin No.</label>
                    <input
                      type="text"
                      className="form-control"
                      name="adminNo"
                      value={formData.adminNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Course</label>
                      <input
                        type="text"
                        className="form-control"
                        name="course"
                        value={formData.course}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Year of Study</label>
                      <input
                        type="number"
                        className="form-control"
                        name="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={handleFormChange}
                        min="1"
                        max="3"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Reasons for participating</label>
                    <textarea
                      className="form-control"
                      name="reasons"
                      rows="4"
                      placeholder="Why are you signing up?"
                      value={formData.reasons}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="agreeTerms"
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleFormChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        I agree to the <a href="#" className="text-decoration-none">event terms and conditions</a>
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="receiveUpdates"
                        id="receiveUpdates"
                        checked={formData.receiveUpdates}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label" htmlFor="receiveUpdates">
                        I would like to receive updates about this event
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="consentPhoto"
                        id="consentPhoto"
                        checked={formData.consentPhoto}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label" htmlFor="consentPhoto">
                        I consent to being photographed during the event
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-dark w-100 py-2">
                    Complete Registration
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-body p-4">
                <h5 className="mb-4">Registration Summary</h5>

                <div 
                  className="rounded mb-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    height: '120px', 
                    backgroundColor: event.image ? 'transparent' : '#6c757d',
                    color: '#999',
                    overflow: 'hidden'
                  }}
                >
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    '[Event Image]'
                  )}
                </div>

                <h6 className="mb-1">{event.title}</h6>

                <div className="border-top pt-3">
                  <p className="mb-2">
                    <small><strong>Date:</strong> {event.date} • {event.time}</small>
                  </p>
                  <p className="mb-3">
                    <small><strong>Location:</strong> {event.location}</small>
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small><strong>Status:</strong></small>
                    <span className={`badge ${event.spotsRemaining === 0 ? 'bg-danger' : 'bg-success'}`}>
                      {event.spotsRemaining === 0 ? 'Closed' : 'Available'}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <small><strong>Spots Left:</strong></small>
                    <small className="fw-bold">{event.spotsRemaining}/{event.maxParticipants}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EventRegistration;