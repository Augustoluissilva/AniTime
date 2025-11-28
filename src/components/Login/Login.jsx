import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Importa função do Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/config'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Tenta fazer o login
      await signInWithEmailAndPassword(auth, email, password)

      console.log("Usuário logado com sucesso.")
      
      // Redireciona para a home após o sucesso
      navigate('/') 

    } catch (firebaseError) {
      console.error("Erro no login:", firebaseError.code, firebaseError.message)
      
      let friendlyError;
      switch (firebaseError.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyError = 'E-mail ou senha incorretos.'
          break;
        case 'auth/too-many-requests':
          friendlyError = 'Acesso bloqueado temporariamente por muitas tentativas falhas.'
          break;
        default:
          friendlyError = 'Erro ao fazer login. Tente novamente.'
      }
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      {/* Coluna esquerda com formulário */}
      <div className="left-column-login">
        <div className="card-login">
          <h1 className="title-login">Login</h1>
          
          <form className="form-login" onSubmit={handleSubmit}>
            
            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
            
            <div className="input-group-login">
              <input 
                type="email" 
                placeholder="E-mail"
                className="input-field-login"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group-login">
              <input 
                type="password" 
                placeholder="Senha"
                className="input-field-login"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="submit-button-login" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
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