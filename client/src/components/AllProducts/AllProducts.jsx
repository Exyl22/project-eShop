import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AllProducts.css';
import heart from '../../Source/heart.svg';

const AllProducts = () => {
  const [productList, setProductList] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, [visibleProducts]);

  const fetchProducts = () => {
    axios.get(`http://localhost:3002/api/products?limit=${visibleProducts}`)
      .then(response => {
        setProductList(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке товаров:', error);
      });
  };

  return (
    <div className="product-listt">
      {productList.map((product) => (
        <Link key={product.id} to={`/products/${product.id}`} className="product-cardd">
          <div className="product-image-containerr">
            <img src={product.banner} alt={product.name} className="product-image" />
          </div>
          <div className="product-detailss">
            <div className="product-infoo">
              <div className="product-namee">{product.name}</div>
              <div className="product-tagss">{product.tags}</div>
              <div className="product-description">{product.description}</div>
            </div>
            <div className="product-actionss">
            <button className="favorite-buttonn"><img src={heart} alt="Favorite" /></button>
              <div className="product-pricee">
                <span className="pricee">{product.price}</span>
                <button className="buy-buttonn">Перейти</button>
              </div>
            </div>
          </div>
        </Link>
      ))}
      <button className='show-more-button' onClick={() => setVisibleProducts(prevCount => prevCount + 10)}>Показать ещё</button>
    </div>
  );
};

export default AllProducts;
