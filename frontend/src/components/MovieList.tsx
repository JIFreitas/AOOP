import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchMoviesWithStatus, 
  fetchGenres, 
  fetchCommentsByMovieId, 
  addComment, 
  SortOption, 
  MovieFilterParams,
  addMovieToList,
  removeMovieFromList,
  ListType
} from '../services/api';
import { Movie } from '../types/MovieTypes';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import ChatButton from './ChatButton';

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
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.YEAR_DESC);
  const [filterParams, setFilterParams] = useState<MovieFilterParams>({
    page: 1,
    limit: 18,
    search: '',
    genre: '',
    sort: SortOption.YEAR_DESC,
    userListType: ''
  });
  
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [userComments, setUserComments] = useState<{[movieId: string]: boolean}>({});
  
  const isUserAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  
  const [listLoading, setListLoading] = useState<Record<string, Record<ListType, boolean>>>({});
  
  useEffect(() => {
    const loadGenres = async () => {
      const genresList = await fetchGenres();
      setGenres(genresList);
    };
    
    loadGenres();
  }, []);

  useEffect(() => {
    const getMovies = async () => {
      try {
        setLoading(true);
        const data = await fetchMoviesWithStatus(filterParams);
        setMovies(data.movies || []);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setTotalMovies(data.total);
        setError(null);
        
        if (isUserAuthenticated) {
          const newListLoading: Record<string, Record<ListType, boolean>> = {};
          
          const newUserComments: Record<string, boolean> = {};
          
          data.movies.forEach(movie => {
            newListLoading[movie._id] = {
              favorite: false,
              watched: false,
              watchlist: false
            };
            
            if (movie.userCommented) {
              newUserComments[movie._id] = true;
            }
          });
          
          setListLoading(newListLoading);
          setUserComments(newUserComments);
        }
      } catch (err) {
        setError('Falha ao carregar os filmes. Por favor, tente novamente.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    getMovies();
  }, [filterParams, isUserAuthenticated]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilterParams(prev => ({
      ...prev,
      page
    }));
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterParams(prev => ({
      ...prev,
      page: 1,
      search: searchQuery,
      genre: selectedGenre,
      sort: sortOption
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortOption(SortOption.YEAR_DESC);
    setFilterParams({
      page: 1,
      limit: 18,
      search: '',
      genre: '',
      sort: SortOption.YEAR_DESC,
      userListType: ''
    });
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pageNumbers: (number | {type: string, value: string, targetPage: number})[] = [];
    
    pageNumbers.push(1);
    
    if (currentPage <= 3) {
      pageNumbers.push(2, 3, 4);
    } 
    else if (currentPage >= totalPages - 2) {
      pageNumbers.push({type: 'prev-ellipsis', value: '...', targetPage: totalPages - 4});
      pageNumbers.push(totalPages - 3, totalPages - 2, totalPages - 1);
    } 
    else {
      pageNumbers.push({type: 'prev-ellipsis', value: '...', targetPage: currentPage - 3});
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
    }
    
    if (currentPage < totalPages - 3) {
      pageNumbers.push({type: 'next-ellipsis', value: '...', targetPage: currentPage + 3});
    }
    
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

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

  const hasActiveFilters = (): boolean => {
    return (
      searchQuery !== '' || 
      selectedGenre !== '' || 
      sortOption !== SortOption.YEAR_DESC ||
      filterParams.userListType !== ''
    );
  };
  
  const handleOpenCommentModal = async (movie: Movie) => {
    if (!isUserAuthenticated) {
      alert('É necessário estar autenticado para comentar.');
      return;
    }
    
    setSelectedMovie(movie);
    setCommentText('');
    setRating(5);
    setCommentError(null);
    
    try {
      const comments = await fetchCommentsByMovieId(movie._id);
      const hasCommented = comments.some(comment => 
        currentUser && comment.name === currentUser.name && comment.email === currentUser.email
      );
      
      if (hasCommented) {
        setCommentError('Já comentou este filme!');
      }
      
      setShowCommentModal(true);
      
    } catch (err) {
      console.error('Erro ao verificar comentários:', err);
      setCommentError('Erro ao verificar comentários existentes.');
      setShowCommentModal(true);
    }
  };
  
  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedMovie(null);
    setCommentText('');
    setRating(5);
    setCommentError(null);
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMovie || !commentText.trim() || !currentUser) {
      setCommentError('Por favor, preencha o comentário.');
      return;
    }
    
    setCommentLoading(true);
    setCommentError(null);
    
    try {
      const commentData = {
        movie_id: selectedMovie._id,
        name: currentUser.name,
        email: currentUser.email,
        text: commentText.trim(),
        rating: rating
      };
      
      await addComment(commentData);
      
      setUserComments(prev => ({
        ...prev,
        [selectedMovie._id]: true
      }));
      
      setShowCommentModal(false);
      
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-4 shadow-lg';
      successAlert.style.zIndex = '9999';
      successAlert.style.maxWidth = '350px';
      successAlert.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2"></i>
          <span>Comentário adicionado com sucesso!</span>
        </div>
      `;
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        document.body.removeChild(successAlert);
      }, 3000);
      
    } catch (err: any) {
      console.error('Erro ao adicionar comentário:', err);
      setCommentError(err.message || 'Erro ao adicionar comentário.');
    } finally {
      setCommentLoading(false);
    }
  };

  const toggleMovieList = async (movie: Movie, listType: ListType) => {
    if (!isUserAuthenticated) {
      alert('É necessário estar autenticado para adicionar filmes às suas listas.');
      return;
    }
    
    const movieId = movie._id;
    
    setListLoading(prev => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        [listType]: true
      }
    }));
    
    try {
      const currentStatus = movie.userLists?.[listType] || false;
      const isAdding = !currentStatus;
      
      if (isAdding) {
        await addMovieToList(movieId, listType);
      } else {
        await removeMovieFromList(movieId, listType);
      }
      
      setMovies(prevMovies => prevMovies.map(m => {
        if (m._id !== movieId) return m;
        
        const currentUserLists = m.userLists || { favorite: false, watched: false, watchlist: false };
        
        if (isAdding && (listType === 'watched' || listType === 'watchlist')) {
          const oppositeType: ListType = listType === 'watched' ? 'watchlist' : 'watched';
          return {
            ...m,
            userLists: {
              ...currentUserLists,
              [listType]: true,
              [oppositeType]: false
            }
          } as Movie;
        } 
        
        return {
          ...m,
          userLists: {
            ...currentUserLists,
            [listType]: isAdding
          }
        } as Movie;
      }));
    } catch (err) {
      console.error(`Erro ao atualizar a lista ${listType}:`, err);
    } finally {
      setListLoading(prev => ({
        ...prev,
        [movieId]: {
          ...prev[movieId],
          [listType]: false
        }
      }));
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
      <h1 className="mb-4 cosmic-title">MoviePlanet - O seu planeta de cinema!</h1>
      
      <div className="card space-card mb-4">
        <div className="card-body">
          <h4 className="card-title">Filtros</h4>
          <form onSubmit={handleApplyFilters}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="searchQuery" className="form-label">Pesquisar</label>
                <input
                  type="text"
                  className="form-control"
                  id="searchQuery"
                  placeholder="Título, realizador, sinopse, elenco..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="col-md-4">
                <label htmlFor="genreSelect" className="form-label">Género</label>
                <select 
                  className="form-select" 
                  id="genreSelect"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  <option value="">Todos os géneros</option>
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
              
              {isUserAuthenticated && (
              <div className="col-md-4">
                <label htmlFor="userListType" className="form-label">Minhas Listas</label>
                <select 
                  className="form-select" 
                  id="userListType"
                  value={filterParams.userListType || ''}
                  onChange={(e) => {
                    const userListType = e.target.value;
                    setFilterParams(prev => ({...prev, userListType, page: 1}));
                  }}
                >
                  <option value="">Todos os filmes</option>
                  <option value="favorite">Os Meus Favoritos</option>
                  <option value="watched">Filmes Vistos</option>
                  <option value="watchlist">Quero Ver</option>
                </select>
              </div>
              )}
              
              <div className="col-12">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-cosmic">
                    <i className="bi bi-search me-1"></i> Aplicar Filtros
                  </button>
                  {hasActiveFilters() && (
                    <button type="button" className="btn btn-cosmic-outline" onClick={handleClearFilters}>
                      <i className="bi bi-x-circle me-1"></i> Limpar Filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-cosmic" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">A carregar...</span>
          </div>
        </div>
      )}
      
      {!loading && (
        <div className="alert alert-cosmic mb-4">
          {totalMovies === 0 ? (
            <span style={{ color: 'var(--nebula-teal)', textShadow: '0 0 5px rgba(8, 217, 214, 0.5)' }}>
                Nenhum filme encontrado com os filtros aplicados.
            </span>
          ) : (
            <span style={{ color: 'var(--nebula-teal)', textShadow: '0 0 5px rgba(8, 217, 214, 0.5)' }}>
              Foram encontrados <strong>{totalMovies}</strong> filmes 
              {filterParams.search && <span> contendo "<strong>{filterParams.search}</strong>"</span>}
              {filterParams.genre && <span> do género <strong>{filterParams.genre}</strong></span>}
              {filterParams.userListType && (
                <span> na lista <strong>
                  {filterParams.userListType === 'favorite' && 'Os Meus Favoritos'}
                  {filterParams.userListType === 'watched' && 'Filmes Vistos'}
                  {filterParams.userListType === 'watchlist' && 'Quero Ver'}
                </strong></span>
              )}
              {filterParams.sort !== SortOption.RATING_DESC && 
                <span> ordenados por <strong>{getSortOptionLabel(filterParams.sort || SortOption.RATING_DESC)}</strong></span>
              }
            </span>
          )}
        </div>
      )}
            
      <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
        {movies.length === 0 && !loading ? (
            <div>
            </div>
        ) : (
          movies.map(movie => (
            <div key={movie._id} className="col">
              <div className="card space-card h-100">
                {movie.poster ? (
                  <img 
                    src={movie.poster} 
                    className="card-img-top" 
                    alt={movie.title} 
                    style={{ height: '300px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="bg-space-navy text-white d-flex justify-content-center align-items-center" style={{ height: '300px', background: 'var(--space-navy)' }}>
                    <span><i className="bi bi-camera me-2"></i> Imagem não disponível</span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text">
                    <strong className="text-star">Realizador:</strong> {movie.directors ? movie.directors.join(', ') : 'Não disponível'}<br />
                    <strong className="text-star">Ano:</strong> {movie.year}<br />
                    <strong className="text-star">Género:</strong> {movie.genres?.length ? movie.genres.join(', ') : 'Não disponível'}
                    {movie.imdb?.rating && (
                      <><br /><strong className="text-star">Avaliação:</strong> {movie.imdb.rating}/10 <i className="bi bi-star-fill text-warning"></i></>
                    )}
                  </p>
                  <div className="d-flex justify-content-between">
                    <Link to={`/movie/${movie._id}`} className="btn btn-cosmic">
                      <i className="bi bi-telescope-fill me-2"></i>Ver Detalhes
                    </Link>
                    {isUserAuthenticated && (
                      <div className="d-flex gap-2">
                        <button 
                          className={`btn ${userComments[movie._id] ? 'btn-info' : 'btn-cosmic-outline'}`} 
                          onClick={() => handleOpenCommentModal(movie)}
                          disabled={userComments[movie._id]}
                          title={userComments[movie._id] ? "Já comentou este filme" : "Adicionar comentário"}
                        >
                          <i className={`bi ${userComments[movie._id] ? 'bi-chat-square-text-fill' : 'bi-chat-dots-fill'}`}></i>
                        </button>
                        <button 
                          className={`btn ${movie.userLists?.favorite ? 'btn-danger' : 'btn-outline-danger'}`} 
                          onClick={() => toggleMovieList(movie, 'favorite')}
                          disabled={listLoading[movie._id]?.favorite}
                          title={movie.userLists?.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                          {listLoading[movie._id]?.favorite ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-heart-fill"></i>
                          )}
                        </button>
                        <button 
                          className={`btn ${movie.userLists?.watched ? 'btn-success' : 'btn-outline-success'}`} 
                          onClick={() => toggleMovieList(movie, 'watched')}
                          disabled={listLoading[movie._id]?.watched}
                          title={movie.userLists?.watched ? "Remover dos vistos" : "Adicionar aos vistos"}
                        >
                          {listLoading[movie._id]?.watched ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-eye-fill"></i>
                          )}
                        </button>
                        <button 
                          className={`btn ${movie.userLists?.watchlist ? 'btn-warning' : 'btn-outline-warning'}`} 
                          onClick={() => toggleMovieList(movie, 'watchlist')}
                          disabled={listLoading[movie._id]?.watchlist}
                          title={movie.userLists?.watchlist ? "Remover da lista para ver" : "Adicionar à lista para ver"}
                        >
                          {listLoading[movie._id]?.watchlist ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-bookmark-fill"></i>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <nav aria-label="Navegação de páginas">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="mb-0" style={{ color: 'var(--nebula-teal)', textShadow: '0px 0px 5px rgba(8, 217, 214, 0.5)' }}>
              A mostrar <b>{(currentPage - 1) * filterParams.limit! + 1}-{Math.min(currentPage * filterParams.limit!, totalMovies)}</b> de <b>{totalMovies}</b> filmes
            </span>
          </div>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title="Primeira página"
                style={currentPage === 1 ? {backgroundColor: 'var(--space-navy)', color: 'var(--nebula-teal)', opacity: 0.6, borderColor: 'var(--nebula-teal)'} : {}}
              >
                <i className="bi bi-chevron-double-left"></i>
              </button>
            </li>
            
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Página anterior"
                style={currentPage === 1 ? {backgroundColor: 'var(--space-navy)', color: 'var(--nebula-teal)', opacity: 0.6, borderColor: 'var(--nebula-teal)'} : {}}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
            </li>
            
            {getPaginationNumbers().map((pageNum, index) => {
              const isNumber = typeof pageNum === 'number';
              const isCurrentPage = isNumber && pageNum === currentPage;
              const ellipsis = !isNumber ? pageNum : null;
              
              return (
                <li key={index} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => {
                      if (isNumber) {
                        handlePageChange(pageNum);
                      } else if (ellipsis) {
                        handlePageChange(ellipsis.targetPage);
                      }
                    }}
                    title={ellipsis ? `Ir para a página ${ellipsis.targetPage}` : `Página ${pageNum}`}
                  >
                    {isNumber ? pageNum : ellipsis?.value}
                  </button>
                </li>
              );
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Próxima página"
                style={currentPage === totalPages ? {backgroundColor: 'var(--space-navy)', color: 'var(--nebula-teal)', opacity: 0.6, borderColor: 'var(--nebula-teal)'} : {}}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </li>
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title="Última página"
                style={currentPage === totalPages ? {backgroundColor: 'var(--space-navy)', color: 'var(--nebula-teal)', opacity: 0.6, borderColor: 'var(--nebula-teal)'} : {}}
              >
                <i className="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}
      
      {showCommentModal && (
        <div className="modal fade show" tabIndex={-1} role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ background: 'var(--space-navy)', border: '1px solid var(--nebula-pink)', borderRadius: '10px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--space-purple)' }}>
                <h5 className="modal-title" style={{ color: 'var(--nebula-pink)' }}>
                  <i className="bi bi-chat-dots me-2"></i>
                  {selectedMovie ? `Comentar: ${selectedMovie.title}` : 'Adicionar Comentário'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseCommentModal} aria-label="Fechar"></button>
              </div>
              <div className="modal-body">
                {commentError && (
                  <div className="alert alert-planet mb-4" style={{ backgroundColor: 'rgba(255, 140, 66, 0.2)', color: 'var(--star-yellow)', border: '1px solid var(--planet-orange)' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {commentError}
                  </div>
                )}
                
                {!commentError && (
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-3">
                      <label htmlFor="commentText" className="form-label fw-bold text-start d-block text-star">O Seu Comentário</label>
                      <textarea
                        className="form-control"
                        id="commentText"
                        rows={4}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={commentLoading}
                        required
                        placeholder="Escreva a sua opinião sobre o filme..."
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="rating" className="form-label fw-bold text-start d-block text-star">Avaliação</label>
                      <select
                        className="form-select"
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        disabled={commentLoading}
                      >
                        <option value="1">1 - Mau</option>
                        <option value="2">2 - Razoável</option>
                        <option value="3">3 - Bom</option>
                        <option value="4">4 - Muito Bom</option>
                        <option value="5">5 - Excelente</option>
                      </select>
                    </div>
                    
                    <div className="d-flex justify-content-between">
                      <button 
                        type="button" 
                        className="btn btn-cosmic-outline" 
                        onClick={handleCloseCommentModal}
                        disabled={commentLoading}
                      >
                        <i className="bi bi-x-circle me-2"></i>Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-cosmic"
                        disabled={commentLoading || !!commentError}
                      >
                        {commentLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            A enviar...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>Enviar Comentário
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showCommentModal && (
        <div className="modal-backdrop fade show" onClick={handleCloseCommentModal}></div>
      )}

      {/* Chat Button com contexto do filtro atual */}
      <ChatButton
        movieContext={{
          genre: selectedGenre || undefined
        }}
      />
    </div>
  );
};

export default MovieList;