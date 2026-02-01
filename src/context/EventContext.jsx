import { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'https://tphappenings.onrender.com';

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();

      // Normalize IDs for all events
      const normalized = data.map(e => ({
        ...e,
        id: e.id || e._id
      }));

      setEvents(normalized);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (newEvent) => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        const createdEvent = await response.json();
        setEvents([...events, createdEvent]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  };

  return (
    <EventContext.Provider value={{ events, loading, fetchEvents }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}