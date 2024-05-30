import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProductsCarousel.css';
import Notification from './Notification';

const ProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('recommended');
  const [notificationMessage, setNotificationMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(activeTab);
    fetchFavorites(); // Загрузка избранных товаров при монтировании компонента
  }, [activeTab]);

  const fetchProducts = (tab) => {
    let endpoint = '';
    switch (tab) {
      case 'recommended':
        endpoint = '/products/recommended';
        break;
      case 'discounts':
        endpoint = '/products/discounts';
        break;
      case 'new':
        endpoint = '/products/new';
        break;
      default:
        endpoint = '/products/recommended';
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
    axios.get('http://localhost:3002/favorites', { withCredentials: true })
      .then(response => {
        setFavorites(response.data.map(product => product.id)); // Предполагается, что сервер возвращает массив объектов с id товаров
      })
      .catch(error => {
        console.error('Ошибка при загрузке избранных товаров:', error);
      });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  const handleLikeClick = (event, id) => {
    event.stopPropagation();
    const isFavorite = favorites.includes(id);
    const method = isFavorite ? 'delete' : 'post';
    const endpoint = isFavorite ? `/favorites/${id}` : '/favorites';
    const data = isFavorite ? {} : { productId: id };

    axios({
      method,
      url: `http://localhost:3002${endpoint}`,
      data,
      withCredentials: true
    })
    .then(response => {
      console.log(response.data.message);
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
          <div key={product.id} className="product-item" onClick={() => handleProductClick(product.id)}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <div className="product-details">
              <p className="price">{product.price} руб.</p>
              <button 
                className={`like-button ${favorites.includes(product.id) ? 'favorite' : ''}`} 
                onClick={(event) => handleLikeClick(event, product.id)}
              >
                {favorites.includes(product.id) ? '-' : '+'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className='load-more-button' onClick={() => fetchProducts(activeTab)}>Подробнее</button>
    </div>
  );
};

export default ProductsCarousel;