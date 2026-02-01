import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { fetchEvents } = useEvents();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    fetchEvents();
  };

  return (
    <header className="bg-dark text-white py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Link to="/" className="text-white text-decoration-none">
            <h4 className="mb-0">
              <span className="text-danger">TP</span>Happenings
            </h4>
          </Link>

          {/* Navigation - Centered */}
          <nav className="d-flex align-items-center gap-4">
            <Link to="/" className="text-white text-decoration-none" onClick={handleHomeClick}>
              Home
            </Link>
            {user && (
              <>
                <Link 
                  to={user.userType === 'organiser' ? '/organiser-dashboard' : '/dashboard'} 
                  className="text-white text-decoration-none"
                >
                  My Dashboard
                </Link>
                {user.userType === 'organiser' && (
                  <Link 
                    to="/create-event" 
                    className="text-white text-decoration-none"
                  >
                    Create Event
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-white">
                    {user.name} ({user.userType === 'organiser' ? 'Organizer' : 'Student'})
                  </span>
                </div>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;