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
  
  // Estado para o formulário de novo comentário
  const [newComment, setNewComment] = useState({
    name: '',
    text: '',
    rating: 5
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Carrega o filme e seus comentários
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
        movieId: id,
        name: newComment.name,
        text: newComment.text,
        rating: newComment.rating
      };

      const addedComment = await addComment(commentData);
      
      if (addedComment) {
        setComments(prev => [addedComment, ...prev]);
        setNewComment({ name: '', text: '', rating: 5 }); // Limpa o formulário
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Erro ao adicionar comentário');
    }
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
        <Link to="/" className="btn btn-outline-secondary mb-3">
          &laquo; Voltar para lista de filmes
        </Link>
      </div>

      <div className="row mb-5">
        <div className="col-md-4 mb-4 mb-md-0">
          {movie.poster ? (
            <img 
              src={movie.poster} 
              className="img-fluid rounded" 
              alt={movie.title} 
            />
          ) : (
            <div className="bg-secondary text-white d-flex justify-content-center align-items-center rounded" style={{ height: '400px' }}>
              <span>Imagem não disponível</span>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <h1 className="mb-3">{movie.title}</h1>
          
          {/* Informações básicas do filme */}
          <div className="mb-4">
            <p><strong>Diretor:</strong> {movie.directors?.join(', ') || 'Não disponível'}</p>
            <p><strong>Ano:</strong> {movie.year}</p>
            <p><strong>Gêneros:</strong> {movie.genres?.join(', ') || 'Não disponível'}</p>
            <p><strong>Duração:</strong> {movie.runtime ? `${movie.runtime} min` : 'Não disponível'}</p>
            <p><strong>Elenco:</strong> {movie.cast?.join(', ') || 'Não disponível'}</p>
          </div>
          
          {/* Avaliações */}
          <div className="mb-4">
            <h3>Avaliações</h3>
            <div className="row">
              {movie.imdb && (
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-warning text-dark">IMDB</div>
                    <div className="card-body">
                      <p className="mb-1">
                        <strong>Classificação:</strong> {movie.imdb.rating}/10
                      </p>
                      <p className="mb-1">
                        <strong>Votos:</strong> {movie.imdb.votes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {movie.tomatoes && (
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-danger text-white">Rotten Tomatoes</div>
                    <div className="card-body">
                      {movie.tomatoes.critic && (
                        <p className="mb-1">
                          <strong>Críticos:</strong> {movie.tomatoes.critic.rating}/10 
                          {movie.tomatoes.critic.meter ? ` (${movie.tomatoes.critic.meter}%)` : ''}
                        </p>
                      )}
                      
                      {movie.tomatoes.viewer && (
                        <p className="mb-0">
                          <strong>Audiência:</strong> {movie.tomatoes.viewer.rating}/5
                          {movie.tomatoes.viewer.meter ? ` (${movie.tomatoes.viewer.meter}%)` : ''}
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
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-success text-white">Metacritic</div>
                    <div className="card-body">
                      <p className="mb-0">
                        <strong>Pontuação:</strong> {movie.metacritic}/100
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Prêmios */}
          {movie.awards && (
            <div className="mb-4">
              <h3>Prêmios</h3>
              <p>{movie.awards.text}</p>
            </div>
          )}
          
          {/* Sinopse */}
          <h3>Sinopse</h3>
          <p className="lead">{movie.fullplot || movie.plot}</p>
          
          {/* Informações adicionais */}
          <div className="row mt-4">
            {movie.countries && movie.countries.length > 0 && (
              <div className="col-md-6">
                <p><strong>Países:</strong> {movie.countries.join(', ')}</p>
              </div>
            )}
            {movie.languages && movie.languages.length > 0 && (
              <div className="col-md-6">
                <p><strong>Idiomas:</strong> {movie.languages.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h2 className="mb-4">Comentários ({comments.length})</h2>
          
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">Adicionar um comentário</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmitComment}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nome</label>
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
                  <label htmlFor="text" className="form-label">Comentário</label>
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
                  <label htmlFor="rating" className="form-label">Avaliação</label>
                  <select
                    className="form-select"
                    id="rating"
                    name="rating"
                    value={newComment.rating}
                    onChange={handleInputChange}
                  >
                    <option value="1">1 - Mau</option>
                    <option value="2">2 - Regular</option>
                    <option value="3">3 - Bom</option>
                    <option value="4">4 - Muito Bom</option>
                    <option value="5">5 - Excelente</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Enviar Comentário
                </button>
              </form>
            </div>
          </div>
          
          {comments.length === 0 ? (
            <div className="alert alert-info">Nenhum comentário ainda. Seja o primeiro a comentar!</div>
          ) : (
            <div className="comment-list">
              {comments.map(comment => (
                <div key={comment._id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">{comment.name}</h5>
                      <div className="badge bg-primary">
                        {comment.rating ? comment.rating : '?'}/5 ⭐
                      </div>
                    </div>
                    <p className="card-text">{comment.text}</p>
                    <small className="text-muted">
                      {new Date(comment.date).toLocaleDateString('pt-BR')}
                    </small>
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