// src/components/EpisodePlayer/EpisodePlayer.jsx

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom' 
import Hls from 'hls.js' 
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore' 
// Importa 'auth' e 'onAuthStateChanged'
import { onAuthStateChanged } from 'firebase/auth' 
import { db, auth } from '../../firebase/config' // <--- ADICIONADO: Importa 'auth'
import './EpisodePlayer.css'

const PROGRESS_SAVE_INTERVAL_MS = 10000; // Salvar progresso a cada 10 segundos 

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
    const [initialTime, setInitialTime] = useState(0)
    const progressUpdateTimer = useRef(null)
    
    // [NOVO] Estados para autenticação
    const [userId, setUserId] = useState(null); 
    const [authResolved, setAuthResolved] = useState(false); // Flag para garantir que a autenticação terminou


    // [FUNÇÃO] Constrói o ID único para salvar o progresso do usuário no Firestore.
    const getProgressDocId = () => `${userId}_${animeId}_${episodeId}`;
    
    // [FUNÇÃO] Salva o progresso do vídeo no Firestore.
    const savePlaybackProgress = async (currentTime, isFinished = false) => {
        if (!userId) return; // Não salva se não houver um ID de usuário (nem anônimo)

        if (isFinished) {
            const progressData = {
                animeId: animeId,
                episodeId: episodeId,
                timestamp: Date.now(),
                currentTime: 0, 
                finished: true // Marca como finalizado
            };
            try {
                await setDoc(doc(db, 'userProgress', getProgressDocId()), progressData);
                console.log(`Progresso finalizado para ${getProgressDocId()} salvo.`);
            } catch (e) {
                console.error("Erro ao salvar progresso finalizado:", e);
            }
            return;
        }

        if (!videoRef.current) return;
        const progressData = {
            animeId: animeId,
            episodeId: episodeId,
            timestamp: Date.now(),
            currentTime: Math.floor(currentTime),
            finished: false
        };

        try {
            await setDoc(doc(db, 'userProgress', getProgressDocId()), progressData);
        } catch (e) {
            console.error("Erro ao salvar progresso:", e);
        }
    };
    
    // [FUNÇÃO] Busca o progresso salvo no Firestore.
    const getPlaybackProgress = async () => {
        if (!userId) return 0; // Não busca se não houver um ID de usuário
        
        try {
            const docRef = doc(db, 'userProgress', getProgressDocId()); 
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const savedTime = data.currentTime || 0;
                
                // Retorna o tempo salvo apenas se não estiver marcado como finalizado
                return data.finished ? 0 : savedTime;
            } else {
                return 0;
            }
        } catch (e) {
            console.error("Erro ao buscar progresso:", e);
            return 0;
        }
    };
    
    // [NOVO EFEITO] Efeito para resolver o estado de autenticação.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Se houver um usuário logado, use o uid, senão, use 'anon' para navegação deslogada
            setUserId(user ? user.uid : 'anon_user'); 
            setAuthResolved(true); // Marca que o estado de autenticação inicial foi resolvido
        });
        // Retorna a função de cleanup
        return () => unsubscribe();
    }, []); 


    // EFEITO 1: Busca os dados do episódio E o progresso do usuário (Só executa após autenticação resolvida)
    useEffect(() => {
        // Só executa se a autenticação foi resolvida
        if (!authResolved) return; 

        const fetchEpisodeAndProgress = async () => {
            try {
                setLoading(true)
                setError(null)
                
                // --- 1. BUSCA DA LISTA DE EPISÓDIOS ---
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

                // --- 2. BUSCA DO EPISÓDIO ATUAL ---
                const paddedEpisodeId = episodeId.padStart(2, '0');
                const currentDocumentId = `${animeId}_s01e${paddedEpisodeId}`; 

                const episodeDocRef = doc(db, 'episodes', currentDocumentId)
                const episodeDoc = await getDoc(episodeDocRef)
                
                let fetchedVideoUrl = null;
                let finalTitle = `Episódio ${episodeId}`;

                if (episodeDoc.exists()) {
                    const data = episodeDoc.data()
                    fetchedVideoUrl = data.hlsUrl;
                    finalTitle = data.title || fetchedEpisodes.find(ep => ep.episodeId === episodeId)?.title || finalTitle;

                } else {
                    if (fetchedEpisodes.length === 0) {
                        setError(`Nenhum episódio encontrado para o anime: ${animeId}.`);
                    } else {
                        setError(`Episódio não encontrado. ID esperado no Firestore: ${currentDocumentId}`)
                    }
                    fetchedVideoUrl = null; 
                }

                setVideoUrl(fetchedVideoUrl)
                setEpisodeTitle(finalTitle)

                // --- 3. BUSCA DO PROGRESSO DO USUÁRIO ---
                if (fetchedVideoUrl) {
                    const savedTime = await getPlaybackProgress();
                    setInitialTime(savedTime);
                }


            } catch (err) {
                console.error("Erro ao buscar dados do episódio ou lista:", err)
                setError('Erro ao conectar ou buscar dados do serviço de metadados.')
                setVideoUrl(null); 
            } finally {
                setLoading(false)
            }
        }
        
        fetchEpisodeAndProgress()
        
        // Limpeza: Garante que o timer de salvamento pare ao desmontar o componente
        return () => {
            if (progressUpdateTimer.current) {
                clearInterval(progressUpdateTimer.current);
            }
        };

    }, [animeId, episodeId, authResolved]) // Depende de 'authResolved'


    // EFEITO 2: Lógica para inicializar/re-inicializar o HLS.js e aplicar o progresso
    useEffect(() => {
        const video = videoRef.current;
        const source = videoUrl;
        
        // Limpa qualquer timer ou HLS anterior
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (progressUpdateTimer.current) {
            clearInterval(progressUpdateTimer.current);
            progressUpdateTimer.current = null;
        }

        // Se não houver URL, limpa e sai
        if (!source || !video || !authResolved) {
            if (video) {
                video.src = ""; 
                video.load(); 
            }
            return;
        }
        
        // Função para iniciar o play e buscar para o tempo inicial
        const startPlayback = () => {
            // Se houver tempo inicial, busca para ele
            if (initialTime > 0) {
                console.log(`Pulando para o tempo salvo: ${initialTime}s`);
                video.currentTime = initialTime;
            }
            
            video.play().catch(e => console.error("Erro ao tentar autoPlay:", e));

            // Inicia o timer para salvar o progresso periodicamente
            progressUpdateTimer.current = setInterval(() => {
                if (!video.paused && !video.ended) {
                    savePlaybackProgress(video.currentTime);
                }
            }, PROGRESS_SAVE_INTERVAL_MS);
        }

        // Suporte nativo (Safari e outros)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load(); 
            
            video.onloadedmetadata = () => {
                startPlayback();
                video.onloadedmetadata = null;
            };
            
            // Lógica de limpeza para o modo nativo
            return () => {
                video.src = "";
                video.load();
                if (progressUpdateTimer.current) {
                    clearInterval(progressUpdateTimer.current);
                }
            };
        }
        
        // HLS.js para navegadores sem suporte nativo
        if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(source);
            });
            
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                 startPlayback();
            });

            // Função de limpeza: Destruir a instância HLS e o timer
            return () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
                if (progressUpdateTimer.current) {
                    clearInterval(progressUpdateTimer.current);
                }
            };
        } else {
            console.error("HLS não é suportado por este navegador.");
        }
        
    }, [videoUrl, initialTime, authResolved]) // Depende de authResolved para garantir que a lógica de startPlayback use o initialTime correto.

    // EFEITO 3: Adiciona o listener para salvar o progresso ao finalizar
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl || !userId) return;

        const handleVideoEnded = () => {
            // Salva com o flag de finalizado (currentTime = 0)
            savePlaybackProgress(0, true);
            
            // Para o timer de atualização se houver
            if (progressUpdateTimer.current) {
                clearInterval(progressUpdateTimer.current);
                progressUpdateTimer.current = null;
            }
        };

        video.addEventListener('ended', handleVideoEnded);

        return () => {
            video.removeEventListener('ended', handleVideoEnded);
        };
    }, [animeId, episodeId, videoUrl, userId]) // Depende de userId para garantir que a função de salvamento seja correta.


    // Adiciona uma condição de carregamento inicial extra para autenticação
    if (!authResolved || loading) {
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
            
            {/* Nota sobre o progresso salvo para UX */}
            {initialTime > 0 && !error && (
                <div className="playback-note">
                    Retomando em {Math.floor(initialTime / 60)}m {initialTime % 60}s. Seu progresso é salvo automaticamente.
                </div>
            )}
            
            {/* Aviso se o usuário não estiver logado e o progresso não for salvo */}
            {userId === 'anon_user' && !error && (
                <div className="playback-note" style={{ color: 'yellow', marginTop: '0.5rem' }}>
                    ⚠️ Progresso não será salvo no Firestore para usuários deslogados. Faça login para salvar!
                </div>
            )}

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