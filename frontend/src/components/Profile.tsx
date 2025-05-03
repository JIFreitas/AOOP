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
          throw new Error('Não foi possível carregar dados do usuário');
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
    // Limpar campos de password ao entrar/sair do modo de edição
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

    // Validar formulário
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('As novas passwords não coincidem');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres');
      return;
    }

    setUpdating(true);

    // Preparar dados para atualização
    const updateData: UpdateUserData = {
      name: formData.name
    };

    // Incluir email se foi alterado
    const currentUser = getCurrentUser();
    if (currentUser && formData.email !== currentUser.email) {
      updateData.email = formData.email;
    }

    // Incluir password se estiver sendo alterada
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
      setError('Erro ao conectar ao servidor. Tente novamente mais tarde.');
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
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">{editMode ? 'Editar Perfil' : 'Meu Perfil'}</h2>
              <div>
                {!editMode ? (
                  <button 
                    className="btn btn-primary me-2" 
                    onClick={handleToggleEditMode}
                  >
                    Editar
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary me-2" 
                    onClick={handleToggleEditMode}
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  className="btn btn-outline-danger" 
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            </div>
            
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}
            
            {success && (
              <div className="alert alert-success">{success}</div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold">Nome</label>
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
                <label htmlFor="email" className="form-label fw-bold">Email</label>
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
                  <hr className="my-4" />
                  <h5 className="mb-3">Alterar Password (opcional)</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label fw-bold">Password Atual</label>
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
                    <label htmlFor="newPassword" className="form-label fw-bold">Nova Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      minLength={6}
                    />
                    <small className="text-muted">A password deve ter pelo menos 6 caracteres</small>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-bold">Confirmar Nova Password</label>
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
                      className="btn btn-primary"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          A salvar...
                        </>
                      ) : 'Salvar Alterações'}
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