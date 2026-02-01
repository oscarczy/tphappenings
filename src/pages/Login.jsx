import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.userType === 'organiser' ? '/organiser-dashboard' : '/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Perform login
      const userData = await login(formData.email, formData.password, userType);
      
      // Redirect will happen automatically via useEffect because user state will change
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is logged in
  if (user) {
    return null;
  }

  return (
    <main className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-sm" style={{ width: '400px' }}>
        <div className="card-body p-5">
          <h3 className="text-center mb-3">Welcome to TPHappenings</h3>
          <p className="text-center text-muted mb-4">Sign in to your account</p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* User Type Toggle */}
          <div className="btn-group w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn ${userType === 'student' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`btn ${userType === 'organiser' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setUserType('organiser')}
            >
              Organiser
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">TP Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="text-end mb-3">
              <a href="#" className="text-decoration-none small">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-dark w-100 py-2 mb-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center mb-0">
              Don't have an account? <a href="#" className="text-decoration-none">Sign up here</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;