import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://tphappenings.onrender.com';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    maxParticipants: '',
    image: null
  });
  const [originalData, setOriginalData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['Workshop', 'Seminar', 'Conference', 'Networking', 'Competition', 'Other'];

  const convertDateToInput = (dateString) => {
    if (!dateString) {
      return '';
    }
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const parts = dateString.replace(',', '').trim().split(/\s+/);
    
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, '0');
      const monthStr = parts[1];
      const month = months[monthStr];
      const year = parts[2];
      
      if (month && year && day) {
        return `${year}-${month}-${day}`;
      }
    }
    
    return dateString;
  };

  const parseTimeRange = (timeString) => {
    // Parse time interval format
    if (!timeString || !timeString.includes('-')) {
      return { startTime: '', endTime: '' };
    }

    const [start, end] = timeString.split('-').map(t => t.trim());
    
    const convertTo24Hour = (time12h) => {
      const [time, period] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    return {
      startTime: convertTo24Hour(start),
      endTime: convertTo24Hour(end)
    };
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/events/${id}`);
        if (response.ok) {
          const event = await response.json();
          const { startTime, endTime } = parseTimeRange(event.time);
          
          const eventData = {
            title: event.title || '',
            description: event.description || '',
            date: convertDateToInput(event.date) || '',
            startTime: startTime,
            endTime: endTime,
            location: event.location || '',
            category: event.category || '',
            maxParticipants: event.maxParticipants || '',
            image: event.image || null
          };
          setFormData(eventData);
          setOriginalData(eventData);
          
          // Set existing image as preview
          if (event.image) {
            setImagePreview(event.image);
          }
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          image: base64String
        }));
        setImagePreview(base64String);
      };
      
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateForDB = (dateString) => {
    if (dateString.includes('Jan') || dateString.includes('Feb') || dateString.includes('Mar') || 
        dateString.includes('Apr') || dateString.includes('May') || dateString.includes('Jun') ||
        dateString.includes('Jul') || dateString.includes('Aug') || dateString.includes('Sep') ||
        dateString.includes('Oct') || dateString.includes('Nov') || dateString.includes('Dec')) {
      return dateString;
    }
    
    const date = new Date(dateString + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.date !== originalData.date ||
      formData.startTime !== originalData.startTime ||
      formData.endTime !== originalData.endTime ||
      formData.location !== originalData.location ||
      formData.category !== originalData.category ||
      formData.maxParticipants !== originalData.maxParticipants ||
      formData.image !== originalData.image
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      alert('No changes detected. Please modify at least one field to update the event.');
      return;
    }

    // Validate end time is after start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      const currentEventResponse = await fetch(`${API_URL}/events/${id}`);
      const currentEvent = await currentEventResponse.json();

      const timeRange = `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;

      const updatedEvent = {
        ...currentEvent,
        title: formData.title,
        description: formData.description,
        date: formatDateForDB(formData.date),
        time: timeRange,
        location: formData.location,
        category: formData.category,
        maxParticipants: parseInt(formData.maxParticipants) || 0,
        image: formData.image,
        spotsRemaining: Math.min(
          parseInt(formData.maxParticipants) || 0,
          (currentEvent.maxParticipants - (currentEvent.maxParticipants - currentEvent.spotsRemaining))
        )
      };

      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEvent)
      });

      if (response.ok) {
        alert('Event updated successfully!');
        navigate(`/event-management/${id}`, { state: { refresh: Date.now() } });
      } else {
        alert('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/events/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const registrationsResponse = await fetch(`${API_URL}/registrations`);
          const registrations = await registrationsResponse.json();
          
          const eventRegistrations = registrations.filter(reg => reg.eventId === id);
          
          for (const reg of eventRegistrations) {
            await fetch(`${API_URL}/registrations/${reg.id}`, {
              method: 'DELETE'
            });
          }

          alert('Event deleted successfully!');
          navigate('/organiser-dashboard');
        } else {
          alert('Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <main className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Edit Event Details</h2>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => navigate(-1)}
          ></button>
        </div>
        <hr />

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div
                className="card-body p-5"
                style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div></div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Event Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Event Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Category</label>
                      <select
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Max Participants</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Event Image</label>
                      <input
                        type="file"
                        className="form-control"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="mb-4">
                      <label className="form-label fw-bold">Current/Preview Image</label>
                      <div className="border rounded p-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-dark w-100 py-2 fw-bold mb-2">
                    Edit Event
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger w-100 py-2 fw-bold"
                    onClick={handleDelete}
                  >
                    Delete Event
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EditEvent;