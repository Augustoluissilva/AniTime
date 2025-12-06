import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- COMPONENTES DE LAYOUT ---
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// --- COMPONENTES DA LANDING PAGE ---
import WelcomeSection from './components/WelcomeSection/WelcomeSection';
import BenefitsSection from './components/BenefitsSection/BenefitsSection';
import AnimeCarousel from './components/AnimeCarousel/AnimeCarousel';

// --- COMPONENTES DAS PÁGINAS ---
import Cadastro from './components/Cadastro/Cadastro';
import Login from './components/Login/Login';
import Profile from './components/Profile/Profile';
import EpisodePlayer from './components/EpisodePlayer/EpisodePlayer';
import Home from './components/Home/Home'; 

// --- ESTILOS GLOBAIS ---
import './App.css';

// Layout padrão (Header + Conteúdo + Footer)
// Ideal para páginas públicas ou que necessitam do rodapé
const Layout = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: 'calc(100vh - 150px)' }}>
      {children}
    </main>
    <Footer />
  </>
);

// Página Inicial (Landing Page para usuários não logados)
const LandingPage = () => (
  <>
    <WelcomeSection />
    <AnimeCarousel />
    <BenefitsSection />
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 1. Rota Raiz (Landing Page) */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />

          {/* 2. Rota Home (Dashboard Principal após login) */}
          {/* Nota: Home tem seu próprio Header interno, por isso não usa o <Layout> */}
          <Route path="/home" element={<Home />} />

          {/* 3. Rotas de Autenticação */}
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />

          {/* 4. Rota de Perfil */}
          <Route path="/perfil" element={<Layout><Profile /></Layout>} />

          {/* 5. Rotas de Player (Assistir) */}
          
          {/* Rota genérica para quando clica em 'Play' no Header ou Cards da Home */}
          <Route path="/play" element={<EpisodePlayer />} />

          {/* Rota específica para assistir um episódio (com parâmetros) */}
          <Route path="/watch/:animeId/:episodeId" element={<EpisodePlayer />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;