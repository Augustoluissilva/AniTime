import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { ThumbsUp, Download, Play } from 'lucide-react';

// Firebase Imports
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

// Componentes e Estilos
import Header from '../Header/Header';
import './EpisodePlayer.css';

// Imagens (Fallbacks)
import posterPlaceholder from '../../assets/SPY_FAMILY.png'; 
import thumbPlaceholder from '../../assets/SPY_FAMILY.png';

const PROGRESS_SAVE_INTERVAL_MS = 10000;

const EpisodePlayer = () => {
    const { animeId, episodeId } = useParams();
    const navigate = useNavigate();
    
    // Referências
    const hlsRef = useRef(null);
    const videoRef = useRef(null);
    const progressUpdateTimer = useRef(null);
    
    // Estados
    const [userId, setUserId] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [episodeTitle, setEpisodeTitle] = useState('Carregando...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [episodesList, setEpisodesList] = useState([]);
    const [initialTime, setInitialTime] = useState(0);
    
    // Estados visuais (Imagens dinâmicas)
    const [currentPoster, setCurrentPoster] = useState(posterPlaceholder);
    const [currentThumbnail, setCurrentThumbnail] = useState(thumbPlaceholder);

    // [FUNÇÃO] ID do documento de progresso
    const getProgressDocId = useCallback(() => {
        return `${userId || 'anon_user'}_${animeId}_${episodeId}`;
    }, [userId, animeId, episodeId]);

    // [FUNÇÃO] Salvar Progresso
    const savePlaybackProgress = useCallback(async (currentTime, isFinished = false) => {
        if (!userId) return;

        const docId = getProgressDocId();
        const video = videoRef.current;
        if (!video) return;

        const isNearEnd = video.duration && (currentTime / video.duration) > 0.98;

        if (isFinished || isNearEnd) {
            const progressData = {
                animeId,
                episodeId,
                timestamp: Date.now(),
                currentTime: 0,
                finished: true
            };
            try {
                await setDoc(doc(db, 'userProgress', docId), progressData);
                console.log(`[SAVE] Finalizado: ${docId}`);
            } catch (e) {
                console.error(`[ERROR] Save failed:`, e);
            }
            return;
        }

        const progressData = {
            animeId,
            episodeId,
            timestamp: Date.now(),
            currentTime: Math.floor(currentTime),
            finished: false
        };

        try {
            await setDoc(doc(db, 'userProgress', docId), progressData);
        } catch (e) {
            console.error(`[ERROR] Save failed:`, e);
        }
    }, [userId, animeId, episodeId, getProgressDocId]);

    // [FUNÇÃO] Buscar Progresso
    const getPlaybackProgress = useCallback(async () => {
        if (!userId) return 0;
        try {
            const docRef = doc(db, 'userProgress', getProgressDocId());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data.finished ? 0 : (data.currentTime || 0);
            }
            return 0;
        } catch (e) {
            console.error("[ERROR] Get progress failed:", e);
            return 0;
        }
    }, [userId, getProgressDocId]); 

    // [EFEITO 0] Autenticação
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : 'anon_user');
        });
        return () => unsubscribe();
    }, []);

    // [EFEITO 1] Buscar Dados (Anime, Episódios e URL)
    useEffect(() => {
        if (!userId) return;

        const fetchEpisodeAndProgress = async () => {
            try {
                setLoading(true);
                setError(null);

                // 0. Buscar Dados do Anime (Poster/Capa)
                try {
                    const animeDocRef = doc(db, 'animes', animeId);
                    const animeDoc = await getDoc(animeDocRef);
                    if (animeDoc.exists()) {
                        const animeData = animeDoc.data();
                        const posterUrl = animeData.imageUrl || animeData.image || animeData.cover || posterPlaceholder;
                        setCurrentPoster(posterUrl);
                    }
                } catch (animeErr) {
                    console.warn("Não foi possível carregar o poster do anime:", animeErr);
                }

                // 1. Buscar Lista de Episódios
                let fetchedEpisodes = [];
                if (animeId === 'frieren') {
                    fetchedEpisodes = [
                        { episodeId: '1', title: 'O Fim da Jornada', animeSlug: 'frieren' },
                        { episodeId: '2', title: 'Não Precisa Ser Magia...', animeSlug: 'frieren' }
                    ];
                } else {
                    const episodesCollection = collection(db, 'episodes');
                    const qList = query(episodesCollection, where('animeSlug', '==', animeId));
                    const listSnapshot = await getDocs(qList);
                    fetchedEpisodes = listSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const episodeNumberMatch = doc.id.match(/e(\d+)$/);
                        return {
                            ...data,
                            id: doc.id,
                            episodeId: episodeNumberMatch ? episodeNumberMatch[1] : '1',
                            img: data.thumbnail || thumbPlaceholder
                        };
                    }).sort((a, b) => parseInt(a.episodeId) - parseInt(b.episodeId));
                }
                setEpisodesList(fetchedEpisodes);

                // 2. Buscar Episódio Atual
                const paddedEpisodeId = episodeId.padStart(2, '0');
                const currentDocumentId = `${animeId}_s01e${paddedEpisodeId}`;
                const episodeDocRef = doc(db, 'episodes', currentDocumentId);
                const episodeDoc = await getDoc(episodeDocRef);

                let fetchedVideoUrl = null;
                let finalTitle = `Episódio ${episodeId}`;

                if (episodeDoc.exists()) {
                    const data = episodeDoc.data();
                    fetchedVideoUrl = data.hlsUrl;
                    finalTitle = data.title || finalTitle;
                    
                    if (data.thumbnail) {
                        setCurrentThumbnail(data.thumbnail);
                    }
                } else {
                    const msg = `Episódio não encontrado. ID: ${currentDocumentId}`;
                    console.warn(msg);
                    setError(msg);
                }

                setVideoUrl(fetchedVideoUrl);
                setEpisodeTitle(finalTitle);

                // 3. Buscar Progresso Inicial
                if (fetchedVideoUrl) {
                    const savedTime = await getPlaybackProgress();
                    setInitialTime(savedTime);
                }

            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError('Erro ao carregar dados do episódio.');
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodeAndProgress();

        return () => {
            if (progressUpdateTimer.current) clearInterval(progressUpdateTimer.current);
        };
    }, [animeId, episodeId, userId, getPlaybackProgress]);

    // [CALLBACK] Configuração do Player de Vídeo
    const setVideoElement = useCallback(node => {
        // Limpeza
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        if (progressUpdateTimer.current) {
            clearInterval(progressUpdateTimer.current);
            progressUpdateTimer.current = null;
        }

        videoRef.current = node;

        if (!node || !videoUrl) return;

        const video = node;
        const source = videoUrl;

        const handleVideoEnded = () => savePlaybackProgress(0, true);

        const startPlayback = () => {
            if (initialTime > 0) video.currentTime = initialTime;
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => console.log("Autoplay preventido pelo navegador"));
            }

            progressUpdateTimer.current = setInterval(() => {
                if (!video.paused && !video.ended) {
                    savePlaybackProgress(video.currentTime);
                }
            }, PROGRESS_SAVE_INTERVAL_MS);
        };

        if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, startPlayback);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) setError(`Erro de reprodução: ${data.details}`);
            });
            video.addEventListener('ended', handleVideoEnded);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', startPlayback);
            video.addEventListener('ended', handleVideoEnded);
        }

    }, [videoUrl, initialTime, savePlaybackProgress]);


    // --- RENDERIZAÇÃO ---

    return (
        <div className="play-page-container">
            <Header />

            <div className="play-content-wrapper">
                
                {/* --- COLUNA ESQUERDA --- */}
                <div className="left-panel">
                    <div className="poster-frame">
                        {/* Imagem dinâmica do poster do anime */}
                        <img src={currentPoster} alt="Poster" className="anime-poster-vertical" />
                    </div>

                    <div className="episode-info-card">
                        <div className="info-header">
                            <h3>Episódio {episodeId}</h3>
                            <span className="info-date">Hoje</span>
                        </div>
                        
                        <h4 className="episode-title-text">{episodeTitle}</h4>
                        <p className="episode-desc">
                            Assista ao episódio {episodeId} de {animeId}.
                        </p>
                        
                        <div className="action-row">
                            <button className="icon-btn"><ThumbsUp size={20} /></button>
                            <button className="icon-btn"><Download size={20} /></button>
                            <span className="duration-badge">24m</span>
                        </div>
                    </div>
                </div>

                {/* --- ÁREA PRINCIPAL ROXA --- */}
                <div className="main-player-frame">
                    
                    {/* PLAYER DE VÍDEO */}
                    <div className="video-area">
                        {loading ? (
                            <div className="player-loading">Carregando Player...</div>
                        ) : error ? (
                            <div className="player-error">
                                <p>{error}</p>
                                <p style={{fontSize:'12px', marginTop:'10px'}}>Verifique se a URL do vídeo existe no Firestore.</p>
                            </div>
                        ) : (
                            <video 
                                ref={setVideoElement} 
                                className="video-player"
                                controls
                                width="100%"
                                height="100%"
                                style={{ backgroundColor: '#000', borderRadius: '15px' }}
                                poster={currentThumbnail} // Thumbnail dinâmica para o player
                            />
                        )}
                        
                        {userId === 'anon_user' && !loading && (
                            <div className="auth-warning-overlay">
                                ⚠️ Modo Anônimo: Progresso não será salvo permanentemente.
                            </div>
                        )}
                    </div>

                    {/* LISTA LATERAL DE EPISÓDIOS */}
                    <div className="episodes-sidebar">
                        <div className="sidebar-header">
                            <h3>Próximos Episódios</h3>
                        </div>
                        
                        <div className="episodes-scroll">
                            {episodesList.length > 0 ? episodesList.map((ep) => (
                                <Link 
                                    to={`/watch/${animeId}/${ep.episodeId}`}
                                    key={ep.id || ep.episodeId} 
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className={`episode-item ${ep.episodeId === episodeId ? 'playing' : ''}`}>
                                        <div className="episode-thumb-wrapper">
                                            <img src={ep.img || thumbPlaceholder} alt={ep.title} />
                                            <div className="play-hover"><Play size={12} fill="white" /></div>
                                        </div>
                                        <div className="episode-meta">
                                            <span className="ep-number">Ep. {ep.episodeId}</span>
                                            <span className="ep-title">{ep.title}</span>
                                            <span className="ep-duration">24m</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div style={{padding:'10px', color:'#aaa'}}>Nenhum episódio listado.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EpisodePlayer;