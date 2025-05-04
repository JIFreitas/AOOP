import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUserProfile, 
  updateUserProfile, 
  isAuthenticated,
  getCurrentUser,
  logout,
  UpdateUserData
} from '../services/authService';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        const user = await getUserProfile();
        if (!user) {
          throw new Error('Não foi possível carregar dados do utilizador');
        }

        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email
        }));
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Erro ao carregar dados do perfil. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('As novas palavras-passe não coincidem');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setUpdating(true);

    const updateData: UpdateUserData = {
      name: formData.name
    };

    const currentUser = getCurrentUser();
    if (currentUser && formData.email !== currentUser.email) {
      updateData.email = formData.email;
    }

    if (formData.currentPassword && formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    try {
      const response = await updateUserProfile(updateData);
      
      if (response.success) {
        setSuccess('Perfil atualizado com sucesso');
        setEditMode(false);
      } else {
        setError(response.message || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      setError('Erro ao ligar ao servidor. Tente novamente mais tarde.');
      console.error('Error updating profile:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-cosmic" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">A carregar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card space-card shadow">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 cosmic-title">{editMode ? 'Editar Perfil' : 'Meu Perfil'}</h2>
              <div>
                {!editMode ? (
                  <button 
                    className="btn btn-cosmic me-2" 
                    onClick={handleToggleEditMode}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Editar
                  </button>
                ) : (
                  <button 
                    className="btn btn-cosmic-outline me-2" 
                    onClick={handleToggleEditMode}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                )}
                <button 
                  className="btn btn-planet" 
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sair
                </button>
              </div>
            </div>
            
            {error && (
              <div className="alert alert-planet">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-cosmic">
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold">
                  <i className="bi bi-person-fill me-2 text-cosmic"></i>
                  Nome
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="form-label fw-bold">
                  <i className="bi bi-envelope-fill me-2 text-cosmic"></i>
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </div>
              
              {editMode && (
                <>
                  <hr className="my-4" style={{ borderColor: 'var(--space-purple)' }} />
                  <h5 className="mb-3 text-cosmic">
                    <i className="bi bi-key me-2"></i>
                    Alterar Palavra-passe (opcional)
                  </h5>
                  
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label fw-bold">Palavra-passe Atual</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-bold">Nova Palavra-passe</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      minLength={6}
                    />
                    <small className="text-muted">A palavra-passe deve ter pelo menos 6 caracteres</small>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-bold">Confirmar Nova Palavra-passe</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-cosmic"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          A guardar...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Guardar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;