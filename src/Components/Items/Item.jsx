import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom'; 

const Item = (props) => {
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}> 
        <img onClick={window.scrollTo(0,0)} src={props.image} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">
          ${props.new_price.toFixed(2)}
        </div>
        {props.old_price && ( 
          <div className="item-price-old">
            ${props.old_price.toFixed(2)}
          </div>
        )}
      </div>
      
      <button 
        className="add-to-cart-btn" 
        onClick={() => props.addToCart(props.id)} 
      >
        ADICIONAR AO CARRINHO
      </button>

    </div>
  );
};

export default Item;