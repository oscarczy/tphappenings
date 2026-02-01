import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://tphappenings.onrender.com';

function OrganiserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Registered Events', value: '0' },
    { label: 'Upcoming Events', value: '0' },
    { label: 'Events Created', value: '0' }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events`);
        const allEvents = await response.json();

        // Normalize IDs - ensure every event has an id field
        const normalizedEvents = allEvents.map(e => ({
          ...e,
          id: e.id || e._id
        }));

        // Filter events created by the current organizer
        const createdByOrganizer = normalizedEvents.filter(
          event => event.organizer === user?.name
        );

        // Get other events as recommendations
        const otherEvents = normalizedEvents.filter(
          event => event.organizer !== user?.name
        );

        setUpcomingEvents(createdByOrganizer.slice(0, 3));
        setRecommendedEvents(otherEvents.slice(0, 3));

        // Fetch registrations to count how many events the user has registered for
        const registrationsResponse = await fetch(`${API_URL}/registrations`);
        const registrations = await registrationsResponse.json();
        
        // Count registrations for this user
        const userRegistrations = registrations.filter(
          reg => reg.userId === user?.id || reg.userEmail === user?.email
        );

        // Update stats
        setStats([
          { label: 'Registered Events', value: String(userRegistrations.length) },
          { label: 'Upcoming Events', value: String(createdByOrganizer.length) },
          { label: 'Events Created', value: String(createdByOrganizer.length) }
        ]);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) {
      fetchEvents();
    }
  }, [user?.name, user?.id, user?.email]);

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
    <main className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <h2 className="mb-5">My Dashboard</h2>

        {/* Stats Cards */}
        <div className="row mb-5 g-4">
          {stats.map((stat, index) => (
            <div key={index} className="col-md-4">
              <div className="card shadow-sm text-center p-4">
                <p className="text-muted mb-2">{stat.label}</p>
                <h2 className="display-5 fw-bold">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Events Section */}
        <div className="row g-4">
          {/* My Upcoming Events */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">My Upcoming Events</h5>

                <div className="list-group list-group-flush">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                          <h6 className="mb-1">{event.title}</h6>
                          <small className="text-muted">{event.date} • {event.time}</small>
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/event-management/${event._id}`)}
                        >
                          Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No events created yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended For You */}
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Recommended For You</h5>

                <div className="list-group list-group-flush">
                  {recommendedEvents.length > 0 ? (
                    recommendedEvents.map((event) => (
                      <div key={event._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                          <h6 className="mb-1">{event.title}</h6>
                          <small className="text-muted">{event.date} • {event.time}</small>
                        </div>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => navigate(`/events/${event._id}/register`)}
                        >
                          Register
                        </button>
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
    </main>
  );
}

export default OrganiserDashboard;