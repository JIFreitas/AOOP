import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  fetchMovieById, 
  fetchCommentsByMovieId, 
  addComment,
  Comment 
} from '../services/api';
import { Movie } from '../types/MovieTypes';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState({
    name: '',
    text: '',
    rating: 5
  });

  const [showCommentForm, setShowCommentForm] = useState<boolean>(false);

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
        
        setError(null);
      } catch (err) {
        setError('Erro ao carregar os dados do filme');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewComment(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !newComment.name || !newComment.text) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      const commentData = {
        movie_id: id,
        name: newComment.name,
        text: newComment.text,
        rating: newComment.rating
      };

      const addedComment = await addComment(commentData);
      
      if (addedComment) {
        setComments(prev => [addedComment, ...prev]);
        setNewComment({ name: '', text: '', rating: 5 });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Erro ao adicionar comentário');
    }
  };

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error || !movie) {
    return (
      <div className="alert alert-danger">
        {error || 'Filme não encontrado'}
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Voltar para a página inicial</Link>
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
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card space-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0 text-star"><i className="bi bi-chat-dots me-2"></i>Comentários ({comments.length})</h2>
              <button 
                className={`btn ${showCommentForm ? 'btn-cosmic-outline' : 'btn-cosmic'}`}
                onClick={toggleCommentForm}
              >
                {showCommentForm ? (<><i className="bi bi-x-circle me-2"></i>Fechar formulário</>) : (<><i className="bi bi-plus-circle me-2"></i>Adicionar comentário</>)}
              </button>
            </div>
          
            <div className={`card-body ${showCommentForm ? '' : 'd-none'}`}>
              <div className="card space-card mb-4">
                <div className="card-header">
                  <h3 className="h5 mb-0 text-nebula-teal">Adicionar um comentário</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-bold text-start d-block text-star">Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={newComment.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
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
                    
                    <div className="d-flex justify-content-between">
                      <button 
                        type="button" 
                        className="btn btn-cosmic-outline" 
                        onClick={toggleCommentForm}
                      >
                        <i className="bi bi-x-circle me-2"></i>Cancelar
                      </button>
                      <button type="submit" className="btn btn-cosmic">
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
                    <p className="text-light opacity-75 text-end m-0">
                        {new Date(comment.date).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;