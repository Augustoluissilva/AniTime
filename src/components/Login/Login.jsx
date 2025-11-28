import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Sua lógica de login aqui
    setTimeout(() => {
      setLoading(false)
      console.log('Login attempt:', { email, password })
    }, 1500)
  }

  return (
    <div className="login-container">
      <div className="login-content">
        
        {/* Coluna do Formulário - ESQUERDA no Login */}
        <div className="login-form-column">
          <div className="login-glass-card">
            <div className="login-card-header">
              <h1 className="login-title">Login</h1>
              <div className="login-accent-line"></div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <input 
                  type="email"
                  placeholder="E-mail"
                  className="login-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="login-input-glow"></div>
              </div>

              <div className="login-input-group">
                <input 
                  type="password"
                  placeholder="Senha"
                  className="login-input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="login-input-glow"></div>
              </div>

              <button 
                type="submit" 
                className={`login-submit-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                <span className="login-button-text">
                  {loading ? 'Entrando...' : 'Entrar'}
                </span>
                <div className="login-button-glow"></div>
              </button>

              <div className="login-links">
                <Link to="/cadastro" className="login-toggle-mode">
                  Não tem uma conta? Registre-se
                </Link>
              </div>

              {/* Texto decorativo anime */}
              <div className="login-anime-text">
                古見さんは。
              </div>
            </form>
          </div>
        </div>

        {/* Coluna da Imagem - DIREITA no Login */}
        <div className="login-image-column">
          <div className="scanline"></div>
          {/* Texto decorativo da imagem */}
          <div className="login-image-text">
            水球<br />
            映画<br />
            数码火作号书
          </div>
          <div className="login-image-overlay">
            <div className="login-floating-elements">
              <div className="login-floating-element login-element-1"></div>
              <div className="login-floating-element login-element-2"></div>
              <div className="login-floating-element login-element-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;