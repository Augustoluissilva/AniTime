import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WelcomeSection from './components/WelcomeSection/WelcomeSection'
import BenefitsSection from './components/BenefitsSection/BenefitsSection'
import AnimeCarousel from './components/AnimeCarousel/AnimeCarousel'

import Cadastro from './components/Cadastro/Cadastro'
import Login from './components/Login/Login'
import EpisodePlayer from './components/EpisodePlayer/EpisodePlayer'
import Profile from './components/Profile/Profile'

// --- CORREÇÃO AQUI ---
// Assumindo que você colocou a pasta Home dentro de components junto com as outras:
import Home from './components/Home/Home' 
// OBS: Se a pasta Home estiver solta na raiz 'src', mude para './Home/Home'

import './App.css'

// [DEFINIÇÃO] Layout padrão (com Header e Footer genéricos)
const Layout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
)

// [DEFINIÇÃO] Página Inicial (Landing Page para quem não está logado)
const LandingPage = () => (
  <>
    <WelcomeSection />
    <AnimeCarousel />
    <BenefitsSection />
  </>
)

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota Raiz (Landing Page pública) */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />

          {/* Rota Home (Dashboard Pós-Login) - Sem Layout genérico */}
          <Route path="/home" element={<Home />} />

          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Layout><Profile /></Layout>} />
          <Route path="/watch/:animeId/:episodeId" element={<EpisodePlayer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App