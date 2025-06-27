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

    useEffect(() => {
        const fetchAddresses = async () => {
            const customerId = localStorage.getItem('customerId');
            const token = localStorage.getItem('token');

            if (!customerId || !token || isNaN(parseInt(customerId, 10))) {
                console.warn("Usuário não logado ou customerId inválido. Não é possível buscar endereços.");
                return;
            }

{   /*         try {
                const response = await axios.get(`http://localhost:8080/api/customers/${customerId}/addresses`, {
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
                alert(`Erro ao carregar seus endereços: ${error.response?.data?.message || 'Verifique sua conexão.'}`);
            }*/}
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

            navigate('/checkout', {
                state: {
                    orderId: createdOrder.id,
                    totalAmount: createdOrder.totalAmount,
                    payerEmail: payerEmail
                }
            });

        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            alert(`Erro ao criar seu pedido: ${error.response?.data?.message || 'Verifique os itens do carrinho ou tente novamente.'}`);
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