import React, {useContext} from 'react'
import './ProductDisplay.css'
import {ShopContext} from '../../Context/ShopContext'

const ProductDisplay= (props) => {
    const {product} = props;
    const {addToCart} = useContext(ShopContext);

    if (!product) {
        return <div className="product-display-message">Produto indisponível ou carregando...</div>;
    }

    console.log("Produto recebido em ProductDisplay (final check):", product);

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img">
                    <img className='productdisplay-main-img' src={product.imageUrl} alt={product.name} />
                </div>
            </div>

            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-new">${product.price?.toFixed(2)}</div> 
                    {product.oldPrice && (
                        <div className="productdisplay-right-price-old">${product.oldPrice?.toFixed(2)}</div>
                    )}
                </div>

                <div className="productdisplay-right-description">
                    {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...'}
                </div>

                <button onClick={()=>{addToCart(product.id)}}>ADD TO CART</button>
                
                <p className='productdisplay-right-category'><span>Category : </span>{product.category}</p>
                <p className='productdisplay-right-category'><span>Tags : </span>100% Cotton Pajamas;

One Size Pajamas;

Comfortable Pajamas;

Nightwear;
</p>
            </div>
        </div>
    );
};

export default ProductDisplay;