function HeroSection({ searchQuery, setSearchQuery, onSearch }) {
  return (
    <section className="hero-section text-white text-center py-5" style={{ backgroundColor: '#999', minHeight: '300px' }}>
      <div className="container py-4">
        <h1 className="display-4 fw-bold mb-3">Happenings @ TP</h1>
        <p className="lead mb-4">
          Never miss out on workshops, talks, competitions, and social activities happening around TP.
        </p>
        
        <form onSubmit={onSearch} className="search-bar mx-auto" style={{ maxWidth: '600px' }}>
          <div className="input-group input-group-lg">
            <input
              type="text"
              className="form-control"
              placeholder="Search for events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-dark px-4" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default HeroSection;