import React from 'react'

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-text">AniTime</span>
        </div>
        <nav className="nav-menu">
          <a href="#home" className="nav-link">Home</a>
          <a href="#play" className="nav-link">Play</a>
          <a href="#entrar" className="nav-link entrar-btn">Entrar</a>
        </nav>
      </div>
    </header>
  )
}

export default Header