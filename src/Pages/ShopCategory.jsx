import React, { useContext, useState, useEffect } from 'react'; 
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import Item from '../Components/Items/Item';
import axios from 'axios'; 

const ShopCategory = (props) => {
    const { addToCart } = useContext(ShopContext); 


  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

 
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true); 

      try {
       
        const response = await axios.get(`http://localhost:8080/api/products?category=${props.category}`);
        setProducts(response.data); 
      } catch (err) {
        console.error("Erro ao buscar produtos da categoria:", err);
        setError("Não foi possível carregar os produtos. Tente novamente mais tarde.");
      } finally {
        setLoading(false); 
      }
    };

    fetchCategoryProducts();
  }, [props.category]); 


  if (loading) {
    return <div className="shop-category-message">Carregando produtos...</div>;
  }

  if (error) {
    return <div className="shop-category-message shop-category-error">Erro: {error}</div>;
  }

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>
            Showing {products.length > 0 ? 1 : 0}-{products.length}
          </span> out of {products.length} products
        </p>
    
      </div>
      <div className="shopcategory-products">
        {products.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.imageUrl}
              new_price={item.price}  
              old_price={item.oldPrice}
              addToCart={addToCart}
            />
          );
        })}
      </div>

      {products.length === 0 && !loading && !error && (
        <div className="shop-category-message">Nenhum produto encontrado nesta categoria.</div>
      )}
    </div>
  );
};

export default ShopCategory;