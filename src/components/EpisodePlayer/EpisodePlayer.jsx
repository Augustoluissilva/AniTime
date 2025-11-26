// src/components/EpisodePlayer/EpisodePlayer.jsx (Versão com HLS.js)

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Hls from 'hls.js' // ⬅️ NOVA IMPORTAÇÃO
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config' 
import './EpisodePlayer.css'

const EpisodePlayer = () => {
    const { animeId, episodeId } = useParams()
    const videoRef = useRef(null) // Referência para o elemento de vídeo
    const [videoUrl, setVideoUrl] = useState(null)
    const [episodeTitle, setEpisodeTitle] = useState('Carregando...')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Lógica para buscar o URL do Firestore (Mantida)
    useEffect(() => {
        const fetchEpisodeData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const paddedEpisodeId = episodeId.padStart(2, '0');
                const documentId = `${animeId}_s01e${paddedEpisodeId}`; 

                const episodeDocRef = doc(db, 'episodes', documentId)
                const episodeDoc = await getDoc(episodeDocRef)

                if (episodeDoc.exists()) {
                    const data = episodeDoc.data()
                    setVideoUrl(data.hlsUrl) // URL do master.m3u8
                    setEpisodeTitle(data.title || `Episódio ${episodeId}`)
                } else {
                    setError(`Episódio não encontrado. ID esperado no Firestore: ${documentId}`)
                }
            } catch (err) {
                console.error("Erro ao buscar dados do episódio:", err)
                setError('Erro ao conectar com o serviço de metadados.')
            } finally {
                setLoading(false)
            }
        }
        
        fetchEpisodeData()
    }, [animeId, episodeId])

    // Lógica para inicializar o HLS.js após o URL ser carregado
    useEffect(() => {
        if (videoUrl && videoRef.current) {
            const video = videoRef.current;

            // 1. Verifica se o HLS.js é suportado
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.attachMedia(video);
                
                // 2. Carrega o URL do manifesto (master.m3u8)
                hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(videoUrl);
                });
                
                // 3. Destrói a instância do HLS ao desmontar o componente
                return () => {
                    hls.destroy();
                };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Suporte nativo em navegadores como Safari
                video.src = videoUrl;
            } else {
                console.error("HLS não é suportado por este navegador.");
            }
        }
    }, [videoUrl])

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
                {/* Usamos o elemento de vídeo nativo */}
                <video 
                    ref={videoRef}
                    className="video-player" // Adicione CSS para este seletor, se necessário
                    controls
                    autoPlay 
                    width="100%" 
                    height="100%"
                    playsInline
                ></video>
            </div>
            <p className="playback-note">
                ✅ Reprodução via **HLS.js** no elemento de vídeo nativo.
            </p>
        </div>
    )
}

export default EpisodePlayer