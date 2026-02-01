import { useState } from 'react';
import EventCard from '../components/EventCard';
import FilterButtons from '../components/FilterButtons';
import { useEvents } from '../context/EventContext';

function Events() {
  const { events, loading } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleFilter = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === category));
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

  const displayEvents = filteredEvents.length > 0 ? filteredEvents : events;

  return (
    <main className="py-5">
      <div className="container">
        <h2 className="mb-4">All Events</h2>
        
        <FilterButtons activeCategory={activeCategory} onFilter={handleFilter} />
        
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {displayEvents.map(event => (
            <div key={event._id} className="col">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Events;
