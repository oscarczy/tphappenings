import { useNavigate } from 'react-router';

function EventCard({ event }) {
    // Hook to navigate to different routes
    const navigate = useNavigate();

    // Handle register button click - navigate to event details page
    const handleRegisterClick = (e) => {
        e.preventDefault();
        navigate(`/events/${event._id}`);
    };

    return (
        <div className="card h-100 shadow-sm">
            {/* Event image section - displays image or placeholder */}
            <div 
                className="card-img-top d-flex align-items-center justify-content-center"
                style={{ 
                    height: '200px', 
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
            
            {/* Card content section */}
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{event.title}</h5>
                
                {/* Event date, time, and location info */}
                <div className="text-muted small mb-3">
                    <p className="mb-1">
                        <i className="bi bi-calendar"></i> {event.date} • {event.time}
                    </p>
                    <p className="mb-0">
                        <i className="bi bi-geo-alt"></i> {event.location}
                    </p>
                </div>

                {/* Event description */}
                <p className="card-text text-muted flex-grow-1">
                    {event.description}
                </p>

                {/* Category badge and available spots */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-secondary">{event.category}</span>
                    <small className="text-muted">{event.spotsRemaining} spots left</small>
                </div>

                {/* Register button - navigates to event details */}
                <button 
                    className="btn btn-dark w-100"
                    onClick={handleRegisterClick}
                >
                    Register
                </button>
            </div>
        </div>
    );
}

export default EventCard;