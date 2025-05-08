import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout, User } from '../services/authService';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticação sempre que o componente montar ou a rota mudar
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    };
    
    checkAuth();
    
    // Adicionar evento para verificar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user' || e.key === null) {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Evento personalizado para atualizações de autenticação na mesma janela
    const handleCustomEvent = () => checkAuth();
    window.addEventListener('auth-change', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleCustomEvent);
    };
  }, [location.pathname]); // Verificar também quando a rota mudar
  
  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUser(null);
    // Disparar evento para informar outras partes do app sobre a mudança de autenticação
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark bg-space navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand cosmic" to="/">
          MoviePlanet
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home page</Link>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            {authenticated ? (
              <>
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link dropdown-toggle" 
                    id="userDropdown" 
                    type="button"
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    <i className="bi bi-person-circle me-1"></i> {user?.name || 'Utilizador'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" 
                      style={{ background: 'var(--space-deeper)', borderColor: 'var(--space-blue)' }}>
                    <li>
                      <Link className="dropdown-item text-light" to="/profile">
                        <i className="bi bi-gear me-2"></i> O Meu Perfil
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" style={{ borderColor: 'var(--space-blue)' }} /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Sair
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link btn btn-cosmic-outline mx-1 px-3 py-1 mt-1" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar sessão
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-cosmic px-3 py-1 mx-1 mt-1" to="/register">
                    <i className="bi bi-person-plus me-1"></i> Registar
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;