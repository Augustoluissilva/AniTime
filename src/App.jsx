// src/App.jsx

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
// ...
import Cadastro from './components/Cadastro/Cadastro'
import Login from './components/Login/Login'
import EpisodePlayer from './components/EpisodePlayer/EpisodePlayer' // [NOVA IMPORTAÇÃO]
import './App.css'

// ... (PlayPage, HomePage, and Layout components remain the same) ...

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/play" element={<Layout><PlayPage /></Layout>} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          {/* Rota para assistir: /watch/spy-family/1 */}
          <Route path="/watch/:animeId/:episodeId" element={<EpisodePlayer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App