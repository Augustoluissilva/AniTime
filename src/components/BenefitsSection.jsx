import React from 'react'
import onePieceImage from '../assets/one_piece.png'

const BenefitsSection = () => {
  const benefits = [
    {
      id: 1,
      icon: '⚡',
      title: 'Acesso rápido',
      description: 'Navegação instantânea'
    },
    {
      id: 2,
      icon: '🎨',
      title: 'Interface moderna',
      description: 'Design futurista'
    },
    {
      id: 3,
      icon: '🎯',
      title: 'Recomendação personalizada',
      description: 'Descubra novos animes'
    },
    {
      id: 4,
      icon: '🛡️',
      title: 'Ambiente seguro',
      description: 'Proteção de dados'
    }
  ]

  return (
    <section className="benefits-section">
      <div className="benefits-container">
        <div className="benefits-image">
          <img src={onePieceImage} alt="One Piece" />
          <div className="image-glow"></div>
        </div>
        <div className="benefits-content">
          <h2 className="benefits-title">
            ✨ Benefícios que tornam sua experiência única:
          </h2>
          <div className="benefits-grid">
            {benefits.map(benefit => (
              <div key={benefit.id} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <div className="benefit-text">
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection