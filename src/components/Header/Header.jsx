// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// Importa auth e onAuthStateChanged
import { onAuthStateChanged } from 'firebase/auth' 
import { auth } from '../../firebase/config'
import './Header.css'

const Header = () => {
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    // Monitora o estado de autenticação para exibir o link correto
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoadingAuth(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-text" style={{ textDecoration: 'none' }}>
            AniTime
          </Link>
        </div>
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/play" className="nav-link">Play</Link>
          
          {loadingAuth ? (
            // Exibe um placeholder (espaço em branco) enquanto carrega o estado de autenticação
            <div style={{ width: '80px', height: '35px', borderRadius: '25px', backgroundColor: '#1A0E2A' }}></div>
          ) : user ? (
            // Usuário Logado: Link para o perfil
            // Usamos a classe 'entrar-btn' para manter o estilo de botão
            <Link to="/perfil" className="nav-link entrar-btn">Perfil</Link>
          ) : (
            // Usuário Deslogado: Link para login
            <Link to="/login" className="nav-link entrar-btn">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header