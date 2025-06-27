import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CSS/Profile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { id_customer } = useParams();
  
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      const customerIdFromLocalStorage = localStorage.getItem('customerId');
      const token = localStorage.getItem('token');

      const userIdToFetch = id_customer || customerIdFromLocalStorage;

      if (!userIdToFetch || !token) {
        setError("Você precisa estar logado para ver este perfil.");
        setLoading(false);
        return;
      }
      
      if (id_customer && parseInt(id_customer, 10) !== parseInt(customerIdFromLocalStorage, 10)) {
         setError("Acesso negado: Você não tem permissão para ver este perfil.");
         setLoading(false);
         return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/customer/${userIdToFetch}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCustomerProfile(response.data);
      } catch (err) {
        console.error("Erro ao buscar perfil do usuário:", err);
        if (err.response && err.response.status === 404) {
          setError("Perfil do usuário não encontrado.");
        } else if (err.response && err.response.status === 403) {
          setError("Acesso negado. Sua sessão pode ter expirado.");
        } else {
          setError("Não foi possível carregar o perfil. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id_customer, navigate]);

  // --- NOVO: Função para remover endereço ---
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Tem certeza que deseja remover este endereço?")) {
      return; // O usuário cancelou a remoção
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sua sessão expirou. Por favor, faça login novamente.");
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/addresses/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert("Endereço removido com sucesso!");
      // Atualiza o estado do perfil para remover o endereço da UI
      setCustomerProfile(prevProfile => ({
        ...prevProfile,
        addresses: prevProfile.addresses.filter(addr => addr.id !== addressId)
      }));
    } catch (err) {
      console.error("Erro ao remover endereço:", err);
      alert(`Erro ao remover endereço: ${err.response?.data?.message || err.message || 'Verifique sua conexão.'}`);
      // Em caso de erro, talvez seja bom recarregar o perfil completo para garantir a consistência
      // fetchUserProfile(); // CUIDADO: pode causar loop se houver um problema persistente
    }
  };
  // ----------------------------------------

  if (loading) {
    return (
      <div className="message-container"> 
        Carregando perfil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-container"> 
        <p className="error-message-box">Erro ao carregar perfil:</p>
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          className="back-home-button" 
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="message-container"> 
        Perfil não disponível.
      </div>
    );
  }

  return (
    <div className="user-profile-container"> 
      <div className="profile-card"> 
        <h1 className="profile-title">Meu Perfil</h1> 
        
        <div className="profile-info-item"> 
          <p className="profile-info-label">Nome:</p>
          <p className="profile-info-value">{customerProfile.name}</p>
        </div>

        <div className="profile-info-item"> 
          <p className="profile-info-label">Email:</p>
          <p className="profile-info-value">{customerProfile.email}</p>
        </div>
      </div>

      <div className="addresses-section"> 
        <h2 className="addresses-title">Meus Endereços</h2>
        
        {customerProfile.addresses && customerProfile.addresses.length > 0 ? (
          <div className="address-list"> 
            {customerProfile.addresses.map(address => (
              <div key={address.id} className="address-item"> 
                <p className="font-semibold">Endereço ID: {address.id}</p> 
                <p>{address.street}, {address.number} {address.complement && `- ${address.complement}`}</p>
                <p>{address.neighborhood}, {address.city} - {address.state}</p>
                <p>CEP: {address.zipcode}</p>
                {/* --- NOVO: Botão Remover Endereço --- */}
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="delete-address-button"
                >
                  Remover
                </button>
                {/* ---------------------------------- */}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-addresses-message">Você não tem endereços cadastrados.</p>
        )}

        <button
          onClick={() => navigate('/profile/addresses')}
          className="add-address-button" 
        >
          Adicionar Novo Endereço
        </button>
      </div>
    </div>
  );
};

export default UserProfile;