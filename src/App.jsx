import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import AnimeCarousel from './components/AnimeCarousel/AnimeCarousel'
import WelcomeSection from './components/WelcomeSection/WelcomeSection'
import BenefitsSection from './components/BenefitsSection/BenefitsSection'
import Footer from './components/Footer/Footer'
import Cadastro from './components/Cadastro/Cadastro'
import Login from './components/Login/Login'
import './App.css'

// Componente para a página Play
const PlayPage = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center', 
    minHeight: '60vh', 
    background: '#0A0014', 
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮 Página Play</h1>
    <p style={{ fontSize: '1.2rem' }}>Esta é a página de reprodução de animes.</p>
  </div>
)

// Componente Home
const HomePage = () => (
  <>
    <AnimeCarousel />
    <WelcomeSection />
    <BenefitsSection />
  </>
)

// Layout com Header e Footer
const Layout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
)

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/play" element={<Layout><PlayPage /></Layout>} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App