// src/App.jsx

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
// --- NOVAS IMPORTAÇÕES PARA O LAYOUT E HOMEPAGE ---
import Footer from './components/Footer/Footer'
import WelcomeSection from './components/WelcomeSection/WelcomeSection'
import BenefitsSection from './components/BenefitsSection/BenefitsSection'
import AnimeCarousel from './components/AnimeCarousel/AnimeCarousel'
// --------------------------------------------------
import Cadastro from './components/Cadastro/Cadastro'
import Login from './components/Login/Login'
import EpisodePlayer from './components/EpisodePlayer/EpisodePlayer'
// --- NOVA IMPORTAÇÃO: Profile ---
import Profile from './components/Profile/Profile'
import './App.css'

// [DEFINIÇÃO] Componente de Layout que envolve a página com Header e Footer.
const Layout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
)

// [DEFINIÇÃO] Componente da Página Inicial, agrupando as seções.
const HomePage = () => (
  <>
    <WelcomeSection />
    <AnimeCarousel />
    <BenefitsSection />
  </>
)

// [DEFINIÇÃO] Componente da Página Play (Exemplo, usando o carrossel).
const PlayPage = () => (
  <div style={{ minHeight: '80vh', padding: '4rem 2rem', background: 'var(--purple-bg)' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--neon-purple)', textAlign: 'center', marginBottom: '3rem' }}>
        Mais Animes!
      </h1>
      <AnimeCarousel />
    </div>
  </div>
)

function App() {
  // A cor roxa (var(--neon-purple)) e var(--purple-bg) são do App.css
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Agora, Layout e HomePage estão definidos */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/play" element={<Layout><PlayPage /></Layout>} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          {/* ROTA DO PERFIL (NOVA) */}
          <Route path="/perfil" element={<Layout><Profile /></Layout>} />
          {/* Rota para assistir: /watch/spy-family/1 */}
          <Route path="/watch/:animeId/:episodeId" element={<EpisodePlayer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App