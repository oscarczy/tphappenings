import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

// API URL for event-related requests
const API_URL = 'http://localhost:5050';

function CreateEvent() {
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
    const [imagePreview, setImagePreview] = useState(null);

    // Event categories
    const categories = ['Workshop', 'Seminar', 'Conference', 'Networking', 'Competition', 'Other'];

    // Handle input changes
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

    // Format time from 24-hour to 12-hour format
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Format date to "DD MMM YYYY"
    const formatDate = (isoDate) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that end time is after start time
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            alert('End time must be after start time');
            return;
        }

        // Validate user is logged in
        if (!user || !user.id) {
            alert('You must be logged in as an organiser to create an event');
            return;
        }

        try {
            // Create new event object in MongoDB format
            const timeRange = `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;
            const newEvent = {
                title: formData.title,
                description: formData.description,
                date: formatDate(formData.date), 
                time: timeRange, 
                location: formData.location,
                category: formData.category,
                maxParticipants: parseInt(formData.maxParticipants) || 0,
                spotsRemaining: parseInt(formData.maxParticipants) || 0,
                organizer: user.name,
                organizerId: user.id, 
                organizerAvatar: user.name?.charAt(0).toUpperCase() || 'OR',
                image: formData.image || '',
                attendanceKey: null,
                stats: {
                    registered: 0,
                    attended: 0,
                    attendanceRate: 0
                }
            };

            console.log('Sending event data:', newEvent); // Debug log

            // Send new event to the server
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEvent)
            });

            // Handle response
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(`Failed to create event: ${errorData.message}`);
                return;
            }

            const createdEvent = await response.json();
            console.log('Event created successfully:', createdEvent);
            alert('Event created successfully!');
            navigate('/organiser-dashboard');
        } catch (error) {
            console.error('Error creating event:', error);
            alert(`Error creating event: ${error.message}`);
        }
    };

    return (
        <main className="py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="container">
                <div className="mb-4">
                    <h2 className="mb-3">Create New Event</h2>
                    <hr />
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-body p-5">
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
                                                min="1"
                                                required
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
                                            <label className="form-label fw-bold">Image Preview</label>
                                            <div className="border rounded p-2">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" className="btn btn-dark w-100 py-2 fw-bold">
                                        Create Event
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

export default CreateEvent;