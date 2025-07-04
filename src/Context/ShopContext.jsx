
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ShopContext = createContext(null);

const getDefaultCart = (products) => {
    let cart = {};
    if (products) {
        for (let i = 0; i < products.length; i++) {
            const id = products[i].id;
            cart[id] = 0;
        }
    }
    return cart;
};

const ShopContextProvider = (props) => {
    const [all_products, setAllProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/products');
                setAllProducts(response.data);
                setCartItems(getDefaultCart(response.data));
            } catch (error) {
                console.error("Erro ao carregar todos os produtos para o contexto:", error);
            }
        };

        fetchProducts();
    }, []); 

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        console.log(`Produto ${itemId} adicionado ao carrinho.`);
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_products.find((product) => product.id === Number(item));
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
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

    const clearCart = () => {
        setCartItems(getDefaultCart(all_products));
        console.log("Carrinho limpo!");
    };
    
    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_products,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;