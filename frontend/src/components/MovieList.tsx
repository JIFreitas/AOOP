import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMovies, fetchGenres, PaginatedResponse, SortOption, MovieFilterParams } from '../services/api';
import { Movie } from '../types/MovieTypes';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.TITLE_ASC);
  const [filterParams, setFilterParams] = useState<MovieFilterParams>({
    page: 1,
    limit: 18,
    search: '',
    genre: '',
    sort: SortOption.TITLE_ASC
  });
  
  // Carregar gêneros no carregamento inicial
  useEffect(() => {
    const loadGenres = async () => {
      const genresList = await fetchGenres();
      setGenres(genresList);
    };
    
    loadGenres();
  }, []);

  // Buscar filmes quando os filtros mudarem
  useEffect(() => {
    const getMovies = async () => {
      try {
        setLoading(true);
        const data: PaginatedResponse<Movie> = await fetchMovies(filterParams);
        setMovies(data.movies || []);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setTotalMovies(data.total);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os filmes. Por favor, tente novamente.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    getMovies();
  }, [filterParams]);

  // Lidar com mudança de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilterParams(prev => ({
      ...prev,
      page
    }));
  };

  // Lidar com aplicação de filtros
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterParams(prev => ({
      ...prev,
      page: 1, // Volta para a primeira página ao aplicar novos filtros
      search: searchQuery,
      genre: selectedGenre,
      sort: sortOption
    }));
  };

  // Lidar com limpeza de filtros
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortOption(SortOption.TITLE_ASC);
    setFilterParams({
      page: 1,
      limit: 18,
      search: '',
      genre: '',
      sort: SortOption.TITLE_ASC
    });
  };

  // Generate array of page numbers to display
  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Renderizar nome amigável da opção de ordenação
  const getSortOptionLabel = (option: SortOption): string => {
    switch (option) {
      case SortOption.TITLE_ASC:
        return 'Título (A-Z)';
      case SortOption.TITLE_DESC:
        return 'Título (Z-A)';
      case SortOption.YEAR_ASC:
        return 'Ano (Crescente)';
      case SortOption.YEAR_DESC:
        return 'Ano (Decrescente)';
      case SortOption.RATING_ASC:
        return 'Avaliação (Crescente)';
      case SortOption.RATING_DESC:
        return 'Avaliação (Decrescente)';
      default:
        return 'Título (A-Z)';
    }
  };

  if (loading && currentPage === 1 && !movies.length) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Filmes Disponíveis</h1>
      
      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filtros</h5>
          <form onSubmit={handleApplyFilters}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="searchQuery" className="form-label">Pesquisar</label>
                <input
                  type="text"
                  className="form-control"
                  id="searchQuery"
                  placeholder="Título, diretor, elenco..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="col-md-4">
                <label htmlFor="genreSelect" className="form-label">Gênero</label>
                <select 
                  className="form-select" 
                  id="genreSelect"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  <option value="">Todos os gêneros</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-4">
                <label htmlFor="sortSelect" className="form-label">Ordenar por</label>
                <select 
                  className="form-select" 
                  id="sortSelect"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                >
                  {Object.values(SortOption).map((option) => (
                    <option key={option} value={option}>
                      {getSortOptionLabel(option as SortOption)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-12">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-search me-1"></i> Aplicar Filtros
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={handleClearFilters}>
                    <i className="bi bi-x-circle me-1"></i> Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Indicador de carregamento */}
      {loading && (
        <div className="text-center my-3"><div className="spinner-border" role="status"></div></div>
      )}
      
      {/* Status dos filtros */}
      {!loading && (
        <div className="alert alert-info mb-4">
          {totalMovies === 0 ? (
            <span>Nenhum filme encontrado com os filtros aplicados.</span>
          ) : (
            <span>
              Encontrados <strong>{totalMovies}</strong> filmes 
              {filterParams.search && <span> contendo "<strong>{filterParams.search}</strong>"</span>}
              {filterParams.genre && <span> do gênero <strong>{filterParams.genre}</strong></span>}
              {filterParams.sort !== SortOption.TITLE_ASC && 
                <span> ordenados por <strong>{getSortOptionLabel(filterParams.sort || SortOption.TITLE_ASC)}</strong></span>
              }
            </span>
          )}
        </div>
      )}
      
      {/* Lista de filmes */}
      <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
        {movies.length === 0 && !loading ? (
            <div>
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
                    <strong>Gênero:</strong> {movie.genres?.length ? movie.genres.join(', ') : 'Não disponível'}
                    {movie.imdb?.rating && (
                      <><br /><strong>Avaliação:</strong> {movie.imdb.rating}/10</>
                    )}
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
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav aria-label="Navegação de páginas">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">
              A mostrar <b>{(currentPage - 1) * filterParams.limit! + 1}-{Math.min(currentPage * filterParams.limit!, totalMovies)}</b> de <b>{totalMovies}</b> filmes
            </p>
          </div>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
            </li>
            
            {getPaginationNumbers().map(pageNum => (
              <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default MovieList;