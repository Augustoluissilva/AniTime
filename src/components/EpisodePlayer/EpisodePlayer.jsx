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

    // EFEITO 1: Busca os dados do episódio no Firestore 
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
        
        // Limpeza de estado na desmontagem
        return () => {
            setVideoUrl(null); 
            setEpisodeTitle('Carregando...');
            setLoading(true);
            setError(null);
        };
    }, [animeId, episodeId]) 

    // EFEITO 2: Lógica para inicializar/re-inicializar o HLS.js (CORRIGIDO PARA ESTABILIDADE)
    useEffect(() => {
        const video = videoRef.current;
        const source = videoUrl;
        
        // Destrói qualquer instância HLS anterior, garantindo que o vídeo anterior pare de carregar
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Se não houver URL ou elemento de vídeo, limpa e sai
        if (!source || !video) {
            if (video) {
                video.src = ""; 
                video.load(); 
            }
            return;
        }

        // Função de reprodução que garante que o player está pronto
        const startPlayback = () => {
            video.play().catch(e => console.error("Erro ao tentar autoPlay:", e));
        }
        
        // Suporte nativo (Safari e outros)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Limpa o source do vídeo antes de carregar o novo.
            if (video.src !== source) {
                video.src = source;
                video.load(); 
            }
            
            // FIX: Espera o metadado carregar antes de dar play (para vídeo/tempo aparecer)
            const handleMetadataLoaded = () => {
                startPlayback();
                video.removeEventListener('loadedmetadata', handleMetadataLoaded);
            }
            
            video.addEventListener('loadedmetadata', handleMetadataLoaded);
            
            // Retorna a função de limpeza 
            return () => {
                video.removeEventListener('loadedmetadata', handleMetadataLoaded);
                video.src = "";
                video.load();
            };
        }
        
        // HLS.js para navegadores sem suporte nativo
        else if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls; // Armazena a nova instância na ref
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(source);
            });
            
            // FIX: Usar o evento nativo 'loadedmetadata' para sincronizar o início do play 
            // após o HLS.js analisar o manifesto e carregar os metadados.
            const handleHlsMetadataLoaded = () => {
                startPlayback();
                video.removeEventListener('loadedmetadata', handleHlsMetadataLoaded);
            };

            video.addEventListener('loadedmetadata', handleHlsMetadataLoaded);
            
            // Função de limpeza: Destruir a instância HLS e remover o listener
            return () => {
                video.removeEventListener('loadedmetadata', handleHlsMetadataLoaded);
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            };
        } else {
            console.error("HLS não é suportado por este navegador.");
            setError("O formato HLS não é suportado por este navegador.")
        }
        // A dependência é apenas videoUrl
    }, [videoUrl]) 

    if (loading) {
        return <div className="player-loading">Carregando player...</div>
    }

    return (
        <div className="episode-player-container">
            <h1 className="episode-title">{episodeTitle}</h1>
            
            {error && <div className="player-error">{error}</div>}

            <div className="player-wrapper" style={{ display: error ? 'none' : 'block' }}>
                {/* [CORREÇÃO DE RENDERIZAÇÃO] Só renderiza a tag <video> se houver URL */}
                {videoUrl ? (
                    <video 
                        ref={videoRef}
                        className="video-player" 
                        controls
                        autoPlay 
                        width="100%" 
                        height="100%"
                        playsInline
                    ></video>
                ) : (
                    // Mensagem de erro mais clara se a URL não for encontrada no Firestore
                    !error && <div className="player-error">Não foi possível encontrar a URL do vídeo. Verifique se o documento `{animeId}_s01e{episodeId.padStart(2, '0')}` existe no Firestore.</div>
                )}
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