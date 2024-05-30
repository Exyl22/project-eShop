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
        const response = await fetch('http://localhost:3002/auth/check', { credentials: 'include' });
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
        const response = await fetch('http://localhost:3002/favorites', { credentials: 'include' });
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
      const response = await fetch(`http://localhost:3002/favorites/${productId}`, {
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className='library-container-fav'>
        <h1 className='favorite-h1-fav'>Избранные товары</h1>
        {isAuthenticated ? (
          <div className="product-list-fav">
            {favoriteProducts.length > 0 ? (
              favoriteProducts.map(product => (
                <div key={product.id} className="product-item-fav" onClick={() => handleProductClick(product.id)}>
                  <button className="remove-button-fav" onClick={(e) => { e.stopPropagation(); removeFromFavorites(product.id); }}>✕</button>
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p className="price-fav">{product.price} руб.</p>
                </div>
              ))
            ) : (
              <p>Тут пусто :(</p>
            )}
          </div>
        ) : (
          <p>Пожалуйста, авторизуйтесь, чтобы увидеть избранные товары.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default LibraryPage;