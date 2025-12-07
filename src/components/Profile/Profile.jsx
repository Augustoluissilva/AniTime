import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import './Profile.css';

/* =================================================================================
   ⚠️ PARA SEU PROJETO LOCAL:
   1. DESCOMENTE os imports abaixo.
   2. APAGUE a seção "MOCKS / SIMULAÇÕES".
   ================================================================================= */

// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { auth } from '../../firebase/config';
// import Header from '../Header/Header';


/* =================================================================================
   🛑 MOCKS / SIMULAÇÕES (PARA VISUALIZAR AQUI)
   ================================================================================= */
const auth = {};
const onAuthStateChanged = (auth, cb) => {
    // Simula um usuário logado
    cb({ 
        uid: '123', 
        displayName: 'Luís Silva', 
        email: 'luis.agsilva22@gmail.com',
        metadata: { creationTime: new Date().toISOString() } 
    });
    return () => {};
};
const signOut = async () => console.log('Logout simulado');

// Mock do Header para o visual ficar completo
const Header = () => (
  <nav style={{position:'fixed', top:0, left:0, width:'100%', height:'70px', background:'#120022', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 5%', zIndex:1000, boxShadow:'0 4px 12px rgba(0,0,0,0.5)'}}>
    <div style={{fontSize:'26px', fontWeight:800, color:'white', fontFamily:'Segoe UI'}}>Ani<span style={{color:'#9654FF'}}>Time!</span></div>
    <ul style={{display:'flex', gap:'30px', listStyle:'none', color:'#bbb', fontSize:'18px'}}><li>Home</li><li>Play</li><li style={{color:'#9654FF', fontWeight:'bold'}}>Perfil</li></ul>
  </nav>
);

const favImage = "https://upload.wikimedia.org/wikipedia/en/1/1d/Street_Fighter_II_V_vol_1.jpg";
/* ================================================================================= */


const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida';
    // Data fixa simulada para parecer com a imagem ou formatação real
    return '28/11/2025'; 
  };

  if (loading) {
    return <div className="profile-page-container" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="profile-page-container" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h2>Acesso Negado</h2>
        <button onClick={() => navigate('/login')} style={{padding:'10px 20px', marginTop:'20px'}}>Ir para Login</button>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <Header />

      {/* 1. Faixa Roxa Superior */}
      <div className="profile-banner">
        <div className="camera-icon-banner">
          <Camera size={32} />
        </div>
      </div>

      <div className="profile-content">
        
        {/* 2. Avatar Sobreposto (Overlap) */}
        <div className="profile-avatar-wrapper">
            <Camera size={60} color="#7c3aed" strokeWidth={1.5} style={{opacity:0.6}} />
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

                <div className="input-group">
                    <label>Comentários:</label>
                    {/* Campo vazio para simular a área de texto da imagem */}
                    <div className="input-display" style={{ minHeight: '48px' }}></div>
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

                <div className="favorites-list">
                    {/* Card Roxo Vazio (Placeholder decorativo) */}
                    <div className="fav-card placeholder"></div>

                    {/* Card com Imagem (Street Fighter) */}
                    <div className="fav-card filled">
                        <img src={favImage} alt="Anime Favorito" />
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;