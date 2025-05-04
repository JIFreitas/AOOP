import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
// Importar a imagem de fundo
import backgroundImage from '../assets/images/fundo.jpg';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Disparar evento para informar outras partes do app que o usuário está logado
        window.dispatchEvent(new Event('auth-change'));
        navigate('/profile');
      } else {
        setError(response.message || 'Erro ao iniciar sessão. Verifique as suas credenciais.');
      }
    } catch (err) {
      setError('Erro ao ligar ao servidor. Tente novamente mais tarde.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fullscreen-bg">
      <div 
        className="fullscreen-bg-image"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      ></div>
      
      <div className="auth-container">
        <div className="col-md-6 col-lg-5">
          <div className="card space-card" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(10, 11, 23, 0.75)' }}>
            <div className="card-body p-5">
              <h2 className="text-center mb-4 cosmic-title">Iniciar Sessão</h2>
              
              {error && (
                <div className="alert alert-planet">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold text-start d-block">
                    <i className="bi bi-envelope me-2 text-cosmic"></i>Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-bold text-start d-block">
                    <i className="bi bi-key me-2 text-cosmic"></i>Palavra-passe
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-cosmic"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        A processar...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Entrar
                      </>
                    )}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <p>Não tem uma conta? <Link to="/register" className="text-cosmic">Registe-se</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;