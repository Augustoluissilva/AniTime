import React from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
  return (
    <div className="container">
      {/* Coluna esquerda com formulário */}
      <div className="left-column-login">
        <div className="card-login">
          <h1 className="title-login">Login</h1>
          
          <form className="form-login">
            <div className="input-group-login">
              <input 
                type="email" 
                placeholder="E-mail"
                className="input-field-login"
              />
            </div>
            
            <div className="input-group-login">
              <input 
                type="password" 
                placeholder="Senha"
                className="input-field-login"
              />
            </div>
            
            <button type="submit" className="submit-button-login">
              Entrar
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
    
  );
};

export default Login;