import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import './Profile.css';

// --- IMPORTS DO FIREBASE ---
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, storage } from '../../firebase/config';
import {
  collection,
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  documentId,
  doc,
  getDoc,
  setDoc,
  where // Necessário para a query simplificada de fallback
} from 'firebase/firestore';
// Importa funções do Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- IMPORTS DE ASSETS LOCAIS ---
import posterFrieren from '../../assets/FREEREN.png';
import posterSpy from '../../assets/SPY_FAMILY.png';
import posterNaruto from '../../assets/naruto.png';
import posterOnePiece from '../../assets/one_piece.png';

const LOCAL_POSTER_MAP = {
  'frieren': posterFrieren,
  'spy-family': posterSpy,
  'naruto': posterNaruto,
  'one-piece': posterOnePiece,
};

const favImage = "https://upload.wikimedia.org/wikipedia/en/1/1d/Street_Fighter_II_V_vol_1.jpg";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ESTADOS PARA FAVORITOS
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // ESTADOS PARA IMAGENS DE PERFIL
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  // [FUNÇÃO] Referência para o documento de favorito
  const getFavoriteDocRef = useCallback((uId, aId) => {
    return doc(db, 'favorites', `${uId}_${aId}`);
  }, []);

  // [FUNÇÃO] Busca a lista de favoritos (Query Otimizada)
  const fetchFavorites = useCallback(async (currentUserId) => {
    if (!currentUserId) {
      setFavorites([]);
      setLoadingFavorites(false);
      return;
    }

    setLoadingFavorites(true);
    try {
      // Query por ID do Documento (melhor performance, mas exige índice)
      const prefix = currentUserId + '_';
      const favQuery = query(
        collection(db, 'favorites'),
        orderBy(documentId()),
        startAt(prefix),
        endAt(prefix + '\uf8ff')
      );

      const querySnapshot = await getDocs(favQuery);

      const animeIds = querySnapshot.docs.map(doc => doc.data().animeId);

      const posterPromises = animeIds.map(async (animeId) => {
        const animeDocRef = doc(db, 'animes', animeId);
        const animeDoc = await getDoc(animeDocRef);

        let posterUrl = null;
        if (animeDoc.exists()) {
          const data = animeDoc.data();
          posterUrl = data.imageUrl || data.image || data.cover;
        }

        return {
          animeId: animeId,
          posterUrl: posterUrl || LOCAL_POSTER_MAP[animeId] || null
        };
      });

      const favoriteListWithDetails = await Promise.all(posterPromises);
      setFavorites(favoriteListWithDetails.filter(fav => fav.posterUrl));

    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  // [FUNÇÃO] Busca as URLs do perfil no Firestore
  const fetchProfileImages = useCallback(async (uid) => {
    if (!uid) return;

    try {
      const docRef = doc(db, 'userProfiles', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfilePicUrl(data.profilePicUrl || null);
        setBannerUrl(data.bannerUrl || null);
      }
    } catch (error) {
      console.error("Erro ao buscar imagens de perfil:", error);
    }
  }, []);

  // [FUNÇÃO] Faz o upload e salva o URL no Firestore
  const handleImageUpload = useCallback(async (file, type) => {
    if (!user || !file) return;

    const fileExtension = file.name.split('.').pop();
    const storagePath = `users/${user.uid}/${type}.${fileExtension}`;
    const fileRef = ref(storage, storagePath);

    try {
      // 1. Upload para o Storage
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      // 2. Salva o URL no Firestore (userProfiles collection)
      const profileDocRef = doc(db, 'userProfiles', user.uid);
      const updateData = type === 'profile' ?
        { profilePicUrl: downloadUrl } :
        { bannerUrl: downloadUrl };

      await setDoc(profileDocRef, updateData, { merge: true });

      // 3. Atualiza o estado local
      if (type === 'profile') {
        setProfilePicUrl(downloadUrl);
      } else {
        setBannerUrl(downloadUrl);
      }

      alert(`${type === 'profile' ? 'Foto de Perfil' : 'Banner'} atualizado com sucesso!`);

    } catch (error) {
      console.error(`Erro ao carregar ${type}:`, error);
      alert(`Erro ao carregar ${type}. Verifique as regras do Storage.`);
    }
  }, [user]);

  useEffect(() => {
    // Monitora o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        fetchFavorites(currentUser.uid);
        fetchProfileImages(currentUser.uid);
      } else {
        setFavorites([]);
      }
    });
    return () => unsubscribe();
  }, [fetchFavorites, fetchProfileImages]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Sessão encerrada com sucesso. Você será redirecionado.'); // <--- Feedback
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const formatDate = (dateString) => {
    return '28/11/2025';
  };

  if (loading) {
    return <div className="profile-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page-container">

      {/* 1. Faixa Roxa Superior (BANNER) */}
      <div className="profile-banner"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>

        {/* INPUT DE ARQUIVO para o Banner (Oculto) */}
        <input
          type="file"
          id="banner-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
        />

        {/* Ícone de Câmera (Rótulo para o input) */}
        <label htmlFor="banner-upload" className="camera-icon-banner">
          <Camera size={32} />
        </label>
      </div>

      <div className="profile-content">

        {/* 2. Avatar Sobreposto (FOTO DE PERFIL) */}
        <div className="profile-avatar-wrapper"
          style={profilePicUrl ? { backgroundImage: `url(${profilePicUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid var(--avatar-bg)' } : {}}>

          {/* INPUT DE ARQUIVO para o Avatar (Oculto) */}
          <input
            type="file"
            id="profile-pic-upload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
          />

          {/* Ícone de Câmera (Rótulo para o input) */}
          <label htmlFor="profile-pic-upload" style={{ cursor: 'pointer', opacity: profilePicUrl ? 0 : 0.6 }}>
            <Camera size={60} color="#7c3aed" strokeWidth={1.5} />
          </label>
        </div>

        {/* 3. Grid Principal */}
        <div className="profile-grid">

          {/* Coluna Esquerda: Formulário de Dados */}
          <div className="profile-form-section">

            <div className="input-group">
              <label>Nome:</label>
              <div className="input-display">
                {user.displayName || 'Luís Silva'}
              </div>
            </div>

            <div className="input-group">
              <label>E-mail:</label>
              <div className="input-display">
                {user.email}
              </div>
            </div>

            <div className="input-group">
              <label>Membro desde:</label>
              <div className="input-display">
                {formatDate(user.metadata.creationTime)}
              </div>
            </div>

            <button onClick={handleLogout} className="logout-btn">
              Sair da conta
            </button>

          </div>

          {/* Coluna Direita: Seção de Favoritos */}
          <div className="profile-favorites-section">
            <div className="favorites-title-pill">
              Favoritos
            </div>

            <div className="favorites-list" style={{ justifyContent: favorites.length > 0 ? 'flex-start' : 'center' }}>

              {loadingFavorites ? (
                <div style={{ padding: '20px', color: '#ccc', width: '100%', textAlign: 'center' }}>Carregando favoritos...</div>
              ) : favorites.length === 0 ? (
                <div style={{ padding: '20px', color: '#ccc', width: '100%', textAlign: 'center' }}>Nenhum anime favoritado ainda.</div>
              ) : (
                favorites.map((fav, index) => (
                  <div key={index} className="fav-card filled">
                    <img
                      src={fav.posterUrl}
                      alt={fav.animeId}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;