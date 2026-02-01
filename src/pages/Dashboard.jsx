import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import NotifyMeModal from '../components/NotifyMeModal';

const API_URL = 'http://localhost:5050';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    registered: 0,
    upcoming: 0,
    attended: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  // Convert event date string to Date object
  const parseEventDate = (dateString) => {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    // Remove comma and split
    const parts = dateString.replace(',', '').trim().split(/\s+/);
    
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      
      if (month !== undefined) {
        return new Date(year, month, day, 0, 0, 0);
      }
    }
    
    return null;
  };

  // Get start time from time range
  const parseEventTime = (timeString) => {
    if (!timeString) return { hours: 0, minutes: 0 };
    
    const startTime = timeString.split('-')[0].trim();
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return { hours, minutes };
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch all events
        const eventsResponse = await fetch(`${API_URL}/events`);
        const allEventsRaw = await eventsResponse.json();

        // Normalize IDs
        const allEvents = allEventsRaw.map(e => ({
          ...e,
          id: e.id || e._id
        }));

        // Fetch registrations
        const registrationsResponse = await fetch(`${API_URL}/registrations`);
        const registrations = await registrationsResponse.json();

        // Filter registrations for current user
        const userRegistrations = registrations.filter(
          reg => reg.userId === user?.id || reg.email === user?.email
        );

        // Get registered event IDs
        const registeredEventIds = userRegistrations.map(reg => reg.eventId);

        // Filter events user has registered for
        const registeredEvents = allEvents.filter(event => 
          registeredEventIds.includes(event._id)
        );

        // Filter upcoming events (today or later)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingRegisteredEvents = registeredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });

        // Count attended events
        const attendedCount = userRegistrations.filter(reg => reg.attended === true).length;

        // Get recommended events (events user hasn't registered for)
        const recommendedEventsFiltered = allEvents.filter(event => 
          !registeredEventIds.includes(event._id)
        );

        // Update state
        setStats({
          registered: userRegistrations.length,
          upcoming: upcomingRegisteredEvents.length,
          attended: attendedCount
        });

        setUpcomingEvents(upcomingRegisteredEvents.slice(0, 10));
        setRecommendedEvents(recommendedEventsFiltered.slice(0, 3));

      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?.email) {
      fetchEvents();
    }
  }, [user?.id, user?.email]);

  if (loading) {
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
        {/* Header */}
        <div className="mb-4">
          <h2 className="mb-1">My Dashboard</h2>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm text-center">
              <div className="card-body py-4">
                <h6 className="text-muted mb-2">Registered Events</h6>
                <h2 className="mb-0 fw-bold">{stats.registered}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm text-center">
              <div className="card-body py-4">
                <h6 className="text-muted mb-2">Upcoming Events</h6>
                <h2 className="mb-0 fw-bold">{stats.upcoming}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm text-center">
              <div className="card-body py-4">
                <h6 className="text-muted mb-2">Events Attended</h6>
                <h2 className="mb-0 fw-bold">{stats.attended}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="row g-4">
          {/* Left Column - My Upcoming Events */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">My Upcoming Events</h5>
                  <button 
                    className="btn btn-dark btn-sm"
                    onClick={() => setShowNotifyModal(true)}
                  >
                    <i className="bi bi-bell"></i> Notify Me!
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                      <div key={event._id} className="border-bottom pb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{event.title}</h6>
                            <p className="text-muted small mb-0">
                              {event.date} • {event.time}
                            </p>
                          </div>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/events/${event._id}`)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No upcoming events</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recommended For You */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">Recommended For You</h5>

                <div className="d-flex flex-column gap-3">
                  {recommendedEvents.length > 0 ? (
                    recommendedEvents.map(event => (
                      <div key={event._id} className="border-bottom pb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{event.title}</h6>
                            <p className="text-muted small mb-0">
                              {event.date} • {event.time}
                            </p>
                          </div>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/events/${event._id}/register`)}
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No recommendations available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notify Me Modal */}
      <NotifyMeModal 
        show={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        userEmail={user?.email}
      />
    </main>
  );
}

export default Dashboard;
