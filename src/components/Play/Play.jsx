import React from 'react';
import { ThumbsUp, Download, Play } from 'lucide-react';

// Imports dos componentes e estilos reais
import Header from '../Header/Header';
import './EpisodePlayer.css';

// Imports das imagens
// Certifique-se de que os caminhos estão corretos conforme a estrutura do seu projeto
import posterSpy from '../../assets/SPY_FAMILY.png'; 
import thumb1 from '../../assets/SPY_FAMILY.png'; 

const EpisodePlayer = () => {

  const currentEpisodeInfo = {
    number: "1",
    title: "Operação Strix",
    duration: "24 minutos",
    date: "9/5/2022"
  };

  const episodesList = [
    { id: 2, title: "Garantir uma esposa", duration: "24 minutos", img: thumb1 },
    { id: 3, title: "Preparativos para a entrevista", duration: "24 minutos", img: thumb1 },
    { id: 4, title: "A entrevista do colégio de elite", duration: "24 minutos", img: thumb1 },
    { id: 5, title: "Aprovados ou reprovados?", duration: "24 minutos", img: thumb1 },
    { id: 6, title: "Esquemas de amizade", duration: "24 minutos", img: thumb1 },
    { id: 7, title: "O segundo filho do alvo", duration: "24 minutos", img: thumb1 },
  ];

  return (
    <div className="play-page-container">
      <Header />

      <div className="play-content-wrapper">
        
        {/* COLUNA ESQUERDA: Pôster e Info */}
        <div className="left-panel">
          <div className="poster-frame">
            <img src={posterSpy} alt="Spy x Family Poster" className="anime-poster-vertical" />
          </div>

          <div className="episode-info-card">
            <div className="info-text">
              <h3>{currentEpisodeInfo.number}.{currentEpisodeInfo.title}</h3>
              <p>{currentEpisodeInfo.duration}</p>
              <p className="info-date">{currentEpisodeInfo.date}</p>
            </div>
            
            <div className="action-icons">
              <button className="icon-btn"><ThumbsUp size={24} /></button>
              <button className="icon-btn"><Download size={24} /></button>
            </div>
          </div>
        </div>

        {/* ÁREA PRINCIPAL ROXA: Vídeo e Lista */}
        <div className="main-player-frame">
          
          {/* Player de Vídeo */}
          <div className="video-area">
            <div className="video-placeholder">
               <img src={thumb1} alt="Video Thumbnail" className="video-bg" />
               <div className="play-button-overlay">
                  <Play size={35} fill="black" style={{marginLeft:'5px'}} />
               </div>
            </div>
          </div>

          {/* Lista de Episódios */}
          <div className="episodes-list-container">
            <div className="episodes-scroll">
              {episodesList.map((ep) => (
                <div key={ep.id} className="episode-item">
                  <div className="episode-thumb">
                    <img src={ep.img} alt={ep.title} />
                  </div>
                  <div className="episode-meta">
                    <span className="ep-title">{ep.id}.{ep.title}</span>
                    <span className="ep-duration">{ep.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EpisodePlayer;