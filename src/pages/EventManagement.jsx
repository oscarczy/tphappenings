import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import GeneratedAttendanceKeyModal from '../components/GeneratedAttendanceKeyModal';

const API_URL = 'http://localhost:5050';

function EventManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('participants');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGeneratedKey, setShowGeneratedKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);

  // Format Singapore time from ISO string
  const formatSingaporeTime = (isoString) => {
    if (!isoString) return 'N/A';
    
    const date = new Date(isoString);
    const options = {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-SG', options);
  };

  // Get Singapore time in ISO format
  const getSingaporeTime = () => {
    const now = new Date();
    const singaporeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    return singaporeTime.toISOString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventResponse = await fetch(`${API_URL}/events/${id}`);
        const eventData = await eventResponse.json();
        setEvent(eventData);

        const registrationsResponse = await fetch(`${API_URL}/registrations`);
        const allRegistrations = await registrationsResponse.json();
        const eventRegistrations = allRegistrations.filter(reg => reg.eventId === id);
        setRegistrations(eventRegistrations);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.state?.refresh]);

  const handleGenerateAttendanceKey = async () => {
    const key = Math.floor(1000 + Math.random() * 9000);
    
    try {
      const updatedEvent = {
        ...event,
        attendanceKey: key.toString()
      };

      await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEvent)
      });

      setEvent(updatedEvent);
      setGeneratedKey(key.toString());
      setShowGeneratedKey(true);
    } catch (error) {
      console.error('Error generating attendance key:', error);
      alert('Error generating attendance key');
    }
  };

  const handleMarkAttendance = async (registrationId, attended) => {
    try {
      const registration = registrations.find(r => r.id === registrationId);
      
      const updatedRegistration = {
        ...registration,
        attended: attended,
        attendanceTime: attended ? getSingaporeTime() : null
      };

      await fetch(`${API_URL}/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRegistration)
      });

      setRegistrations(registrations.map(r => 
        r.id === registrationId ? updatedRegistration : r
      ));

      // Update event stats
      const attendedCount = registrations.filter(r => r.attended).length + (attended ? 1 : -1);
      const updatedEvent = {
        ...event,
        stats: {
          ...event.stats,
          attended: attendedCount,
          attendanceRate: Math.round((attendedCount / registrations.length) * 100)
        }
      };

      await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEvent)
      });

      setEvent(updatedEvent);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Error updating attendance');
    }
  };

  const filteredParticipants = registrations.filter(participant =>
    participant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.adminNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || !event) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const attendedCount = registrations.filter(r => r.attended).length;
  const attendanceRate = registrations.length > 0 
    ? Math.round((attendedCount / registrations.length) * 100) 
    : 0;

  return (
    <main className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1200px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Event Management Dashboard</h3>
          <button 
            className="btn-close" 
            onClick={() => navigate(-1)}
            aria-label="Close"
          ></button>
        </div>

        <hr />

        <div className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="mb-2">{event.title}</h5>
                <p className="text-muted small mb-0">
                  Date: {event.date} • {event.time} | Location: {event.location}
                </p>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/edit-event/${id}`)}
                >
                  Edit Event Details
                </button>
              </div>
            </div>

            <div className="row g-4 mt-3">
              <div className="col-auto text-center">
                <h6 className="text-muted small mb-1">Registered</h6>
                <h4 className="mb-0">{event.stats?.registered || 0}</h4>
              </div>
              <div className="col-auto text-center">
                <h6 className="text-muted small mb-1">Attended</h6>
                <h4 className="mb-0">{attendedCount}</h4>
              </div>
              <div className="col-auto text-center">
                <h6 className="text-muted small mb-1">Attendance Rate</h6>
                <h4 className="mb-0">{attendanceRate}%</h4>
              </div>
              <div className="col-auto text-center">
                <h6 className="text-muted small mb-1">Spots Remaining</h6>
                <h4 className="mb-0">{event.spotsRemaining}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <div className="mb-4">
              <div className="btn-group" role="tablist">
                <button 
                  className={`btn ${activeTab === 'participants' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('participants')}
                >
                  Participants ({registrations.length})
                </button>
                <button 
                  className={`btn ${activeTab === 'attended' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('attended')}
                >
                  Attended ({attendedCount})
                </button>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-between align-items-center mb-4">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: '400px' }}
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-secondary"
                  onClick={handleGenerateAttendanceKey}
                >
                  Generate Attendance Key
                </button>
              </div>
            </div>

            {activeTab === 'participants' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Admin No</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Registration Date</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map(participant => (
                      <tr key={participant.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                              style={{ width: '40px', height: '40px', fontSize: '12px' }}
                            >
                              {getInitials(participant.fullName)}
                            </div>
                            <div>
                              <p className="mb-0">{participant.fullName}</p>
                            </div>
                          </div>
                        </td>
                        <td>{participant.adminNo}</td>
                        <td>{participant.email}</td>
                        <td>{participant.course}</td>
                        <td>{participant.registrationDate}</td>
                        <td>
                          <span className={`badge ${participant.attended ? 'bg-success' : 'bg-secondary'}`}>
                            {participant.attended ? 'Attended' : 'Not Attended'}
                          </span>
                        </td>
                        <td>
                          {!participant.attended && (
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleMarkAttendance(participant.id, true)}
                            >
                              Mark Attended
                            </button>
                          )}
                          {participant.attended && (
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleMarkAttendance(participant.id, false)}
                            >
                              Undo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'attended' && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Admin No</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Attendance Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants
                      .filter(p => p.attended)
                      .map(participant => (
                      <tr key={participant.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                              style={{ width: '40px', height: '40px', fontSize: '12px' }}
                            >
                              {getInitials(participant.fullName)}
                            </div>
                            <div>
                              <p className="mb-0">{participant.fullName}</p>
                            </div>
                          </div>
                        </td>
                        <td>{participant.adminNo}</td>
                        <td>{participant.email}</td>
                        <td>{participant.course}</td>
                        <td>{formatSingaporeTime(participant.attendanceTime)}</td>
                        <td>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleMarkAttendance(participant.id, false)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGeneratedKey && (
        <GeneratedAttendanceKeyModal 
          attendanceKey={generatedKey}
          eventTitle={event.title}
          onClose={() => setShowGeneratedKey(false)}
        />
      )}
    </main>
  );
}

export default EventManagement;