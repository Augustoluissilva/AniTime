import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config'
import './Login.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validação básica
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      // Autenticação com Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Login bem-sucedido
      const user = userCredential.user;
      console.log('Usuário logado:', user);
      
      // Redirecionar para a página principal
      navigate('/'); // ajuste para sua rota principal

    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratamento de erros específicos do Firebase
      switch (error.code) {
        case 'auth/invalid-email':
          setError('E-mail inválido.');
          break;
        case 'auth/user-disabled':
          setError('Esta conta foi desativada.');
          break;
        case 'auth/user-not-found':
          setError('Nenhuma conta encontrada com este e-mail.');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas de login. Tente novamente mais tarde.');
          break;
        default:
          setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Por favor, digite seu e-mail para redefinir a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert('E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      setError('Erro ao enviar e-mail de redefinição. Verifique o e-mail digitado.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  // Demo login para teste (remova em produção)
  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@exemplo.com',
      password: 'demo123'
    });
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Coluna do Formulário */}
        <div className="login-form-column">
          <div className="login-glass-card">
            <div className="login-card-header">
              <h1 className="login-title">Conecte-se</h1>
              <div className="login-accent-line"></div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="login-error-message">
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="E-mail"
                  className="login-input-field"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <div className="login-input-glow"></div>
              </div>
              
              <div className="login-input-group">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Senha"
                  className="login-input-field"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <div className="login-input-glow"></div>
              </div>

              {/* Link para esqueci a senha */}
              <div className="login-forgot-password">
                <button 
                  type="button" 
                  className="login-forgot-link"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Esqueceu sua senha?
                </button>
              </div>
              
              <button 
                type="submit" 
                className={`login-submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <span className="login-button-text">
                  {isLoading ? 'Entrando...' : 'Enter'}
                </span>
                <div className="login-button-glow"></div>
              </button>

              {/* Botão Demo (apenas para desenvolvimento) */}
              <button 
                type="button" 
                className="login-demo-button"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <span className="login-button-text">
                  Preencher Dados Demo
                </span>
              </button>

              <div className="login-links">
                <Link to="/cadastro" className="login-toggle-mode">
                  Não tem uma conta? Cadastre-se
                </Link>
              </div>

              <div className="login-anime-text">
                古見さんは、コミュ症です。
              </div>
            </form>

            {/* Elementos flutuantes */}
            <div className="login-floating-elements">
              <div className="login-floating-element login-element-1"></div>
              <div className="login-floating-element login-element-2"></div>
              <div className="login-floating-element login-element-3"></div>
            </div>
          </div>
        </div>

        {/* Coluna da Imagem */}
        <div className="login-image-column">
          {/* Apenas a imagem da Komi-san */}
        </div>
      </div>
    </div>
  );
};

export default Login;