import React, { useState, useEffect } from 'react'; // Adicione useEffect para pegar customerId
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Pages/CSS/LoginSignup.css'; // Reutiliza o mesmo CSS

const AddressForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    zipcode: '', // Manter como string inicialmente para fácil input
    customerId: null // Será preenchido do localStorage
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Pega o customerId do localStorage assim que o componente monta
  useEffect(() => {
    const storedCustomerId = localStorage.getItem('customerId');
    if (storedCustomerId) {
      setFormData(prevData => ({
        ...prevData,
        customerId: parseInt(storedCustomerId, 10)
      }));
    } else {
      setMessage("Você precisa estar logado para adicionar um endereço.");
      setMessageType('error');
      // Opcional: redirecionar para o login
      // navigate('/login');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'zipcode' ? value.replace(/\D/g, '') : value // Remove não-dígitos do CEP
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!formData.customerId) {
      setMessage("Erro: ID do cliente não encontrado. Por favor, faça login novamente.");
      setMessageType('error');
      return;
    }

    // Validação básica do CEP para o backend (espera Long)
    const zipcodeNum = parseInt(formData.zipcode, 10);
    if (isNaN(zipcodeNum) || formData.zipcode.length < 8) { // CEP brasileiro tem 8 dígitos numéricos
        setMessage("CEP inválido. Por favor, digite apenas os números (8 dígitos).");
        setMessageType('error');
        return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage("Sua sessão expirou. Por favor, faça login novamente.");
        setMessageType('error');
        navigate('/login');
        return;
      }

      // Payload para o backend - convertendo zipcode para Long
      const payload = {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        complement: formData.complement,
        zipcode: zipcodeNum, // Envia como número
        customerId: formData.customerId
      };

      // Endpoint para adicionar endereço: /api/addresses ou /api/customers/{customerId}/addresses
      // Eu sugiro /api/addresses e você valida o customerId no backend com o token.
      const response = await axios.post('http://localhost:8080/api/addresses', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Endereço cadastrado com sucesso:', response.data);
      setMessage("Endereço cadastrado com sucesso!");
      setMessageType('success');
      // Opcional: redirecionar para uma página de lista de endereços ou perfil
      navigate('/profile/addresses'); // Assumindo que você terá essa rota

    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error);
      if (error.response) {
        setMessage(`Erro: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        setMessage("Não foi possível conectar ao servidor. Verifique sua conexão.");
      } else {
        setMessage("Ocorreu um erro inesperado. Tente novamente.");
      }
      setMessageType('error');
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>Adicionar Novo Endereço</h1>
        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder='Rua' required />
            <input type="text" name="number" value={formData.number} onChange={handleChange} placeholder='Número' required />
            <input type="text" name="complement" value={formData.complement} onChange={handleChange} placeholder='Complemento (Apto, Bloco, etc.)' />
            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder='Bairro' required />
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder='Cidade' required />
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder='Estado (Ex: SP)' maxLength="2" required />
            <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder='CEP (apenas números)' maxLength="8" required />
          </div>
          <button type="submit">Cadastrar Endereço</button>
        </form>
        {message && <p className={`message ${messageType}`}>{message}</p>}
        <p className="loginsignup-login">
          <span
            onClick={() => navigate('/profile/addresses')} // Link de volta para a lista de endereços ou perfil
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Voltar para Meus Endereços
          </span>
        </p>
      </div>
    </div>
  );
};

export default AddressForm;