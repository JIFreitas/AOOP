import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMovies } from '../services/api';
import { Movie } from '../types/MovieTypes';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMovies = async () => {
      try {
        setLoading(true);
        const data = await fetchMovies();
        setMovies(data.movies || []);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os filmes. Por favor, tente novamente.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    getMovies();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Filmes Disponíveis</h1>
      
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {movies.length === 0 ? (
          <div className="col-12">
            <p>Nenhum filme encontrado.</p>
          </div>
        ) : (
          movies.map(movie => (
            <div key={movie._id} className="col">
              <div className="card h-100">
                {movie.poster ? (
                  <img 
                    src={movie.poster} 
                    className="card-img-top" 
                    alt={movie.title} 
                    style={{ height: '300px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="bg-secondary text-white d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                    <span>Imagem não disponível</span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text">
                    <strong>Diretor:</strong> {movie.directors ? movie.directors.join(', ') : 'Não disponível'}<br />
                    <strong>Ano:</strong> {movie.year}<br />
                    <strong>Gênero:</strong> {movie.genres.join(', ')}
                  </p>
                  <Link to={`/movie/${movie._id}`} className="btn btn-primary">
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieList;