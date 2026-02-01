// FilterButtons component for displaying and managing filter options
function FilterButtons({ filters, activeFilter, setActiveFilter }) {
    return (
        <section className="filters-section py-4 bg-light">
            <div className="container">
                <div className="d-flex gap-2 flex-wrap">
                    {/* Map through filters array to create a button for each filter */}
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            className={`btn ${activeFilter === filter ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FilterButtons;