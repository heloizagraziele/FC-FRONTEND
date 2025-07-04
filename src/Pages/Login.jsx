import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import './CSS/LoginSignup.css'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(''); 
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); 
    setMessageType('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth', formData);
      console.log('Login bem-sucedido:', response.data);
      setMessage("Login realizado com sucesso!");
      setMessageType('success');


      localStorage.setItem('token', response.data.token);
      localStorage.setItem('customerName', response.data.name);
      localStorage.setItem('customerId', response.data.customerId);
      
      
      if (response.data.email) {
        localStorage.setItem('customerEmail', response.data.email);
      } else {
     
        localStorage.setItem('customerEmail', formData.email); 
        console.warn("Backend não retornou 'email' na resposta de login. Usando o email do formulário.");
      }
      
  
      window.dispatchEvent(new Event('storage')); 


      navigate('/');

    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response) {
      
        if (error.response.status === 403) {
          setMessage("Email ou senha inválidos.");
        } else {
          setMessage(`Erro: ${error.response.data?.message || error.response.statusText}`);
        }
      } else if (error.request) {
      
        setMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      } else {
    
        setMessage("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }
      setMessageType('error');
    }
  };

  return (
    <div className='loginsignup'> 
      <div className="loginsignup-container">
        <h1>Login</h1> 
        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
           
            <input 
              type="email" 
              placeholder='Email Address' 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
            
            <input 
              type="password" 
              placeholder='Password' 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <button type="submit">Continue</button> 
        </form>
        
        
        {message && <p className={`message ${messageType}`}>{message}</p>}

       
        <p className="loginsignup-login">
          Don't have an account? 
          <span 
            onClick={() => navigate('/signup')} 
            style={{ cursor: 'pointer', textDecoration: 'underline' }} 
          >
            Sign Up here!
          </span>
        </p>
    
      </div>
    </div>
  );
};

export default Login;