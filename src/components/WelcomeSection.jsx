import React from 'react'
import narutoImage from '../assets/naruto.png'

const WelcomeSection = () => {
  return (
    <section className="welcome-section">
      <div className="welcome-container">
        <div className="welcome-content">
          <h2 className="welcome-title">
            Bem-vindo à <span className="title-highlight">AniTime</span>
          </h2>
          <div className="welcome-text">
            <p>O seu novo ponto de encontro</p>
            <p>para mergulhar no universo dos</p>
            <p>animes!</p>
            <br />
            <p>Aqui, você encontra seus títulos</p>
            <p>favoritos reunidos em um só lugar,</p>
            <p>com uma experiência moderna, fluida</p>
            <p>e feita especialmente para fãs de</p>
            <p>todas as idades.</p>
          </div>
          <button className="cta-button">
            ASSISTA JÁ!
          </button>
        </div>
        <div className="welcome-image">
          <img src={narutoImage} alt="Naruto" />
          <div className="image-glow"></div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection