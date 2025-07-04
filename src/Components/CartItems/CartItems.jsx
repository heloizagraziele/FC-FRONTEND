import React, { useContext, useState, useEffect } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartItems = () => {
    
    const { getTotalCartAmount, all_products, cartItems, removeFromCart, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [customerAddresses, setCustomerAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [addressError, setAddressError] = useState(null); 

    useEffect(() => {
        const fetchAddresses = async () => {
            setLoadingAddresses(true); 
            setAddressError(null);     

            const customerId = localStorage.getItem('customerId');
            const token = localStorage.getItem('token');

            if (!customerId || !token || isNaN(parseInt(customerId, 10))) {
                console.warn("Usuário não logado ou customerId inválido. Não é possível buscar endereços.");
                setLoadingAddresses(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8080/api/addresses/customer/${customerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCustomerAddresses(response.data);
                
                if (response.data.length > 0) {
                    setSelectedAddressId(response.data[0].id);
                } else {
                    setSelectedAddressId(null);
                }
            } catch (error) {
                console.error("Erro ao buscar endereços do cliente:", error);
                setAddressError(`Erro ao carregar seus endereços: ${error.response?.data?.message || 'Verifique sua conexão.'}`);
            } finally {
                setLoadingAddresses(false); 
            }
        };

        fetchAddresses();
    }, []); 

    const isUserLoggedIn = () => {
        const token = localStorage.getItem('token');
        const customerId = localStorage.getItem('customerId');
        return !!token && !!customerId && !isNaN(parseInt(customerId, 10));
    };

    const handleProceedToCheckout = async () => {
        if (getTotalCartAmount() === 0) {
            alert("Seu carrinho está vazio. Adicione produtos antes de prosseguir.");
            return;
        }

        if (!isUserLoggedIn()) {
            alert("Você precisa estar logado para finalizar seu pedido!");
            navigate('/login');
            return;
        }

       
        if (!selectedAddressId) {
            alert("Por favor, selecione um endereço de entrega.");
            return;
        }
        

        const customerId = parseInt(localStorage.getItem('customerId'), 10);
        const token = localStorage.getItem('token');
        const payerEmail = localStorage.getItem('customerEmail');

        const items = Object.keys(cartItems).map(productId => {
            const quantity = cartItems[productId];
            
            const product = all_products.find(p => p.id === parseInt(productId, 10)); 
            if (!product) {
                console.error(`Produto com ID ${productId} não encontrado em all_products.`);
                throw new Error(`Produto ${productId} não disponível.`);
            }
            return {
                productId: parseInt(productId, 10),
                quantity: quantity
            };
        });

        const orderPayload = {
            customerId: customerId,
            items: items,
            deliveryAddressId: selectedAddressId 
        };

        try {
            const response = await axios.post('http://localhost:8080/api/orders', orderPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const createdOrder = response.data;
            console.log("Pedido criado com sucesso:", createdOrder);

            
            clearCart(); 

            navigate('/checkout', {
                state: {
                    orderId: createdOrder.id,
                    totalAmount: createdOrder.totalAmount,
                    payerEmail: payerEmail
                }
            });

        } catch (error) {
            console.error("Erro ao criar pedido:", error);
           
            let errorMessage = 'Verifique os itens do carrinho ou tente novamente.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            alert(`Erro ao criar seu pedido: ${errorMessage}`);
        }
    };

    return (
        <div className='cartitems'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />

            {Object.keys(cartItems).map((productId) => {
                const quantity = cartItems[productId];
                
                const product = all_products.find(p => p.id === parseInt(productId, 10)); 

                if (!product || quantity === 0) return null;

                return (
                    <div key={productId}>
                        <div className="cartitems-format cartitems-format-main">
                            <img src={product.imageUrl} alt={product.name} className='carticon-product-icon' />
                            <p>{product.name}</p>
                            <p>${product.price.toFixed(2)}</p>
                            <button className='cartitems-quantity'>{quantity}</button>
                            <p>${(product.price * quantity).toFixed(2)}</p>
                            <img src={remove_icon} onClick={() => removeFromCart(productId)} alt="Remove" />
                        </div>
                        <hr />
                    </div>
                );
            })}

           
            <div className="cartitems-addresses-section">
                <h2>Selecione o Endereço de Entrega</h2>
                {loadingAddresses ? (
                    <p>Carregando endereços...</p>
                ) : addressError ? (
                    <p className="error-message">{addressError}</p>
                ) : customerAddresses.length === 0 ? (
                    <p>Você não tem endereços cadastrados. Por favor, adicione um endereço no seu <a href="/profile">perfil</a>.</p>
                ) : (
                    <div className="address-selection-list">
                        {customerAddresses.map(address => (
                            <div key={address.id} className="address-option">
                                <input
                                    type="radio"
                                    id={`address-${address.id}`}
                                    name="deliveryAddress"
                                    value={address.id}
                                    checked={selectedAddressId === address.id}
                                    onChange={() => setSelectedAddressId(address.id)}
                                />
                                <label htmlFor={`address-${address.id}`}>
                                    <p className="address-text">{address.street}, {address.number} {address.complement && `- ${address.complement}`}</p>
                                    <p className="address-text">{address.neighborhood}, {address.city} - {address.state}</p>
                                    <p className="address-text">CEP: {address.zipCode}</p>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          

            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount().toFixed(2)}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${getTotalCartAmount().toFixed(2)}</h3>
                        </div>
                    </div>

                    <button onClick={handleProceedToCheckout}>PROCEED TO CHECKOUT</button>
                </div>

                <div className="cartitems-promocode">
                    <p>If you have a promo code, enter it here!</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder='promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItems;