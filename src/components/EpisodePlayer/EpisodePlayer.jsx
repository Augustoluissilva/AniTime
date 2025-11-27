// src/components/EpisodePlayer/EpisodePlayer.jsx

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom' 
import Hls from 'hls.js' 
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore' 
import { db } from '../../firebase/config' 
import './EpisodePlayer.css'

// [COMPONENTE] Seletor de Episódios (Mantido)
const EpisodeSelector = ({ animeId, episodesList, currentEpisodeId }) => {
    return (
        <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #A066FF22', maxWidth: '1280px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#B27AFF' }}>Lista de Episódios:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {episodesList.map((ep) => (
                    <Link
                        key={ep.episodeId}
                        to={`/watch/${animeId}/${ep.episodeId}`}
                        style={{
                            textDecoration: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: ep.episodeId === currentEpisodeId ? 'bold' : 'normal',
                            backgroundColor: ep.episodeId === currentEpisodeId ? '#A066FF' : '#1A0E2A',
                            color: ep.episodeId === currentEpisodeId ? 'white' : '#B27AFF',
                            border: `2px solid ${ep.episodeId === currentEpisodeId ? 'white' : '#A066FF'}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            textAlign: 'center',
                        }}
                        onClick={(e) => {
                            if (ep.episodeId === currentEpisodeId) e.preventDefault();
                        }}
                    >
                        {ep.title || `Ep. ${ep.episodeId}`}
                    </Link>
                ))}
            </div>
        </div>
    )
}


const EpisodePlayer = () => {
    const { animeId, episodeId } = useParams()
    const videoRef = useRef(null) 
    const hlsRef = useRef(null) 
    const [videoUrl, setVideoUrl] = useState(null)
    const [episodeTitle, setEpisodeTitle] = useState('Carregando...')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [episodesList, setEpisodesList] = useState([]) 

    // EFEITO 1: Busca os dados do episódio no Firestore (Mantido sem alterações para o mock de frieren)
    useEffect(() => {
        const fetchEpisodeData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                // --- 1. BUSCA DA LISTA DE EPISÓDIOS (com correção para frieren) ---
                let fetchedEpisodes = [];
                if (animeId === 'frieren') {
                     fetchedEpisodes = [
                        { episodeId: '1', title: 'O Fim da Jornada', animeSlug: 'frieren' },
                        { episodeId: '2', title: 'Não Precisa Ser Magia...', animeSlug: 'frieren' }
                    ];
                } else {
                    const episodesCollection = collection(db, 'episodes');
                    const qList = query(
                        episodesCollection,
                        where('animeSlug', '==', animeId) 
                    );
                    const listSnapshot = await getDocs(qList);
                    fetchedEpisodes = listSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const episodeNumberMatch = doc.id.match(/e(\d+)$/);
                        const episodeNumber = episodeNumberMatch ? episodeNumberMatch[1] : '1';
                        
                        return {
                            ...data,
                            id: doc.id,
                            episodeId: episodeNumber 
                        };
                    }).sort((a, b) => parseInt(a.episodeId) - parseInt(b.episodeId));
                }
                
                setEpisodesList(fetchedEpisodes);

                // --- 2. BUSCA DO EPISÓDIO ATUAL (O fetch principal) ---
                const paddedEpisodeId = episodeId.padStart(2, '0');
                const currentDocumentId = `${animeId}_s01e${paddedEpisodeId}`; 

                const episodeDocRef = doc(db, 'episodes', currentDocumentId)
                const episodeDoc = await getDoc(episodeDocRef)

                if (episodeDoc.exists()) {
                    const data = episodeDoc.data()
                    setVideoUrl(data.hlsUrl) 
                    const finalTitle = data.title || fetchedEpisodes.find(ep => ep.episodeId === episodeId)?.title || `Episódio ${episodeId}`;
                    setEpisodeTitle(finalTitle)

                } else {
                    if (fetchedEpisodes.length === 0) {
                        setError(`Nenhum episódio encontrado para o anime: ${animeId}.`);
                    } else {
                        setError(`Episódio não encontrado. ID esperado no Firestore: ${currentDocumentId}`)
                    }
                    setVideoUrl(null); 
                }
            } catch (err) {
                console.error("Erro ao buscar dados do episódio ou lista:", err)
                setError('Erro ao conectar ou buscar dados do serviço de metadados.')
            } finally {
                setLoading(false)
            }
        }
        
        fetchEpisodeData()
    }, [animeId, episodeId]) 

    // EFEITO 2: Lógica para inicializar/re-inicializar o HLS.js (CORRIGIDA)
    useEffect(() => {
        const video = videoRef.current;
        const source = videoUrl;
        
        // 1. Destrói qualquer instância HLS anterior 
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Se não houver URL, limpa e sai
        if (!source || !video) {
            if (video) {
                video.src = ""; // Limpa a URL src
                video.load();   // Força o elemento a recarregar sem source
            }
            return;
        }
        
        // Suporte nativo (Safari e outros)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load(); // ⬅️ Adiciona load() para forçar o carregamento imediato da nova fonte
            video.play().catch(e => console.error("Erro ao tentar autoPlay no nativo:", e));
            
            // Retorna a função de limpeza (só limpa a src)
            return () => {
                video.src = "";
                video.load();
            };
        }
        
        // HLS.js para navegadores sem suporte nativo
        if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls; // Armazena a nova instância na ref
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(source);
                video.play().catch(e => console.error("Erro ao tentar autoPlay com HLS.js:", e));
            });
            
            // Função de limpeza: Destruir a instância HLS
            return () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            };
        } else {
            console.error("HLS não é suportado por este navegador.");
        }
        
    }, [videoUrl]) // Dispara sempre que o videoUrl é atualizado

    if (loading) {
        return <div className="player-loading">Carregando player...</div>
    }

    return (
        <div className="episode-player-container">
            <h1 className="episode-title">{episodeTitle}</h1>
            
            {error && <div className="player-error">{error}</div>}

            <div className="player-wrapper" style={{ display: error ? 'none' : 'block' }}>
                <video 
                    ref={videoRef}
                    className="video-player" 
                    controls
                    autoPlay 
                    width="100%" 
                    height="100%"
                    playsInline
                ></video>
            </div>

            {/* Renderiza o seletor de episódios com base na lista buscada */}
            {episodesList.length > 0 && (
                <EpisodeSelector 
                    animeId={animeId} 
                    episodesList={episodesList} 
                    currentEpisodeId={episodeId}
                />
            )}
        </div>
    )
}

export default EpisodePlayer