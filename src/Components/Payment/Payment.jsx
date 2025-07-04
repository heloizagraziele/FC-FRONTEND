import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CardPaymentBrick from './CardPaymentBrick'; 
import './Payment.css'; 

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null); 

    console.log("Dados da Ordem no Payment.jsx:", orderData);
    
    useEffect(() => {
        if (location.state) {
            setOrderData(location.state);
        } else {
            alert("Nenhum pedido encontrado para checkout. Redirecionando para o carrinho.");
            navigate('/cart');
        }
    }, [location.state, navigate]);

  
    const handlePaymentSuccess = (response) => {
        console.log("Pagamento realizado com sucesso:", response);
        setPaymentStatus('success');
        alert("Pagamento aprovado! ID da transação: " + response.id);
        
        navigate('/', { state: { paymentResponse: response, order: orderData } });
        
    };

 
    const handlePaymentError = (error) => {
        console.error("Erro no pagamento:", error);
        setPaymentStatus('error');
        alert("Erro ao processar o pagamento. Por favor, tente novamente. Detalhes: " + (error.message || JSON.stringify(error)));
        
      
        navigate('/'); 
        
    };

    if (!orderData) {
        return (
            
            <div className="loading-message-container">
                Carregando informações do pedido...
            </div>
        );
    }

    const MERCADO_PAGO_PUBLIC_KEY = "TEST-b75e606f-0bd7-448b-a72f-8e42b0d1a776"; 

    return (
        
        <div className="payment-container">
            <h1 className="payment-title">Finalizar Pedido</h1>
            
            <div className="order-details-card">
                <p className="order-detail-text">ID do Pedido: <span className="order-detail-text-value">{orderData.orderId}</span></p>
                <p className="order-detail-text">Valor Total: <span className="order-detail-text-value">R$ {orderData.totalAmount?.toFixed(2)}</span></p>
                {orderData.payerEmail && (
                    <p className="order-detail-email">Email do Pagador: <span>{orderData.payerEmail}</span></p>
                )}
            </div>

            <div className="card-payment-brick-wrapper">
                <CardPaymentBrick
                    publicKey={MERCADO_PAGO_PUBLIC_KEY}
                    amount={orderData.totalAmount}
                    payerEmail={orderData.payerEmail}
                    compraId={orderData.orderId}
                    clienteId={localStorage.getItem('customerId')}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            </div>

            {paymentStatus === 'success' && (
                <div className="payment-status-message payment-status-success">
                    Pagamento aprovado com sucesso!
                </div>
            )}

            {paymentStatus === 'error' && (
                <div className="payment-status-message payment-status-error">
                    Ocorreu um erro no pagamento. Por favor, tente novamente.
                </div>
            )}
        </div>
    );
};

export default Payment;
