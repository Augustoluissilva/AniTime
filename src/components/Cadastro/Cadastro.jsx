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
    <div className="container">
      {/* Coluna esquerda com imagem - vai usar a imagem do CSS */}
      <div className="left-column">
        <div className="image-overlay"></div>
        <div className="anime-text">小树枝的从仆子中</div>
      </div>
      
      {/* Coluna direita com formulário */}
      <div className="right-column">
        <div className="card">
          <h1 className="title">Cadastre-se</h1>
          
          <form className="form" onSubmit={handleSubmit}>
            
            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
            
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input 
                type="email" 
                placeholder="E-mail"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Senha"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Confirmar Senha"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>

            {/* Botão Voltar */}
            <Link to="/" className="back-button">
              Voltar para Home
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Cadastro