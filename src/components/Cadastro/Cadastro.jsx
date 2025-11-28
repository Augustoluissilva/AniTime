import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Importa funções do Firebase Auth
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase/config'
import './Cadastro.css'

const Cadastro = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    try {
      // 1. Cria a conta do usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // 2. Atualiza o perfil para incluir o nome
      await updateProfile(userCredential.user, {
        displayName: name
      })

      console.log("Usuário cadastrado com sucesso:", userCredential.user)
      
      // 3. Redireciona após o sucesso
      navigate('/') 

    } catch (firebaseError) {
      console.error("Erro no cadastro:", firebaseError.code, firebaseError.message)
      
      let friendlyError;
      switch (firebaseError.code) {
        case 'auth/invalid-email':
          friendlyError = 'E-mail inválido.'
          break;
        case 'auth/weak-password':
          friendlyError = 'A senha deve ter pelo menos 6 caracteres.'
          break;
        case 'auth/email-already-in-use':
          friendlyError = 'Este e-mail já está em uso.'
          break;
        default:
          friendlyError = 'Erro ao cadastrar. Tente novamente.'
      }
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cadastro-container">
      <div className="cadastro-content">
        
        {/* Coluna da Imagem - ESQUERDA no Cadastro */}
        <div className="cadastro-image-column">
          <div className="scanline"></div>
          <div className="cadastro-image-overlay">
            <div className="cadastro-floating-elements">
              <div className="cadastro-floating-element cadastro-element-1"></div>
              <div className="cadastro-floating-element cadastro-element-2"></div>
              <div className="cadastro-floating-element cadastro-element-3"></div>
            </div>
          </div>
        </div>

        {/* Coluna do Formulário - DIREITA no Cadastro */}
        <div className="cadastro-form-column">
          <div className="cadastro-glass-card">
            <div className="cadastro-card-header">
              <h1 className="cadastro-title">Cadastre-se</h1>
              <div className="cadastro-accent-line"></div>
            </div>

            <form className="cadastro-form" onSubmit={handleSubmit}>
              
              {error && <p className="cadastro-error-message">{error}</p>}
              
              <div className="cadastro-input-group">
                <input 
                  type="text" 
                  placeholder="Name"
                  className="cadastro-input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="cadastro-input-glow"></div>
              </div>
              
              <div className="cadastro-input-group">
                <input 
                  type="email" 
                  placeholder="E-mail"
                  className="cadastro-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="cadastro-input-glow"></div>
              </div>
              
              <div className="cadastro-input-group">
                <input 
                  type="password" 
                  placeholder="Senha"
                  className="cadastro-input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="cadastro-input-glow"></div>
              </div>
              
              <div className="cadastro-input-group">
                <input 
                  type="password" 
                  placeholder="Confirmar Senha"
                  className="cadastro-input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="cadastro-input-glow"></div>
              </div>
              
              <button 
                type="submit" 
                className={`cadastro-submit-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                <span className="cadastro-button-text">
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </span>
                <div className="cadastro-button-glow"></div>
              </button>

              <div className="cadastro-links">
                <Link to="/login" className="cadastro-toggle-mode">
                  Já tem uma conta? Faça login
                </Link>
              </div>

              {/* Texto decorativo anime */}
              <div className="cadastro-anime-text">
                小树枝的从仆子中
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;