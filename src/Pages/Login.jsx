import React, { useState } from 'react';
import axios from 'axios'; // Para fazer a requisição HTTP para o backend
import { useNavigate } from 'react-router-dom'; // Para redirecionar após o login
import './CSS/LoginSignup.css'; // Reutiliza o mesmo CSS do LoginSignup

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(''); // Para exibir mensagens de sucesso/erro
  const [messageType, setMessageType] = useState(''); // Para estilizar a mensagem (success/error)
  const navigate = useNavigate(); // Hook para navegação

  // Função para atualizar o estado do formulário conforme o usuário digita
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função para lidar com o envio do formulário de login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário de recarregar a página
    setMessage(''); // Limpa mensagens anteriores
    setMessageType('');

    try {
      // Faz a requisição POST para o endpoint de autenticação do seu backend
      const response = await axios.post('http://localhost:8080/api/auth', formData);
      console.log('Login bem-sucedido:', response.data);
      setMessage("Login realizado com sucesso!");
      setMessageType('success');

      // Salva os dados do usuário no localStorage para manter a sessão
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('customerName', response.data.name);
      localStorage.setItem('customerId', response.data.customerId);
      
      // Salva o email do cliente (essencial para o fluxo de pagamento)
      if (response.data.email) {
        localStorage.setItem('customerEmail', response.data.email);
      } else {
        // Fallback: se o backend não retornar o email, usa o email digitado no formulário
        localStorage.setItem('customerEmail', formData.email); 
        console.warn("Backend não retornou 'email' na resposta de login. Usando o email do formulário.");
      }
      
      // Dispara um evento para notificar outros componentes sobre a mudança no localStorage
      window.dispatchEvent(new Event('storage')); 

      // Redireciona para a página principal (Home) após o login
      navigate('/');

    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response) {
        // Erros de resposta do servidor (ex: 403 Forbidden para credenciais inválidas)
        if (error.response.status === 403) {
          setMessage("Email ou senha inválidos.");
        } else {
          setMessage(`Erro: ${error.response.data?.message || error.response.statusText}`);
        }
      } else if (error.request) {
        // Erros de requisição (servidor não respondeu)
        setMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      } else {
        // Outros erros inesperados
        setMessage("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }
      setMessageType('error');
    }
  };

  return (
    <div className='loginsignup'> {/* Reutilizando a classe CSS */}
      <div className="loginsignup-container">
        <h1>Login</h1> {/* Título para a página de login */}
        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            {/* Campo de Email */}
            <input 
              type="email" 
              placeholder='Email Address' 
              name="email" // Importante: o nome deve corresponder à chave no formData
              value={formData.email}
              onChange={handleChange}
              required 
            />
            {/* Campo de Senha */}
            <input 
              type="password" 
              placeholder='Password' 
              name="password" // Importante: o nome deve corresponder à chave no formData
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <button type="submit">Continue</button> {/* Botão de envio do formulário */}
        </form>
        
        {/* Exibe mensagens de sucesso ou erro */}
        {message && <p className={`message ${messageType}`}>{message}</p>}

        {/* Link para a página de cadastro */}
        <p className="loginsignup-login">
          Don't have an account? 
          <span 
            onClick={() => navigate('/signup')} 
            style={{ cursor: 'pointer', textDecoration: 'underline' }} 
          >
            Sign Up here!
          </span>
        </p>
        {/* Checkbox de termos (opcional para login, mas mantido para consistência com o Sign Up) */}
      </div>
    </div>
  );
};

export default Login;