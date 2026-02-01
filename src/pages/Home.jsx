import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import EventCard from '../components/EventCard';
import { useEvents } from '../context/EventContext';

function Home() {
  const { events, loading, fetchEvents } = useEvents(); // ✅ get fetchEvents
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Workshop', 'Seminar', 'Conference', 'Networking', 'Competition', 'Other'];

  // ✅ Refetch when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEvents(); // Call from context
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchEvents]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setFilteredEvents([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = events.filter(event => 
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.category?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.organizer?.toLowerCase().includes(query)
    );

    setFilteredEvents(results);
  };

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    setSearchQuery('');
    setFilteredEvents([]);
  };

  // Apply both search and category filters
  let displayEvents = searchQuery.trim() ? filteredEvents : events;
  
  if (activeCategory !== 'All' && !searchQuery.trim()) {
    displayEvents = events.filter(event => event.category === activeCategory);
  } else if (activeCategory !== 'All' && searchQuery.trim()) {
    displayEvents = filteredEvents.filter(event => event.category === activeCategory);
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main>
      <HeroSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              {searchQuery.trim() 
                ? `Search Results for "${searchQuery}" (${displayEvents.length})` 
                : 'Events'}
            </h2>
            {searchQuery.trim() && (
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilteredEvents([]);
                }}
              >
                Clear Search
              </button>
            )}
          </div>

          <hr />

          {/* Category Filter Buttons */}
          <div className="d-flex gap-2 mb-4 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                className={`btn ${activeCategory === category ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {displayEvents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {searchQuery.trim() 
                  ? 'No events found matching your search.' 
                  : `No ${activeCategory === 'All' ? '' : activeCategory} events available.`}
              </p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {displayEvents.map(event => (
                <div key={event._id} className="col">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;