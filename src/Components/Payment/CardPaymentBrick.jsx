import React, { useEffect, useRef } from "react";


export default function CardPaymentBrick({
  publicKey,
  amount = 100,
  payerEmail = "",
  compraId, 
  clienteId, 
  onPaymentSuccess, 
  onPaymentError, 
}) {
  const brickContainerRef = useRef(null); 
  const scriptRef = useRef(null);


  useEffect(() => {
    const initializeBrick = async () => {
     
      if (!window.MercadoPago || !brickContainerRef.current) return;

      brickContainerRef.current.innerHTML = "";


      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();


      await bricksBuilder.create("cardPayment", brickContainerRef.current.id, {
        initialization: {
          amount, 
          payer: { email: payerEmail }, 
        },
        customization: {
          visual: { style: { theme: "dark" } },
          paymentMethods: { maxInstallments: 1 }, 
        },
        callbacks: {
          onReady: () => {
            console.log("Brick pronto!");
          },
          onSubmit: (cardFormData) => {
            const requestId = crypto.randomUUID(); 
            return new Promise((resolve, reject) => {
              
              const token = localStorage.getItem('token');
              if (!token) {
                console.error("Token de autenticação não encontrado no localStorage.");
                const errorMessage = "Não foi possível processar o pagamento: usuário não autenticado.";
                onPaymentError?.(new Error(errorMessage));
                return reject(new Error(errorMessage));
              }
            


              
              const payload = {
                ...cardFormData, 
                compraId: compraId, 
                clienteId: clienteId, 
                transaction_amount: amount,  
                payer: {
                  ...cardFormData.payer, 
                  email: payerEmail, 
                },
              };
              console.log("Payload a ser enviado para o backend:", payload);


              
              fetch("http://localhost:8080/api/mercadopago/cartao", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                  "X-Request-ID": requestId
                },
                body: JSON.stringify(payload),
              })
                .then((res) => {
                    console.log(`[Frontend] Requisição ID: ${requestId} - Resposta recebida com status: ${res.status}`);
                  if (!res.ok) {
                    // Se a resposta não for OK (ex: 400, 500), tenta ler a mensagem de erro do backend
                    return res.json().then(err => {
                      throw new Error(err.message || `Erro na resposta do servidor: ${res.statusText} (Status: ${res.status})`);
                     
                    }).catch(() => {
                      // Se não conseguir parsear como JSON, lança um erro genérico com status
                      throw new Error(`Erro na resposta do servidor: ${res.statusText} (Status: ${res.status}). Resposta não é JSON válido.`);
                    });
                  }
                  return res.json();
                })
                .then((data) => {
                  console.log("Resposta do backend:", data);
                  // Chama o callback de sucesso passado pelas props
                  onPaymentSuccess?.(data);
                  resolve(); 
                })
                .catch((err) => {
                  console.error("Erro no fetch:", err);
                  onPaymentError?.(err);
                  reject(); 
                });
            });
          },
          onError: (error) => {
            console.error("Erro do Brick (onError):", error);
            onPaymentError?.(error);
          },
        },
      });
    };


    const loadScript = () => {
      if (scriptRef.current) return;


      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = initializeBrick;
      document.body.appendChild(script);
      scriptRef.current = script; 
    };


    if (!window.MercadoPago) {
      loadScript();
    } else {
      initializeBrick();
    }


    return () => {
      if (brickContainerRef.current) {
        brickContainerRef.current.innerHTML = "";
      }
    };
  }, [
    publicKey,
    amount,
    payerEmail,
    compraId,
    clienteId,
    onPaymentSuccess,
    onPaymentError,
  ]);


  return (
    <div className="w-full max-w-lg mx-auto bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl text-white font-semibold mb-4">
        Pagamento com Cartão
      </h2>
      <div id="cardPaymentBrick_container" ref={brickContainerRef} key={compraId} />
    </div>
  );
}

