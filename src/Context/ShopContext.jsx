// src/Context/ShopContext.jsx
import React, { createContext, useState, useEffect } from 'react'; // Adicione useEffect
import axios from 'axios'; // Adicione axios para requisições HTTP

// Remove a importação do arquivo estático, pois buscaremos do backend
// import all_products_static from "../Components/Assets/all_products"; 

export const ShopContext = createContext(null);

// getDefaultCart agora espera a lista de produtos reais
const getDefaultCart = (products) => {
  let cart = {};
  if (products) {
    for (let i = 0; i < products.length; i++) {
      const id = products[i].id;
      cart[id] = 0; // Começa o carrinho com 0 itens para cada ID
    }
  }
  return cart;
};

const ShopContextProvider = (props) => {
    const [all_products, setAllProducts] = useState([]); // Estado para armazenar TODOS os produtos do backend
    const [cartItems, setCartItems] = useState({}); // Estado do carrinho

    // --- NOVO: useEffect para buscar todos os produtos do backend ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/products'); // Endpoint para todos os produtos
                setAllProducts(response.data); // Atualiza o estado com os produtos do backend
                // Inicializa o carrinho somente DEPOIS que os produtos foram carregados
                setCartItems(getDefaultCart(response.data)); 
            } catch (error) {
                console.error("Erro ao carregar todos os produtos para o contexto:", error);
                // Lidar com o erro, talvez definir um estado de erro global
            }
        };

        fetchProducts();
    }, []); // Array de dependências vazio para executar apenas uma vez

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        console.log(`Produto ${itemId} adicionado ao carrinho.`, cartItems);
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                // Agora, procuramos o produto na lista 'all_products' que veio do backend
                let itemInfo = all_products.find((product) => product.id === Number(item));
                if (itemInfo) { // Garante que o produto foi encontrado
                    totalAmount += itemInfo.price * cartItems[item]; // Use itemInfo.price (preço atual do backend)
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            totalItem += cartItems[item];
        }
        return totalItem;
    };

    // Certifique-se de que 'all_products' está no contextValue
    const contextValue = { getTotalCartItems, getTotalCartAmount, all_products, cartItems, addToCart, removeFromCart };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;