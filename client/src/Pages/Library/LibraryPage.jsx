import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './LibraryPage.css';

function LibraryPage() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/auth/check', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          await fetchFavoriteProducts();
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavoriteProducts = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/favorites', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFavoriteProducts(data);
      } catch (error) {
        console.error('Ошибка при загрузке избранных товаров:', error);
      }
    };

    checkAuthentication();
  }, []);

  const removeFromFavorites = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3002/api/favorites/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setFavoriteProducts(favoriteProducts.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Ошибка при удалении товара из избранного:', error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="library-container-fav">
        <div className="loading-message">
          <div className="loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="library-container-fav">
        <h1 className="favorite-h1-fav">Избранные товары</h1>
        {isAuthenticated ? (
          <div className="product-list-fav">
            {favoriteProducts.length > 0 ? (
              favoriteProducts.map(product => (
                <div key={product.id} className="product-item-fav" onClick={() => handleProductClick(product.id)}>
                  <button className="remove-button-fav" onClick={(e) => { e.stopPropagation(); removeFromFavorites(product.id); }}>✕</button>
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p className="price-fav">
                    {product.discount_percent ? (
                      <>
                        <span className="original-price-fav">{product.price} руб.</span>
                        <span className="discounted-price-fav">{(product.price * (1 - product.discount_percent / 100)).toFixed(2)} руб.</span>
                      </>
                    ) : (
                      `${product.price} руб.`
                    )}
                  </p>
                </div>
              ))
            ) : (
              <div className="message-block">
                <p>Тут пусто :(</p>
              </div>
            )}
          </div>
        ) : (
          <div className="message-block">
            <p>Пожалуйста, авторизуйтесь, чтобы увидеть избранные товары.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default LibraryPage;
