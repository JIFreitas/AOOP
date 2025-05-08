import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  fetchMovieById, 
  fetchCommentsByMovieId, 
  addComment,
  updateComment,
  deleteComment,
  Comment,
  UpdateComment,
  addMovieToList,
  removeMovieFromList,
  MovieListStatus,
  ListType
} from '../services/api';
import { Movie } from '../types/MovieTypes';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import { Notification } from '../utils/notification';

const MovieDetail: React.FC = () => {
  // Estados relacionados ao filme e comentários
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados relacionados ao formulário de comentário
  const [showCommentForm, setShowCommentForm] = useState<boolean>(false);
  const [userHasCommented, setUserHasCommented] = useState<boolean>(false);
  const [userComment, setUserComment] = useState<Comment | null>(null);
  const [commentFormError, setCommentFormError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [newComment, setNewComment] = useState({
    text: '',
    rating: 5
  });
  
  // Estados para edição de comentário
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>('');
  const [editCommentRating, setEditCommentRating] = useState<number>(5);
  const [editCommentError, setEditCommentError] = useState<string | null>(null);
  const [editCommentLoading, setEditCommentLoading] = useState<boolean>(false);
  
  // Estados para exclusão de comentário
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Verificar se o usuário está autenticado
  const isUserAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  // Estados para listas de filmes
  const [movieLists, setMovieLists] = useState<MovieListStatus>({
    favorite: false,
    watched: false,
    watchlist: false
  });
  const [listLoading, setListLoading] = useState<Record<ListType, boolean>>({
    favorite: false,
    watched: false,
    watchlist: false
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const movieData = await fetchMovieById(id);
        if (!movieData) {
          setError('Filme não encontrado');
          return;
        }
        setMovie(movieData);
        
        const commentsData = await fetchCommentsByMovieId(id);
        setComments(commentsData);
        
        // Verificar se o usuário atual já comentou este filme com base nos dados retornados pela API
        if (isUserAuthenticated && movieData.userComment) {
          setUserHasCommented(true);
          const userCommentData = movieData.userComment;
          setUserComment(userCommentData);
          
          // Pré-preencher o formulário se o usuário já tem um comentário
          setNewComment({
            text: userCommentData.text,
            rating: userCommentData.rating || 5
          });
        } else {
          setUserHasCommented(false);
          setUserComment(null);
        }

        // Usar as informações de listas do usuário vindas do endpoint
        if (isUserAuthenticated && movieData.userLists) {
          setMovieLists(movieData.userLists);
        }
        
        setError(null);
      } catch (err) {
        setError('Erro ao carregar os dados do filme');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isUserAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewComment(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !newComment.text) {
      setCommentFormError('Por favor, preencha todos os campos');
      return;
    }

    if (!isUserAuthenticated) {
      setCommentFormError('Você precisa estar logado para comentar');
      return;
    }

    try {
      setCommentLoading(true);
      const commentData = {
        movie_id: id,
        name: currentUser?.name || 'Anônimo',
        email: currentUser?.email, // Adicionando o email do usuário autenticado
        text: newComment.text,
        rating: newComment.rating
      };

      const addedComment = await addComment(commentData);
      
      if (addedComment) {
        setComments(prev => [addedComment, ...prev]);
        setNewComment({ text: '', rating: 5 });
        setUserHasCommented(true);
        setShowCommentForm(false);
        
        // Mostrar mensagem de sucesso em uma div flutuante que desaparece após alguns segundos
        Notification.success('Comentário adicionado com sucesso!');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentFormError('Erro ao adicionar comentário');
    } finally {
      setCommentLoading(false);
    }
  };

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.text);
    setEditCommentRating(comment.rating ?? 5);
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCommentId || !editCommentText) {
      setEditCommentError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setEditCommentLoading(true);
      const updatedComment: UpdateComment = {
        text: editCommentText,
        rating: editCommentRating
      };

      const result = await updateComment(editingCommentId, updatedComment);

      if (result) {
        setComments(prev => prev.map(comment => comment._id === editingCommentId ? result : comment));
        setEditingCommentId(null);
        setEditCommentText('');
        setEditCommentRating(5);
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      setEditCommentError('Erro ao atualizar comentário');
    } finally {
      setEditCommentLoading(false);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteComment(commentToDelete._id);

      if (result) {
        setComments(prev => prev.filter(comment => comment._id !== commentToDelete._id));
        setShowDeleteModal(false);
        setCommentToDelete(null);
        
        // Atualizar o estado para indicar que o usuário não tem mais comentário
        setUserHasCommented(false);
        setUserComment(null);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Função para alternar o status de um filme em uma lista
  const toggleMovieList = async (listType: ListType) => {
    if (!isUserAuthenticated || !id) {
      return;
    }
    
    setListLoading(prev => ({ ...prev, [listType]: true }));
    
    try {
      const isInList = movieLists[listType];
      const isAdding = !isInList;
      
      if (isAdding) {
        // Adicionar à lista
        await addMovieToList(id, listType);
        
        // Se a lista for assistido/quero assistir, atualizar o estado contrário
        if (listType === 'watched' || listType === 'watchlist') {
          const oppositeType: ListType = listType === 'watched' ? 'watchlist' : 'watched';
          setMovieLists(prev => ({ 
            ...prev, 
            [listType]: true,
            [oppositeType]: false
          }));
        } else {
          setMovieLists(prev => ({ ...prev, [listType]: true }));
        }
      } else {
        // Remover da lista
        await removeMovieFromList(id, listType);
        setMovieLists(prev => ({ ...prev, [listType]: false }));
      }
    } catch (err) {
      console.error(`Erro ao atualizar a lista ${listType}:`, err);
    } finally {
      setListLoading(prev => ({ ...prev, [listType]: false }));
    }
  };

  // Melhorando a lógica de retorno condicional para estados de loading e erro
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-cosmic" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">A carregar...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="alert alert-danger p-4">
        <h4 className="alert-heading"><i className="bi bi-exclamation-triangle me-2"></i>Erro</h4>
        <p>{error || 'Filme não encontrado'}</p>
        <hr />
        <div className="mt-3">
          <Link to="/" className="btn btn-cosmic">
            <i className="bi bi-house-door me-2"></i>Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="btn btn-cosmic float-start mb-3">
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </Link>
        <div className="clearfix"></div>
      </div>

      <div className="row mb-5">
        <div className="col-md-4 mb-4 mb-md-0">
          {movie.poster ? (
            <img 
              src={movie.poster} 
              className="img-fluid rounded shadow" 
              alt={movie.title} 
              style={{ border: '2px solid var(--space-accent)' }}
            />
          ) : (
            <div className="bg-space-navy text-white d-flex justify-content-center align-items-center rounded" style={{ 
              height: '400px',
              border: '2px solid var(--space-accent)',
              background: 'var(--space-navy)'
            }}>
              <span><i className="bi bi-camera me-2"></i>Imagem não disponível</span>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <h1 className="mb-3 cosmic-title">{movie.title}</h1>
          
          <div className="card space-card mb-4 p-3">
            <div className="mb-4">
              <p><strong className="text-star">Realizador:</strong> <span className="text-light">{movie.directors?.join(', ') || 'Não disponível'}</span></p>
              <p><strong className="text-star">Ano:</strong> <span className="text-light">{movie.year}</span></p>
              <p><strong className="text-star">Géneros:</strong> <span className="text-light">{movie.genres?.join(', ') || 'Não disponível'}</span></p>
              <p><strong className="text-star">Duração:</strong> <span className="text-light">{movie.runtime ? `${movie.runtime} min` : 'Não disponível'}</span></p>
              <p><strong className="text-star">Elenco:</strong> <span className="text-light">{movie.cast?.join(', ') || 'Não disponível'}</span></p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-cosmic"><i className="bi bi-star me-2"></i>Avaliações</h3>
            <div className="row">
              {movie.imdb && (
                <div className="col-md-6 mb-3">
                  <div className="card space-card h-100">
                    <div className="card-header" style={{ background: '#f3ce13', color: '#121212' }}>
                      <i className="bi bi-film me-2"></i>IMDB
                    </div>
                    <div className="card-body">
                      <p className="mb-1">
                        <strong className="text-nebula-teal">Classificação:</strong> <span className="text-light">{movie.imdb.rating ? movie.imdb.rating : '?'}/10</span>
                      </p>
                      <p className="mb-1">
                        <strong className="text-nebula-teal">Votos:</strong> <span className="text-light">{movie.imdb.votes ? movie.imdb.votes.toLocaleString() : 'N/D'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {movie.tomatoes && (
                <div className="col-md-6 mb-3">
                  <div className="card space-card h-100">
                    <div className="card-header" style={{ background: '#fa320a', color: 'white' }}>
                      <i className="bi bi-award me-2"></i>Rotten Tomatoes
                    </div>
                    <div className="card-body">
                      {movie.tomatoes.critic && (
                        <p className="mb-1">
                          <strong className="text-nebula-teal">Críticos:</strong> <span className="text-light">{movie.tomatoes.critic.rating}/10 
                          {movie.tomatoes.critic.meter ? ` (${movie.tomatoes.critic.meter}%)` : ''}</span>
                        </p>
                      )}
                      
                      {movie.tomatoes.viewer && (
                        <p className="mb-0">
                          <strong className="text-nebula-teal">Audiência:</strong> <span className="text-light">{movie.tomatoes.viewer.rating}/5
                          {movie.tomatoes.viewer.meter ? ` (${movie.tomatoes.viewer.meter}%)` : ''}</span>
                        </p>
                      )}
                      
                      {(!movie.tomatoes.critic && !movie.tomatoes.viewer) && (
                        <p className="mb-0">Detalhes de avaliação não disponíveis</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {movie.metacritic && (
                <div className="col-md-6 mb-3">
                  <div className="card space-card h-100">
                    <div className="card-header" style={{ background: '#66cc33', color: '#121212' }}>
                      <i className="bi bi-graph-up me-2"></i>Metacritic
                    </div>
                    <div className="card-body">
                      <p className="mb-0">
                        <strong className="text-nebula-teal">Pontuação:</strong> <span className="text-light">{movie.metacritic}/100</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {movie.awards && (
            <div className="card space-card mb-4">
              <div className="card-header">
                <h3 className="h5 mb-0 text-star"><i className="bi bi-trophy me-2"></i>Prémios</h3>
              </div>
              <div className="card-body">
                <p className="text-light">{movie.awards.text}</p>
              </div>
            </div>
          )}
          
          <div className="card space-card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0 text-star"><i className="bi bi-book me-2"></i>Sinopse</h3>
            </div>
            <div className="card-body">
              <p className="lead text-light">{movie.fullplot || movie.plot}</p>
            </div>
          </div>
          
          <div className="card space-card">
            <div className="card-body">
              <div className="row">
                {movie.countries && movie.countries.length > 0 && (
                  <div className="col-md-6">
                    <p className='m-0'><strong className="text-nebula-teal">Países:</strong> <span className="text-light">{movie.countries.join(', ')}</span></p>
                  </div>
                )}
                {movie.languages && movie.languages.length > 0 && (
                  <div className="col-md-6">
                    <p className='m-0'><strong className="text-nebula-teal">Idiomas:</strong> <span className="text-light">{movie.languages.join(', ')}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card space-card mt-4">
            <div className="card-header">
              <h3 className="h5 mb-0 text-star"><i className="bi bi-list-check me-2"></i>Minhas Listas</h3>
            </div>
            <div className="card-body">
              {isUserAuthenticated ? (
                <div className="d-flex justify-content-around">
                  <button 
                    className={`btn ${movieLists.favorite ? 'btn-cosmic' : 'btn-cosmic-outline'}`} 
                    onClick={() => toggleMovieList('favorite')}
                    disabled={listLoading.favorite}
                  >
                    {listLoading.favorite ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <i className={`bi ${movieLists.favorite ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                        {movieLists.favorite ? 'Favorito' : 'Adicionar aos Favoritos'}
                      </>
                    )}
                  </button>
                  <button 
                    className={`btn ${movieLists.watched ? 'btn-cosmic' : 'btn-cosmic-outline'}`} 
                    onClick={() => toggleMovieList('watched')}
                    disabled={listLoading.watched}
                  >
                    {listLoading.watched ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <i className={`bi ${movieLists.watched ? 'bi-eye-fill' : 'bi-eye'} me-2`}></i>
                        {movieLists.watched ? 'Assistido' : 'Marcar como Assistido'}
                      </>
                    )}
                  </button>
                  <button 
                    className={`btn ${movieLists.watchlist ? 'btn-cosmic' : 'btn-cosmic-outline'}`} 
                    onClick={() => toggleMovieList('watchlist')}
                    disabled={listLoading.watchlist}
                  >
                    {listLoading.watchlist ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <i className={`bi ${movieLists.watchlist ? 'bi-bookmark-fill' : 'bi-bookmark'} me-2`}></i>
                        {movieLists.watchlist ? 'Na Lista de Assistir' : 'Adicionar à Lista de Assistir'}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-3 text-nebula-teal">Faça login para adicionar este filme às suas listas pessoais</p>
                  <Link to="/login" className="btn btn-cosmic">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Entrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card space-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0 text-star"><i className="bi bi-chat-dots me-2"></i>Comentários ({comments.length})</h2>
              {isUserAuthenticated ? (
                <button 
                  className={`btn ${showCommentForm ? 'btn-cosmic-outline' : 'btn-cosmic'}`}
                  onClick={toggleCommentForm}
                  disabled={userHasCommented}
                  title={userHasCommented && userComment ? `Seu comentário: ${userComment.text.substring(0, 30)}...` : ""}
                >
                  {showCommentForm ? (
                    <><i className="bi bi-x-circle me-2"></i>Fechar formulário</>
                  ) : userHasCommented ? (
                    <><i className="bi bi-check-circle me-2"></i>Já comentado {userComment && `(${userComment.rating}/5)`}</>
                  ) : (
                    <><i className="bi bi-plus-circle me-2"></i>Adicionar comentário</>
                  )}
                </button>
              ) : (
                <Link to="/login" className="btn btn-cosmic-outline">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Faça login para comentar
                </Link>
              )}
            </div>
          
            <div className={`card-body ${showCommentForm ? '' : 'd-none'}`}>
              <div className="card space-card mb-4">
                <div className="card-header">
                  <h3 className="h5 mb-0 text-nebula-teal">Adicionar um comentário</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-3">
                      <label htmlFor="text" className="form-label fw-bold text-start d-block text-star">Comentário</label>
                      <textarea
                        className="form-control"
                        id="text"
                        name="text"
                        rows={3}
                        value={newComment.text}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label fw-bold text-start d-block text-star">Avaliação</label>
                      <select
                        className="form-select"
                        id="rating"
                        name="rating"
                        value={newComment.rating}
                        onChange={handleInputChange}
                      >
                        <option value="1">1 - Mau</option>
                        <option value="2">2 - Razoável</option>
                        <option value="3">3 - Bom</option>
                        <option value="4">4 - Muito Bom</option>
                        <option value="5">5 - Excelente</option>
                      </select>
                    </div>

                    {commentFormError && (
                      <div className="alert alert-danger">
                        {commentFormError}
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between">
                      <button 
                        type="button" 
                        className="btn btn-cosmic-outline" 
                        onClick={toggleCommentForm}
                      >
                        <i className="bi bi-x-circle me-2"></i>Cancelar
                      </button>
                      <button type="submit" className="btn btn-cosmic" disabled={commentLoading}>
                        <i className="bi bi-send me-2"></i>Enviar Comentário
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          {comments.length === 0 ? (
            <div className="alert alert-cosmic mt-3">
              <span style={{ color: 'var(--nebula-teal)', textShadow: '0 0 5px rgba(8, 217, 214, 0.5)' }}><i className="bi bi-chat-dots me-2"></i>Nenhum comentário ainda. Seja o primeiro a comentar!</span>
            </div>
          ) : (
            <div className="comment-list mt-3">
              {comments.map(comment => (
                <div key={comment._id} className="card space-card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <h5 className="card-title mb-0 text-nebula-teal">{comment.name}</h5>
                      </div>
                      <div className="badge" style={{ 
                        background: 'var(--nebula-gradient)', 
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px'
                      }}>
                        {comment.rating ? comment.rating : '?'}/5 ⭐
                      </div>
                    </div>
                    <hr className="cosmic-divider" />
                    <p className="card-text text-light">{comment.text}</p>
                    <hr className="cosmic-divider" />
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      {isUserAuthenticated && currentUser && comment.name === currentUser.name && comment.email === currentUser.email && (
                      <div>
                        <button 
                        className="btn btn-sm btn-cosmic-outline me-2" 
                        onClick={() => handleEditComment(comment)}
                        >
                        <i className="bi bi-pencil me-2"></i>Editar
                        </button>
                        <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteComment(comment)}
                        >
                        <i className="bi bi-trash me-2"></i>Excluir
                        </button>
                      </div>
                      )}
                      <p className="text-light opacity-75 text-end m-0 ms-auto">
                      {new Date(comment.date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingCommentId && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ background: 'var(--space-navy)', border: '1px solid var(--nebula-pink)', borderRadius: '10px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--space-purple)' }}>
                <h5 className="modal-title text-nebula-pink">
                  <i className="bi bi-pencil-square me-2"></i>Editar Comentário
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingCommentId(null)} aria-label="Fechar"></button>
              </div>
              <div className="modal-body">
                {editCommentError && (
                  <div className="alert alert-planet mb-3" style={{ backgroundColor: 'rgba(255, 140, 66, 0.2)', color: 'var(--star-yellow)', border: '1px solid var(--planet-orange)' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {editCommentError}
                  </div>
                )}
                
                <form onSubmit={handleUpdateComment}>
                  <div className="mb-3">
                    <label htmlFor="editCommentText" className="form-label fw-bold text-start d-block text-star">Comentário</label>
                    <textarea
                      className="form-control"
                      id="editCommentText"
                      name="editCommentText"
                      rows={3}
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="editCommentRating" className="form-label fw-bold text-start d-block text-star">Avaliação</label>
                    <select
                      className="form-select"
                      id="editCommentRating"
                      name="editCommentRating"
                      value={editCommentRating}
                      onChange={(e) => setEditCommentRating(parseInt(e.target.value, 10))}
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
                      onClick={() => setEditingCommentId(null)}
                    >
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-cosmic" 
                      disabled={editCommentLoading}
                    >
                      {editCommentLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          A guardar...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>Guardar alterações
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ background: 'var(--space-navy)', border: '1px solid var(--planet-red)', borderRadius: '10px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--planet-red)' }}>
                <h5 className="modal-title" style={{ color: 'var(--planet-red)' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>Excluir Comentário
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} aria-label="Fechar"></button>
              </div>
              <div className="modal-body">
                <p className="text-light">Tem certeza de que deseja excluir este comentário?</p>
                <p className="text-light"><small>Esta ação não pode ser desfeita.</small></p>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--space-purple)' }}>
                <button 
                  type="button" 
                  className="btn btn-cosmic-outline" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={confirmDeleteComment} 
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      A excluir...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop para os modais quando estiverem abertos */}
      {(editingCommentId || showDeleteModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default MovieDetail;