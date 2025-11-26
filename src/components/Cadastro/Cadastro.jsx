import React from 'react'
import { Link } from 'react-router-dom'
import './Cadastro.css'

const Cadastro = () => {
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
          
          <form className="form">
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Name"
                className="input-field"
              />
            </div>
            
            <div className="input-group">
              <input 
                type="email" 
                placeholder="E-mail"
                className="input-field"
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Senha"
                className="input-field"
              />
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Confirmar Senha"
                className="input-field"
              />
            </div>
            
            <button type="submit" className="submit-button">
              Cadastrar
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