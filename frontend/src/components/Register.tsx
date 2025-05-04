import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
// Importar a imagem de fundo
import backgroundImage from '../assets/images/fundo.jpg';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('As palavras-passe não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        navigate('/profile');
      } else {
        setError(response.message || 'Erro ao criar conta. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Erro ao ligar ao servidor. Tente novamente mais tarde.');
      console.error('Register error:', err);
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
              <h2 className="text-center mb-4 cosmic-title">Criar Conta</h2>
              
              {error && (
                <div className="alert alert-planet">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-bold text-start d-block">
                    <i className="bi bi-person me-2 text-cosmic"></i>Nome
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
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
                
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <label htmlFor="password" className="form-label fw-bold text-start mb-0 me-2">
                      <i className="bi bi-key me-2 text-cosmic"></i>Palavra-passe
                    </label>
                    <span 
                      className="btn btn-sm btn-cosmic rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ width: '24px', height: '24px', padding: '0', cursor: 'help' }}
                      title="A palavra-passe deve ter pelo menos 6 caracteres"
                    >
                      <i className="bi bi-info-lg"></i>
                    </span>
                  </div>
                  <input
                    type="password"
                    className="form-control mt-2"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-bold text-start d-block">
                    <i className="bi bi-key-fill me-2 text-cosmic"></i>Confirmar Palavra-passe
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
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
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Registar
                      </>
                    )}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <p>Já tem uma conta? <Link to="/login" className="text-cosmic">Inicie sessão</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;