import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProductsCarousel.css';
import Notification from './Notification';
import { Link } from 'react-router-dom';

const ProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('recommended');
  const [notificationMessage, setNotificationMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(activeTab);
    fetchFavorites();
  }, [activeTab]);

  const fetchProducts = (tab) => {
    let endpoint = '';
    switch (tab) {
      case 'recommended':
        endpoint = '/api/products/recommended';
        break;
      case 'discounts':
        endpoint = '/api/products/discounts';
        break;
      case 'new':
        endpoint = '/api/products/new';
        break;
      default:
        endpoint = '/api/products/recommended';
    }

    axios.get(`http://localhost:3002${endpoint}`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке товаров:', error);
      });
  };

  const fetchFavorites = () => {
    axios.get('http://localhost:3002/api/favorites', { withCredentials: true })
      .then(response => {
        setFavorites(response.data.map(product => product.id)); 
      })
      .catch(error => {
        console.error('Ошибка при загрузке избранных товаров:', error);
      });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLikeClick = (event, id) => {
    event.stopPropagation();
    const isFavorite = favorites.includes(id);
    const method = isFavorite ? 'delete' : 'post';

    axios({
      method,
      url: `http://localhost:3002/api/favorites/${id}`,
      withCredentials: true
    })
    .then(response => {
        if (isFavorite) {
            setFavorites(prevFavorites => prevFavorites.filter(favId => favId !== id));
            setNotificationMessage('Товар удален из избранного');
        } else {
            setFavorites(prevFavorites => [...prevFavorites, id]);
            setNotificationMessage('Товар добавлен в избранное');
        }
        setTimeout(() => setNotificationMessage(''), 2000);
    })
    .catch(error => {
        if (error.response && error.response.status === 401) {
            console.error('Пользователь не авторизован. Перенаправление на страницу входа.');
            navigate('/login');
        } else {
            console.error('Ошибка при обработке избранного:', error);
        }
    });
  };

  return (
    <div className="products-carousel">
      <div className="tabs-prod">
        <button onClick={() => handleTabChange('recommended')} className={activeTab === 'recommended' ? 'active' : ''}>Рекомендации</button>
        <button onClick={() => handleTabChange('discounts')} className={activeTab === 'discounts' ? 'active' : ''}>Скидки</button>
        <button onClick={() => handleTabChange('new')} className={activeTab === 'new' ? 'active' : ''}>Новинки</button>
      </div>
      {notificationMessage && <Notification message={notificationMessage} />}
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <Link to={`/products/${product.id}`} className="product-link">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <div className="product-tags">
                {product.steamDetails && product.steamDetails.tags && product.steamDetails.tags.map((tag, index) => (
                  <span key={index} className="product-tag">{tag}</span>
                ))}
              </div>
            </Link>
            <div className="product-details">
              <div className="product-price-like">
                {product.discount_percent && (
                  <div className="discount-badge">-{product.discount_percent}%</div>
                )}
                <p className="price">
                  {product.discount_percent ? (
                    <>
                      <span className="original-price">{product.price} руб.</span>
                      <span className="discounted-price">{(product.price * (1 - product.discount_percent / 100)).toFixed(2)} руб.</span>
                    </>
                  ) : (
                    `${product.price} руб.`
                  )}
                </p>
                <button 
                  className={`like-button ${favorites.includes(product.id) ? 'favorite' : ''}`} 
                  onClick={(event) => handleLikeClick(event, product.id)}
                >
                  {favorites.includes(product.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className='load-more-button' onClick={() => fetchProducts(activeTab)}>Подробнее</button>
    </div>
  );
};

export default ProductsCarousel;
