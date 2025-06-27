// src/Components/Items/Item.jsx
import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom'; // Para navegar para a página do produto

const Item = (props) => {
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}> {/* Link para a página de detalhes do produto */}
        <img onClick={window.scrollTo(0,0)} src={props.image} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">
          ${props.new_price.toFixed(2)}
        </div>
        {props.old_price && ( // Renderiza old_price apenas se existir
          <div className="item-price-old">
            ${props.old_price.toFixed(2)}
          </div>
        )}
      </div>
      {/* --- NOVO: Botão Adicionar ao Carrinho --- */}
      <button 
        className="add-to-cart-btn" 
        onClick={() => props.addToCart(props.id)} // Chama a função addToCart do ShopContext
      >
        ADICIONAR AO CARRINHO
      </button>
      {/* ------------------------------------- */}
    </div>
  );
};

export default Item;