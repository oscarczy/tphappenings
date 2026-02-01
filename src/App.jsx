import { Routes, Route, useNavigate } from 'react-router';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventRegistration from './pages/EventRegistration';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrganiserDashboard from './pages/OrganiserDashboard';
import EventManagement from './pages/EventManagement';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <main className="py-5">
      <div className="container text-center">
        <div className="py-5">
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-muted mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button 
              className="btn btn-dark"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/register" element={<EventRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organiser-dashboard" 
            element={
              <ProtectedRoute requireOrganiser>
                <OrganiserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/event-management/:id" 
            element={
              <ProtectedRoute requireOrganiser>
                <EventManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <ProtectedRoute requireOrganiser>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-event/:id" 
            element={
              <ProtectedRoute requireOrganiser>
                <EditEvent />
              </ProtectedRoute>
            } 
          />
          {/* Wildcard route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;