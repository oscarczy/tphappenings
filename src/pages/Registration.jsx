import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { mockEvents, mockUser } from '../data/mockData';

function Registration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    year: mockUser.year,
    dietary: '',
    questions: '',
    agreeTerms: false,
    receiveUpdates: true,
    photoConsent: false
  });

  const event = mockEvents.find(e => e.id === parseInt(id)) || mockEvents[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    alert('Registration successful! You will receive a confirmation email shortly.');
    navigate(`/events/${id}`);
  };

  return (
    <main className="py-4">
      <div className="container">
        <h2 className="page-title border-bottom pb-2 mb-4">Event Registration</h2>
        
        <div className="row">
          {/* Registration Form */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h3 className="mb-4">Registration Details</h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={mockUser.name} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Student ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={mockUser.studentId} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={mockUser.email} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Course</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={mockUser.course} 
                        readOnly 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Year of Study</label>
                      <select 
                        name="year"
                        className="form-control"
                        value={formData.year}
                        onChange={handleChange}
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Dietary Requirements</label>
                    <select 
                      name="dietary"
                      className="form-control"
                      value={formData.dietary}
                      onChange={handleChange}
                    >
                      <option value="">None</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="halal">Halal</option>
                      <option value="gluten-free">Gluten-Free</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Questions for Organizers</label>
                    <textarea 
                      name="questions"
                      className="form-control"
                      placeholder="Any questions you'd like to ask the event organizers?"
                      value={formData.questions}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="checkbox-group mb-4">
                    <div className="form-check mb-2">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label">
                        I agree to the <a href="#" className="text-primary">event terms and conditions</a>
                      </label>
                    </div>
                    
                    <div className="form-check mb-2">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        name="receiveUpdates"
                        checked={formData.receiveUpdates}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">
                        I would like to receive updates about this event
                      </label>
                    </div>
                    
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input"
                        name="photoConsent"
                        checked={formData.photoConsent}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">
                        I consent to being photographed during the event
                      </label>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-success w-100 py-3 fw-bold">
                    Complete Registration
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Registration Summary */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h3 className="mb-3">Registration Summary</h3>
                
                <div className="summary-event d-flex mb-3 pb-3 border-bottom">
                  <div className="summary-event-image bg-secondary rounded d-flex align-items-center justify-content-center me-3"
                       style={{ width: '80px', height: '80px' }}>
                    <div className="text-center text-white">
                      <i className="bi bi-calendar-event" style={{ fontSize: '24px' }}></i>
                      <small className="d-block">Event</small>
                    </div>
                  </div>
                  <div className="summary-event-details">
                    <div className="summary-event-title fw-bold">{event.title}</div>
                    <div className="text-muted small">
                      <div><i className="bi bi-calendar"></i> {event.date} • {event.time.split(' - ')[0]}</div>
                      <div><i className="bi bi-geo-alt"></i> {event.location}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span><i className="bi bi-tag"></i> Registration Fee:</span>
                    <span className="fw-bold">Free</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span><i className="bi bi-check-circle"></i> Status:</span>
                    <span className="text-success fw-bold">Available</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span><i className="bi bi-people"></i> Spots Left:</span>
                    <span className="fw-bold">{event.spotsRemaining}/{event.maxParticipants}</span>
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

export default Registration;