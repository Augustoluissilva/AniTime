import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Importa auth e onAuthStateChanged
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Monitora o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Função para verificar se a rota é a ativa
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-text" style={{ textDecoration: 'none' }}>
            Ani<span>Time</span>
          </Link>
        </div>
        
        <nav className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          
          <Link 
            to="/play" 
            className={`nav-link ${isActive('/Play') ? 'active' : ''}`}
          >
            Play
          </Link>
          
          {loadingAuth ? (
            // Placeholder enquanto carrega
            <div className="auth-placeholder"></div>
          ) : user ? (
            // Usuário Logado
            <Link 
              to="/perfil" 
              className={`nav-link entrar-btn ${isActive('/perfil') ? 'active' : ''}`}
            >
              Perfil
            </Link>
          ) : (
            // Usuário Deslogado
            <Link to="/login" className="nav-link entrar-btn">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;