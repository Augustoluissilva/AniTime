import React, { useState, useEffect } from 'react'

const Header = () => {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > lastY && y > 50)
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${hidden ? 'header--hidden' : ''}`}>
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