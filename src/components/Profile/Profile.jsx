// src/components/Profile/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import './Profile.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Monitora o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Redireciona para a página inicial ou de login após o logout
      navigate('/login') 
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  if (loading) {
    return (
        <div className="profile-container">
            <div className="profile-card">
                <p>Carregando...</p>
            </div>
        </div>
    )
  }

  // Se não estiver logado, exibe a mensagem de acesso negado
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-title">Acesso Negado</h2>
          <p className="not-logged-in">Você precisa estar logado para acessar esta página.</p>
          <Link to="/login" className="logout-button" style={{textDecoration: 'none', display: 'inline-block', background: 'var(--neon-purple)'}}>
            Ir para Login
          </Link>
        </div>
      </div>
    )
  }

  // Se estiver logado, exibe os dados
  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Meu Perfil</h2>
        <div className="profile-info">
          <p><strong>Nome:</strong> {user.displayName || 'Não definido'}</p>
          <p><strong>E-mail:</strong> {user.email}</p>
          <p><strong>ID de Usuário (UID):</strong> {user.uid}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Sair (Logout)
        </button>
      </div>
    </div>
  )
}

export default Profile