import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import AttendanceKeyModal from '../components/AttendanceKeyModal';
import Home from './Home';

const API_URL = import.meta.env.VITE_API_URL || 'https://tphappenings.onrender.com';

function EventDetails() {
    // Route parameters and navigation
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { fetchEvents } = useEvents();
    
    // State management
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [hasAttended, setHasAttended] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState('');

    // Fetch event details and check user registration status
    useEffect(() => {
        const fetchEventAndCheckRegistration = async () => {
            try {
                // Fetch event data
                const eventResponse = await fetch(`${API_URL}/events/${id}`);
                if (eventResponse.ok) {
                    const eventData = await eventResponse.json();
                    setEvent(eventData);

                    // Check if user is registered for this event
                    if (user?.id) {
                        const registrationsResponse = await fetch(`${API_URL}/registrations`);
                        const registrations = await registrationsResponse.json();
                        
                        const userRegistration = registrations.find(
                            reg => (reg.userId === user.id || reg.email === user.email) && reg.eventId === id
                        );
                        
                        setIsRegistered(!!userRegistration);
                        if (userRegistration) {
                            setHasAttended(userRegistration.attended === true);
                        }
                    }
                } else {
                    setError(`Event not found. Status: ${eventResponse.status}`);
                }
            } catch (error) {
                console.error('Error loading event:', error);
                setError('Failed to load event');
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndCheckRegistration();
    }, [id, user?.id, user?.email]);

    // Handle registration button click
    const handleRegisterClick = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/events/${id}/register`);
    };

    // Handle unregistration with confirmation
    const handleUnregisterClick = async () => {
        if (!window.confirm('Are you sure you want to unregister from this event?')) {
            return;
        }

        try {
            // Fetch all registrations and find the user's registration
            const regResponse = await fetch(`${API_URL}/registrations`);
            const allRegistrations = await regResponse.json();
            
            const userRegistration = allRegistrations.find(
                reg => String(reg.userId) === String(user.id) && String(reg.eventId) === String(id)
            );

            if (!userRegistration) {
                alert('Registration not found');
                return;
            }

            // Delete the registration using its ID
            const deleteResponse = await fetch(`${API_URL}/registrations/${userRegistration._id}`, {
                method: 'DELETE'
            });

            if (!deleteResponse.ok) {
                throw new Error('Failed to delete registration');
            }

            // Update event stats
            const updatedEvent = {
                ...event,
                spotsRemaining: event.spotsRemaining + 1,
                stats: {
                    ...event.stats,
                    registered: Math.max(0, event.stats.registered - 1)
                }
            };

            await fetch(`${API_URL}/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent)
            });

            setIsRegistered(false);
            setEvent(updatedEvent);
            alert('You have been unregistered from this event');
            
            // Redirect to appropriate dashboard based on user type
            if (user.userType === 'organiser') {
                navigate('/organiser-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error unregistering:', error);
            alert('Error unregistering from event: ' + error.message);
        }
    };

    // Handle attendance submission with attendance key
    const handleAttendanceSubmit = async (key) => {
        try {
            // Fetch all registrations and find user's registration
            const regResponse = await fetch(`${API_URL}/registrations`);
            const allRegistrations = await regResponse.json();
            
            const userRegistration = allRegistrations.find(
                reg => String(reg.userId) === String(user.id) && String(reg.eventId) === String(id)
            );

            if (!userRegistration) {
                alert('Registration not found');
                return;
            }

            // Update registration with attendance
            const updatedRegistration = {
                ...userRegistration,
                attended: true,
                attendanceTime: new Date().toISOString()
            };

            const updateResponse = await fetch(`${API_URL}/registrations/${userRegistration._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRegistration)
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update attendance');
            }

            // Update event stats
            const updatedEvent = {
                ...event,
                stats: {
                    ...event.stats,
                    attended: (event.stats.attended || 0) + 1,
                    attendanceRate: Math.round(
                        (((event.stats.attended || 0) + 1) / (event.stats.registered || 1)) * 100
                    )
                }
            };

            await fetch(`${API_URL}/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent)
            });

            setHasAttended(true);
            setEvent(updatedEvent);
            setShowAttendanceModal(false);
            setAttendanceMessage('Attendance successfully recorded!');
        } catch (error) {
            console.error('Error recording attendance:', error);
            alert('Error recording attendance: ' + error.message);
        }
    };

    // Render error state
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

    // Render loading state
    if (loading || !event) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Check if registration is closed
    const isRegistrationClosed = event.spotsRemaining === 0;

    return (
        <main className="py-4">
            <div className="container">
                {/* Close button */}
                <div className="d-flex justify-content-end mb-4">
                    <button
                        className="btn-close"
                        onClick={() => navigate('/')}
                        aria-label="Close"
                    ></button>
                </div>

                <div className="row">
                    {/* Main event content - Left column */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm mb-4">
                            {/* Event banner image */}
                            <div 
                                className="p-5 text-center d-flex align-items-center justify-content-center"
                                style={{ 
                                    height: '300px', 
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
                                    '[Event Banner Image]'
                                )}
                            </div>
                            
                            {/* Event details */}
                            <div className="card-body p-4">
                                <h1 className="mb-3 fw-bold">{event.title}</h1>
                                
                                {/* Date, time, location, and category */}
                                <div className="mb-3">
                                    <p className="mb-2"><i className="bi bi-calendar"></i> {event.date} • {event.time}</p>
                                    <p className="mb-2"><i className="bi bi-geo-alt"></i> {event.location}</p>
                                    <p className="mb-2">
                                        <span className="badge bg-dark">{event.category}</span>
                                    </p>
                                </div>

                                <hr />

                                {/* Event description */}
                                <h5>About this event</h5>
                                <p>{event.description}</p>

                                <hr />

                                {/* Organizer information */}
                                <div className="d-flex align-items-center">
                                    <div 
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        {event.organizerAvatar}
                                    </div>
                                    <div className="ms-3">
                                        <h6 className="mb-0">{event.organizer}</h6>
                                        <small className="text-muted">Organizer</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration sidebar - Right column */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                            {/* Registration status header */}
                            <div className={`card-header text-center py-3 ${isRegistrationClosed && !isRegistered ? 'bg-danger' : 'bg-info'}`}>
                                <strong>
                                    {isRegistered ? 'You\'re Registered' : isRegistrationClosed ? 'Registration Closed' : 'Registration Open'}
                                </strong>
                            </div>
                            
                            <div className="card-body">
                                {/* Available spots */}
                                <p className="text-center mb-4">
                                    <strong>{event.spotsRemaining}</strong> spots remaining out of <strong>{event.maxParticipants}</strong>
                                </p>

                                {/* Success message for attendance */}
                                {attendanceMessage && (
                                    <div className="alert alert-success mb-3" role="alert">
                                        {attendanceMessage}
                                    </div>
                                )}

                                {/* Conditional buttons based on registration status */}
                                {isRegistered ? (
                                    <>
                                        <button className="btn btn-success w-100 mb-2" disabled>
                                            Registered
                                        </button>
                                        
                                        {/* Attendance button or mark as attended */}
                                        {hasAttended ? (
                                            <button className="btn btn-success w-100 mb-2" disabled>
                                                Attendance Recorded
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn btn-outline-secondary w-100 mb-2"
                                                onClick={() => setShowAttendanceModal(true)}
                                            >
                                                Enter Attendance Key
                                            </button>
                                        )}

                                        {/* Unregister button */}
                                        <button 
                                            className="btn btn-danger w-100"
                                            onClick={handleUnregisterClick}
                                        >
                                            Unregister
                                        </button>
                                    </>
                                ) : isRegistrationClosed ? (
                                    <button className="btn btn-danger w-100 mb-2" disabled>
                                        Registration Closed
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        className="btn btn-dark w-100 mb-2"
                                        onClick={handleRegisterClick}
                                    >
                                        Register Now
                                    </button>
                                )}

                                {/* Additional action buttons */}
                                <button type="button" className="btn btn-outline-secondary w-100 mt-2">
                                    Add to Calendar
                                </button>
                                <button type="button" className="btn btn-outline-secondary w-100 mt-2">
                                    Share Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance key modal */}
            {showAttendanceModal && (
                <AttendanceKeyModal 
                    eventId={id}
                    onClose={() => setShowAttendanceModal(false)}
                    onSubmit={handleAttendanceSubmit}
                />
            )}
        </main>
    );
}

export default EventDetails;