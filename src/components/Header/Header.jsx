import React from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const Header = () => {
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
          <Link to="/login" className="nav-link entrar-btn">Entrar</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header