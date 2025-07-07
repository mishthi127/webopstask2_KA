import React, { useState, useEffect, useRef } from "react";

// Main App Component
function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // API URL for fetching movie data
  const API_URL = "https://jsonfakery.com/movies/paginated";

  useEffect(() => {
    async function fetchMoviesData() {
      setLoading(true); 
      setError(null); 
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        console.log("API Response:", data); 

        if (data && data.data && Array.isArray(data.data)) {
          console.log("First movie:", data.data[0]); // Debug log
          setMovies(data.data); // Update the movies state with the fetched data
        } else {
          setMovies([]); 
          setError("No movies found in the response.");
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(
          "Failed to load movies. Please check your network or API endpoint."
        );
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (success or error)
      }
    }

    fetchMoviesData(); 
  }, []); 

 
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie); 
    setShowModal(true); 
  };

  
  const handleCloseModal = () => {
    setShowModal(false); 
    setSelectedMovie(null); 
  };

  return (
    
    <div className="min-h-screen bg-[#181818] text-white font-sans flex flex-col">
      {/* Header Section */}
      <header className="text-center py-8 bg-black rounded-b-lg">
        <h1 className="text-4xl font-bold text-[#e50914] mb-2">
          Movie Browser
        </h1>
        <p className="text-gray-300">Click on any movie to see details</p>
      </header>

      {/* Main Content Section */}
      <section className="flex-grow">
        <h2 className="ml-10 mt-8 text-xl text-white font-semibold section-title">
          All Movies
        </h2>
        
        {loading && (
          <div className="text-white text-lg py-16 text-center loader">
            Loading movies...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-lg py-16 text-center loader">
            {error}
          </div>
        )}
        {!loading && !error && movies.length === 0 && (
          <div className="text-white text-lg py-16 text-center loader">
            No movies found.
          </div>
        )}
        {!loading && !error && movies.length > 0 && (
          // MovieList component to display the grid of movie cards
          <MovieList movies={movies} onMovieClick={handleMovieClick} />
        )}
      </section>

      {// Movie Details Modal }
      {showModal && selectedMovie && (
        <MovieDetailsModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </div>
  );
}

// MovieList Component: Displays a grid of MovieCard components
function MovieList({ movies, onMovieClick }) {
  return (
    <div className="movie-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 p-8 justify-items-center">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id || movie.title}
          movie={movie}
          onClick={onMovieClick}
        />
      ))}
    </div>
  );
}

// MovieCard Component: Represents a single movie in the grid
function MovieCard({ movie, onClick }) {
  // Function to get the correct poster URL, handling variations and fallbacks
  const getPosterUrl = () => {
    return (
      movie.poster_path ||
      movie.poster ||
      `https://placehold.co/180x260/555/FFF?text=No+Poster`
    );
  };

  // Function to get the movie title and year, handling variations
  const getMovieTitleAndYear = () => {
    const movieTitle =
      movie.title || movie.name || movie.original_title || "Untitled Movie";
    const movieYear = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : movie.year || "";
    return movieYear ? `${movieTitle} (${movieYear})` : movieTitle;
  };

  return (
    <div
      className="movie-card min-w-[240px] max-w-[320px] h-[340px] bg-[#222] rounded-2xl shadow-lg cursor-pointer transition-transform duration-200 ease-in-out flex items-end relative overflow-hidden
                 hover:scale-107 hover:shadow-xl hover:shadow-[rgba(229,9,20,0.3)]"
      onClick={() => onClick(movie)} 
    >
      {// Poster image, positioned absolutely to fill the card }
      <img
        src={getPosterUrl()}
        alt={getMovieTitleAndYear()}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        // Fallback for image loading errors, using a more noticeable placeholder
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/180x260/E50914/FFFFFF?text=No+Poster+Available`;
        }}
      />
      
      <div
        className="movie-title w-full p-4 text-xl font-semibold text-white text-center
                      bg-gradient-to-t from-black via-transparent to-transparent absolute bottom-0 left-0 right-0
                      rounded-b-2xl min-h-[60px] flex items-end justify-center"
      >
        {getMovieTitleAndYear()}
      </div>
    </div>
  );
}


function MovieDetailsModal({ movie, onClose }) {
  
  const modalContentRef = useRef(null);

  
  const getMovieDetails = () => {
    const title =
      movie.title || movie.name || movie.original_title || "Untitled Movie";
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : movie.year || "Unknown";
    const director = movie.director || movie.directors || "Unknown Director";
    const plot =
      movie.overview || movie.plot || movie.description || "No plot available.";
    const poster =
      movie.poster_path ||
      movie.poster ||
      `https://placehold.co/300x450/333/fff?text=No+Poster`;
    const rating = movie.vote_average || movie.rating || "N/A";
    const releaseDate = movie.release_date || movie.year || "Unknown"; 

    
    const cast = Array.isArray(movie.cast)
      ? movie.cast
      : Array.isArray(movie.actors)
      ? movie.actors
      : movie.credits && Array.isArray(movie.credits.cast)
      ? movie.credits.cast
      : [];

    return { title, year, director, plot, poster, rating, releaseDate, cast };
  };

  const { title, year, director, plot, poster, rating, releaseDate, cast } =
    getMovieDetails();

  
  const handleOutsideClick = (event) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(event.target)
    ) {
      onClose();
    }
  };

  
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    // Modal overlay, fixed position to cover the entire screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      id="modal"
    >
      
      <div
        ref={modalContentRef}
        className="modal-content bg-[#222] rounded-xl max-w-3xl w-11/12 max-h-[90vh] overflow-y-auto relative shadow-2xl"
      >
       
        <span
          className="close absolute right-6 top-5 text-3xl text-white cursor-pointer z-10
                     bg-black bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center
                     transition-colors duration-300 hover:bg-[#e50914] hover:bg-opacity-80"
          onClick={onClose}
        >
          &times;
        </span>
       
        <div className="flex flex-col md:flex-row gap-8 p-10" id="modalBody">
          {/* Movie poster */}
          <div className="modal-poster flex-1 min-w-[250px] max-w-[300px] md:max-w-full md:self-center">
            <img
              src={poster}
              alt={title}
              className="w-full rounded-lg shadow-xl"
              
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/300x450/E50914/FFFFFF?text=No+Poster+Available`;
              }}
            />
          </div>
         
          <div className="modal-info flex-2">
            <h2 className="text-[#e50914] text-4xl font-bold mb-5">
              {title} ({year})
            </h2>
            <p className="my-3 leading-relaxed text-lg">
              <strong>Director:</strong> {director}
            </p>
            <p className="my-3 leading-relaxed text-lg">
              <strong>Rating:</strong> {rating}
            </p>
            <p className="my-3 leading-relaxed text-lg">
              <strong>Release Date:</strong> {releaseDate}
            </p>
            <p className="my-3 leading-relaxed text-lg">
              <strong>Plot:</strong> {plot}
            </p>

            {// Cast Section }
            <div className="cast-section mt-8">
              <div className="cast-title text-xl mb-4 text-[#e50914] border-b-2 border-[#e50914] pb-1 inline-block">
                Cast
              </div>
              {cast.length > 0 ? (
                <div className="cast-list flex flex-wrap gap-5">
                  {cast.map((actor, index) => {
                    const actorName =
                      actor.name || actor.actor_name || "Unknown Actor";
                    const actorPhoto =
                      actor.profile_path ||
                      actor.photo ||
                      actor.image ||
                      `https://placehold.co/70x70/333/fff?text=${actorName.charAt(
                        0
                      )}`;
                    return (
                      <div key={index} className="cast-member text-center w-24">
                        <img
                          src={actorPhoto}
                          alt={actorName}
                          className="w-20 h-20 rounded-full object-cover border-4 border-[#e50914] mb-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/70x70/E50914/FFFFFF?text=${actorName.charAt(
                              0
                            )}`;
                          }}
                        />
                        <span className="block text-sm text-white">
                          {actorName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400">
                  No cast information available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 
