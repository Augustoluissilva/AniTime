import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig' 
import './EpisodePlayer.css'

const EpisodePlayer = () => {
  const { animeId, episodeId } = useParams()
  const [videoUrl, setVideoUrl] = useState(null)
  const [episodeTitle, setEpisodeTitle] = useState('Carregando...')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Caminho do documento: 'episodes/spy-family_1'
        const episodeDocRef = doc(db, 'episodes', `${animeId}_${episodeId}`)
        const episodeDoc = await getDoc(episodeDocRef)

        if (episodeDoc.exists()) {
          const data = episodeDoc.data()
          // O URL deve ser o link para a playlist HLS (.m3u8) no seu storage
          setVideoUrl(data.hlsUrl) 
          setEpisodeTitle(data.title || `Episódio ${episodeId}`)
        } else {
          setError('Episódio não encontrado.')
        }
      } catch (err) {
        console.error("Erro ao buscar dados do episódio:", err)
        setError('Erro ao conectar com o serviço de metadados.')
      } finally {
        setLoading(false)
      }
    }
    
    // Inicia a busca
    fetchEpisodeData()
  }, [animeId, episodeId])

  if (loading) {
    return <div className="player-loading">Carregando player...</div>
  }

  if (error) {
    return <div className="player-error">Erro: {error}</div>
  }

  return (
    <div className="episode-player-container">
      <h1 className="episode-title">{episodeTitle}</h1>
      <div className="player-wrapper">
        <ReactPlayer
          url={videoUrl}
          className="react-player"
          playing
          controls
          width='100%'
          height='100%'
          // Configurações importantes para HLS/streaming
          config={{
            file: {
              attributes: {
                playsInline: true,
                webkitPlaysinline: true 
              }
            }
          }}
        />
      </div>
      <p className="playback-note">
        🎥 Reprodução via **ReactPlayer** de um stream HLS (formato ideal após processamento com **FFmpeg**).
      </p>
    </div>
  )
}

export default EpisodePlayer