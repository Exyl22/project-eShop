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
        console.log('Products fetched:', response.data); // Add this line for debugging
        setProductList(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке товаров:', error);
      });
  };

  return (
    <div className="product-list-allC">
      {productList.map((product) => (
        <div key={product.id} className="product-card-allC">
          <Link to={`/products/${product.id}`} className="product-link-allC">
            <div className="product-image-container-allC">
              <img src={product.banner} alt={product.name} className="product-image-allC" />
            </div>
            <div className="product-details-allC">
              <div className="product-info-allC">
                <div className="product-name-allC">{product.name}</div>
                <div className="product-tags-allC">
                  {product.steamDetails && product.steamDetails.tags && product.steamDetails.tags.join(', ')}
                </div>
                <div className="product-description-allC">{product.description}</div>
              </div>
            </div>
          </Link>
          <div className="product-actions-allC">
            <div className="product-price-allC">
              {product.discount_percent && (
                <div className="discount-badge-allC">
                  -{product.discount_percent}%
                </div>
              )}
              {product.discount_percent ? (
                <>
                  <span className="original-price-allC">{product.price} руб.</span>
                  <span className="discounted-price-allC">{(product.price * (1 - product.discount_percent / 100)).toFixed(2)} руб.</span>
                </>
              ) : (
                <span className="price-allC">{product.price} руб.</span>
              )}
            </div>
            <div className="buttons-container-allC">
              <button className="buy-button-allC">Перейти</button>
              <button className="favorite-button-allC"><img src={heart} alt="Favorite" /></button>
            </div>
          </div>
        </div>
      ))}
      <button className='show-more-button-allC' onClick={() => setVisibleProducts(prevCount => prevCount + 10)}>Показать ещё</button>
    </div>
  );
};

export default AllProducts;
