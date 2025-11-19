import React from 'react'
import Header from './components/Header'
import AnimeCarousel from './components/AnimeCarousel'
import WelcomeSection from './components/WelcomeSection'
import BenefitsSection from './components/BenefitsSection'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="App">
      <Header />
      <AnimeCarousel />
      <WelcomeSection />
      <BenefitsSection />
      <Footer />
    </div>
  )
}

export default App