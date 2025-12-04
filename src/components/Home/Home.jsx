import React from 'react';
import { Search, Play } from 'lucide-react';

/* --- IMPORTS DE COMPONENTES --- */
import Header from '../Header/Header';
import AnimeCarousel from '../AnimeCarousel/AnimeCarousel';

/* --- IMPORTS DE ESTILO --- */
import './Home.css'; 

/* --- IMPORTS DE IMAGENS --- */
// Hero / Animes Principais
import spyFamily from '../../assets/SPY_FAMILY.png'; 
import freeren from '../../assets/FREEREN.png';
import myHero from '../../assets/My_Hero.png';
import Mashle from '../../assets/Mashle.jpg';
import Demon_Slayer from '../../assets/Demon_Slayer.webp';

// Sugestões (Nomes exatos conforme solicitado)
import Mob_Psycho from '../../assets/Mob_Psycho.webp';
import Charlotte from '../../assets/Charlotte2.png';
import Assassination_Classroom from '../../assets/Assassination_Classroom.jpg';
import One_Piece from '../../assets/one_piece.png'; 

// Top Mais Assistidos (Nomes exatos conforme solicitado)
import Apothecary_Diaries from '../../assets/the_apothecary_diaries.jpg';
import Hanako_Kun from '../../assets/Hanako_Kun.jpg';
import Totoro from '../../assets/Totoro.jpg';
import Attack_on_Titan from '../../assets/Attack_on_Titan.jpg';

// Continuar Assistindo (Nomes exatos conforme solicitado)
import Gachiakuta from '../../assets/Gachiakuta.jpg';
import Fullmetal_Alchemist from '../../assets/fullmetal_Alchemist.jpg';
import Bleach from '../../assets/Bleach.jpg';

const Home = () => {
  
  // 1. Carrossel Principal (Hero)
  const heroAnimes = [
    { id: 1, title: "Mashle", image: Mashle, isFeatured: false },
    { id: 2, title: "My Hero Academia", image: myHero, isFeatured: false },
    { id: 3, title: "Spy x Family", image: spyFamily, isFeatured: true },
    { id: 4, title: "Frieren", image: freeren, isFeatured: false },
    { id: 5, title: "Demon Slayer", image: Demon_Slayer, isFeatured: false },
  ];

  // 2. Sugestões para você
  const suggestions = [
    { id: 10, title: "Mob Psycho 100", image: Mob_Psycho },
    { id: 11, title: "Charlotte", image: Charlotte },
    { id: 12, title: "Assassination Classroom", image: Assassination_Classroom },
    { id: 13, title: "One Piece", image: One_Piece },
  ];

  // 3. TOP mais assistidos
  const topAnimes = [
    { id: 20, title: "The Apothecary Diaries", image: Apothecary_Diaries },
    { id: 21, title: "Demon Slayer", image: Demon_Slayer },
    { id: 22, title: "Toilet-bound Hanako-kun", image: Hanako_Kun },
    { id: 23, title: "Meu Amigo Totoro", image: Totoro },
    { id: 24, title: "Attack on Titan", image: Attack_on_Titan },
  ];

  // 4. Continuar assistindo
  const continueWatching = [
    { id: 30, title: "Gachiakuta", image: Gachiakuta, progress: 85 },
    { id: 31, title: "Fullmetal Alchemist", image: Fullmetal_Alchemist, progress: 70 },
    { id: 32, title: "Bleach", image: Bleach, progress: 20 },
  ];

  return (
    <div className="anitime-home">
      {/* 1. Header importado */}
      <Header />

      <div className="main-content">
        
        {/* 2. Carrossel Principal importado */}
        <AnimeCarousel animes={heroAnimes} />

        {/* 3. Seção: Sugestões */}
        <div className="section-container section-sugestoes">
          {/* Faixa roxa de fundo */}
          <div className="suggestions-strip"></div>
          
          {/* Título fora da faixa roxa para ficar no fundo preto */}
          <h3 className="section-title">Sugestões para você:</h3>
          
          <div className="carousel">
            {suggestions.map((anime) => (
              <div key={anime.id} className="suggestion-card">
                <img src={anime.image} alt={anime.title} />
                <div className="card-play-icon">
                    <Play size={14} fill="white" color="white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Seção: Top Mais Assistidos */}
        <div className="section-container">
           <div className="top-banner-container">
              <div className="top-label-wrapper">
                  <div className="top-label-text">
                      TOP mais<br/>assistidos
                  </div>
              </div>
              
              <div className="search-container">
                  <input type="text" placeholder="Pesquisar..." className="search-input" />
                  <Search size={16} color="#888" />
              </div>
           </div>

           <div className="top-grid">
              {topAnimes.map((anime) => (
                  <div key={anime.id} className="top-card">
                      <img src={anime.image} alt={anime.title} />
                  </div>
              ))}
           </div>
        </div>

        {/* 5. Seção: Continuar Assistindo */}
        <div className="section-container section-continue">
            <h3 className="section-title">Continuar assistindo:</h3>
            <div className="carousel">
                {continueWatching.map((anime) => (
                    <div key={anime.id} className="continue-card">
                        <img src={anime.image} alt={anime.title} />
                        <div className="card-play-icon">
                            <Play size={14} fill="white" color="white" />
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{width: `${anime.progress}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Home;