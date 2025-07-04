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

    const [customerOrders, setCustomerOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true); 
    const [ordersError, setOrdersError] = useState(null); 

    const [showOrders, setShowOrders] = useState(false); 


    useEffect(() => {
        const customerIdFromLocalStorage = localStorage.getItem('customerId');
        const token = localStorage.getItem('token');
        const userIdToFetch = id_customer || customerIdFromLocalStorage;

        if (!userIdToFetch || !token) {
            setError("Você precisa estar logado para ver este perfil.");
            setLoading(false);
            setLoadingOrders(false);
            return;
        }
        
        if (id_customer && parseInt(id_customer, 10) !== parseInt(customerIdFromLocalStorage, 10)) {
            setError("Acesso negado: Você não tem permissão para ver este perfil.");
            setLoading(false);
            setLoadingOrders(false);
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/customer/${userIdToFetch}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
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

        const fetchUserOrders = async () => {
            setLoadingOrders(true); 
            setOrdersError(null);     
            try {
                const response = await axios.get(`http://localhost:8080/api/orders/customer/${userIdToFetch}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCustomerOrders(response.data); 
            } catch (err) {
                console.error("Erro ao buscar pedidos do usuário:", err);
                if (err.response && err.response.status === 404) {
                    setOrdersError("Nenhum pedido encontrado para este usuário.");
                } else if (err.response && err.response.status === 403) {
                    setOrdersError("Acesso negado para ver estes pedidos.");
                } else {
                    setOrdersError("Não foi possível carregar os pedidos. Tente novamente mais tarde.");
                }
            } finally {
                setLoadingOrders(false); 
            }
        };

        fetchUserProfile();
        fetchUserOrders(); 
    }, [id_customer, navigate]); 

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm("Tem certeza que deseja remover este endereço?")) {
            return;
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
        
            setCustomerProfile(prevProfile => ({
                ...prevProfile,
                addresses: prevProfile.addresses.filter(addr => addr.id !== addressId)
            }));
        } catch (err) {
            console.error("Erro ao remover endereço:", err);
            alert(`Erro ao remover endereço: ${err.response?.data?.message || err.message || 'Verifique sua conexão.'}`);
        }
    };
    const toggleOrdersVisibility = () => {
        setShowOrders(prev => !prev);
    };
 

    if (loading || loadingOrders) { 
        return (
            <div className="message-container"> 
                Carregando perfil e pedidos...
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
                                <p>CEP: {address.zipCode}</p>
                                <button
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="delete-address-button"
                                >
                                    Remover
                                </button>
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

            <div className="orders-toggle-section">
                <button 
                    onClick={toggleOrdersVisibility} 
                    className="toggle-orders-button"
                >
                    {showOrders ? 'Ocultar Meus Pedidos' : 'Ver Meus Pedidos'}
                </button>
            </div>

            {showOrders && ( 
                <div className="orders-section">
                    <h2 className="orders-title">Meus Pedidos</h2>
                    {loadingOrders ? (
                        <p>Carregando pedidos...</p>
                    ) : ordersError ? (
                        <p className="error-message-box">{ordersError}</p>
                    ) : customerOrders.length === 0 ? (
                        <p className="no-orders-message">Você não tem pedidos realizados ainda.</p>
                    ) : (
                        <div className="order-list">
                            {customerOrders.map(order => (
                                <div key={order.id} className="order-item">
                                    <p><strong>Pedido ID:</strong> {order.id}</p>
                                    <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Valor Total:</strong> ${order.totalAmount ? order.totalAmount.toFixed(2) : 'N/A'}</p>
                                    <p><strong>Status:</strong> {order.status}</p>
                                    
                                    <p><strong>Endereço de Entrega:</strong></p>
                                    {order.deliveryAddress ? (
                                        <div className="order-delivery-address">
                                            <p>{order.deliveryAddress.street}, {order.deliveryAddress.number} {order.deliveryAddress.complement && `- ${order.deliveryAddress.complement}`}</p>
                                            <p>{order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} - {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                                        </div>
                                    ) : (
                                        <p>Endereço não disponível.</p>
                                    )}

                                    <p><strong>Itens do Pedido:</strong></p>
                                    <ul className="order-items-list">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, index) => (
                                                <li key={item.productId || index}> 
                                                    {item.productName} ({item.quantity}x) - ${item.unitPrice ? item.unitPrice.toFixed(2) : 'N/A'}
                                                </li>
                                            ))
                                        ) : (
                                            <li>Nenhum item encontrado.</li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserProfile;