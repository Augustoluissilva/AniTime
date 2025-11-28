import React, { useState, useEffect, useRef, useCallback } from 'react' 
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
import { onAuthStateChanged } from 'firebase/auth' 
import { db, auth } from '../../firebase/config' 
import './EpisodePlayer.css'

const PROGRESS_SAVE_INTERVAL_MS = 10000; 

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
    
    const hlsRef = useRef(null) 
    const videoRef = useRef(null) 
    
    const [videoUrl, setVideoUrl] = useState(null)
    const [episodeTitle, setEpisodeTitle] = useState('Carregando...')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [episodesList, setEpisodesList] = useState([]) 
    
    const [initialTime, setInitialTime] = useState(0)
    const progressUpdateTimer = useRef(null)
    const [userId, setUserId] = useState(null); 


    // [FUNÇÃO MEMORIZADA] Constrói o ID único para salvar o progresso.
    const getProgressDocId = useCallback(() => {
        return `${userId || 'anon_user'}_${animeId}_${episodeId}`;
    }, [userId, animeId, episodeId]); 
    
    // [FUNÇÃO MEMORIZADA] Salva o progresso do vídeo no Firestore.
    const savePlaybackProgress = useCallback(async (currentTime, isFinished = false) => {
        if (!userId) return; 

        const docId = getProgressDocId();
        const video = videoRef.current; 
        if (!video) return;

        const isNearEnd = video.duration && (currentTime / video.duration) > 0.98;
        
        if (isFinished || isNearEnd) { 
             const progressData = {
                animeId: animeId,
                episodeId: episodeId,
                timestamp: Date.now(),
                currentTime: 0, 
                finished: true 
            };
            try {
                await setDoc(doc(db, 'userProgress', docId), progressData);
                console.log(`[SAVE] Progresso FINALIZADO salvo para: ${docId}`);
            } catch (e) {
                console.error(`[ERROR] Falha ao salvar progresso finalizado para ${docId}:`, e);
            }
            return;
        }

        const progressData = {
            animeId: animeId,
            episodeId: episodeId,
            timestamp: Date.now(),
            currentTime: Math.floor(currentTime),
            finished: false
        };

        try {
            await setDoc(doc(db, 'userProgress', docId), progressData);
        } catch (e) {
            console.error(`[ERROR] Falha ao salvar progresso para ${docId}:`, e);
        }
    }, [userId, animeId, episodeId, getProgressDocId]); 
    
    // [FUNÇÃO MEMORIZADA] Busca o progresso salvo no Firestore.
    const getPlaybackProgress = useCallback(async () => {
        if (!userId) return 0;
        
        try {
            const docRef = doc(db, 'userProgress', getProgressDocId()); 
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const savedTime = data.currentTime || 0;
                console.log(`[LOAD] Progresso encontrado para ${docRef.id}: ${savedTime}s`);
                return data.finished ? 0 : savedTime; 
            } else {
                console.log(`[LOAD] Nenhum progresso encontrado para ${docRef.id}.`);
                return 0;
            }
        } catch (e) {
            console.error("[ERROR] Falha ao buscar progresso:", e);
            return 0;
        }
    }, [userId, animeId, episodeId, getProgressDocId]);


    // [EFEITO 0] Resolve o estado de autenticação (Configura o userId).
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const newUserId = user ? user.uid : 'anon_user';
            setUserId(newUserId); 
        });
        return () => unsubscribe();
    }, []); 


    // [EFEITO 1] Busca os dados do episódio e o progresso do usuário.
    useEffect(() => {
        if (!userId) return;

        const fetchEpisodeAndProgress = async () => {
            try {
                setLoading(true) 
                setError(null)
                
                // --- 1. BUSCA DA LISTA DE EPISÓDIOS (Manter código original)
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
                    const msg = `Episódio não encontrado. ID esperado no Firestore: ${currentDocumentId}`;
                    setError(msg);
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
                setError('Erro ao conectar ou buscar dados do serviço de metadados.')
                setVideoUrl(null); 
            } finally {
                setLoading(false)
            }
        }
        
        fetchEpisodeAndProgress()
        
        return () => {
            if (progressUpdateTimer.current) { 
                clearInterval(progressUpdateTimer.current);
            }
        };
    }, [animeId, episodeId, userId, getPlaybackProgress]) 

    
    // [CALLBACK REF] Funções que inicializa e limpa o player (Substitui Effect 2 e Effect 3)
    const setVideoElement = useCallback(node => {
        
        // 1. Limpeza de estados anteriores
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (progressUpdateTimer.current) { 
            clearInterval(progressUpdateTimer.current);
            progressUpdateTimer.current = null;
        }
        
        videoRef.current = node; 
        
        if (!node || !videoUrl) {
            if (node) { 
                node.src = ""; 
                node.load();
            }
            return;
        }
        
        const video = node;
        const source = videoUrl;
        
        // FIX: Mova a declaração de handleVideoEnded para o topo, antes de ser usada
        const handleVideoEnded = () => {
            savePlaybackProgress(0, true);
        };

        // Função de reprodução que garante que o player está pronto
        const startPlayback = () => {
            if (initialTime > 0) {
                video.currentTime = initialTime;
            }
            
            video.play().catch(e => console.error("[PLAYER] Erro ao tentar autoPlay:", e));
            
            // Inicia o timer para salvar o progresso periodicamente
            progressUpdateTimer.current = setInterval(() => {
                if (!video.paused && !video.ended) {
                    savePlaybackProgress(video.currentTime);
                }
            }, PROGRESS_SAVE_INTERVAL_MS);
        }

        // --- Lógica de Inicialização do Player ---

        // Suporte nativo (Safari e outros)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load(); 
            
            const handleMetadataLoaded = () => {
                startPlayback();
            }
            
            video.addEventListener('loadedmetadata', handleMetadataLoaded);
            video.addEventListener('ended', handleVideoEnded); // AGORA ESTÁ EM ESCOPO

            return () => {
                video.removeEventListener('loadedmetadata', handleMetadataLoaded);
                video.removeEventListener('ended', handleVideoEnded);
            };
        }
        
        // HLS.js para navegadores sem suporte nativo
        else if (Hls.isSupported()) {
            
            const hls = new Hls();
            hlsRef.current = hls;
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                hls.loadSource(source);
            });
            
            const handleHlsMetadataLoaded = () => {
                startPlayback();
            };

            video.addEventListener('loadedmetadata', handleHlsMetadataLoaded);
            video.addEventListener('ended', handleVideoEnded); // AGORA ESTÁ EM ESCOPO

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    setError(`Erro crítico no HLS.js: ${data.details}`);
                }
            });

            return () => {
                video.removeEventListener('loadedmetadata', handleHlsMetadataLoaded);
                video.removeEventListener('ended', handleVideoEnded);
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            };
        } else {
            setError("O formato HLS não é suportado por este navegador.")
        }
        
    }, [videoUrl, initialTime, savePlaybackProgress]); 


    // --- RENDERIZAÇÃO (JSX) ---

    if (!userId || loading) {
        return <div className="player-loading">Carregando player...</div>
    }
    
    const isAnon = userId === 'anon_user';

    return (
        <div className="episode-player-container">
            <h1 className="episode-title">{episodeTitle}</h1>
            
            {error && <div className="player-error">{error}</div>}

            <div className="player-wrapper" style={{ display: error ? 'none' : 'block' }}>
                {!error ? (
                    <video 
                        ref={setVideoElement} // USANDO O CALLBACK REF
                        className="video-player" 
                        controls
                        autoPlay 
                        width="100%" 
                        height="100%"
                        playsInline
                    ></video>
                ) : (
                    <div style={{ padding: '50px', color: 'gray' }}>Detalhes do erro acima.</div>
                )}
            </div>
            
            {/* Nota de Retomada de Progresso */}
            {initialTime > 0 && !error && (
                <div className="playback-note">
                    Retomando em {Math.floor(initialTime / 60)}m {initialTime % 60}s. Seu progresso é salvo automaticamente.
                </div>
            )}
            
            {/* Aviso de Usuário Deslogado */}
            {isAnon && !error && (
                <div className="playback-note" style={{ color: 'yellow', marginTop: '0.5rem' }}>
                    ⚠️ Você está deslogado. Seu progresso está sendo salvo temporariamente. **Faça login para salvar de forma permanente!**
                </div>
            )}

            {/* Seletor de Episódios */}
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