import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireOrganiser = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

// Check if user is logged in
if (!user) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/login" replace />;
}

  // Check if organiser role is required
  if (requireOrganiser && user.userType !== 'organiser') {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;