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

            {/* Link para cadastro */}
            <div className="register-link">
              <span>Não tem uma conta? </span>
              <Link to="/cadastro" className="register-button">
                Registre-se
              </Link>
            </div>

            {/* Botão Voltar */}
            <Link to="/" className="back-button">
              Voltar para Home
            </Link>
          </form>
          
          <div className="anime-text-login">古見さんは。</div>
        </div>
      </div>
      
      {/* Coluna direita com imagem */}
      <div className="right-column-login">
        <div className="image-overlay-login"></div>
      </div>
    </div>
  )
}

export default Login