import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = () => {
    axios.get('http://localhost:3002/api/cart', { withCredentials: true })
      .then(response => {
        setCartItems(response.data);
        calculateTotalPrice(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке товаров корзины:', error);
      });
  };

  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => {
      const itemPrice = item.discount_percent ? item.products.price * (1 - item.discount_percent / 100) : item.products.price;
      return sum + itemPrice * item.quantity;
    }, 0);
    setTotalPrice(total);
  };

  const handleRemoveItem = (productId) => {
    axios.delete(`http://localhost:3002/api/cart/${productId}`, { withCredentials: true })
      .then(response => {
        const updatedItems = cartItems.filter(item => item.products.id !== productId);
        setCartItems(updatedItems);
        calculateTotalPrice(updatedItems);
      })
      .catch(error => {
        console.error('Ошибка при удалении товара из корзины:', error);
      });
  };

  const handleIncreaseQuantity = (productId) => {
    const item = cartItems.find(item => item.products.id === productId);
    axios.put(`http://localhost:3002/api/cart/${productId}`, { quantity: item.quantity + 1 }, { withCredentials: true })
      .then(response => {
        const updatedItems = cartItems.map(item => item.products.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
        setCartItems(updatedItems);
        calculateTotalPrice(updatedItems);
      })
      .catch(error => {
        console.error('Ошибка при увеличении количества товара:', error);
      });
  };

  const handleDecreaseQuantity = (productId) => {
    const item = cartItems.find(item => item.products.id === productId);
    if (item.quantity > 1) {
      axios.put(`http://localhost:3002/api/cart/${productId}`, { quantity: item.quantity - 1 }, { withCredentials: true })
        .then(response => {
          const updatedItems = cartItems.map(item => item.products.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
          setCartItems(updatedItems);
          calculateTotalPrice(updatedItems);
        })
        .catch(error => {
          console.error('Ошибка при уменьшении количества товара:', error);
        });
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (quantity > 0) {
      axios.put(`http://localhost:3002/api/cart/${productId}`, { quantity }, { withCredentials: true })
        .then(response => {
          const updatedItems = cartItems.map(item => item.products.id === productId ? { ...item, quantity } : item);
          setCartItems(updatedItems);
          calculateTotalPrice(updatedItems);
        })
        .catch(error => {
          console.error('Ошибка при изменении количества товара:', error);
        });
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <h1>Корзина</h1>
        {cartItems.length === 0 ? (
          <p>Ваша корзина пуста</p>
        ) : (
          <>
            <ul className="cart-items-list">
              {cartItems.map(item => (
                <li key={item.products.id} className="cart-item">
                  <Link to={`/products/${item.products.id}`} className="cart-item-link">
                    <img src={item.products.image} alt={item.products.name} className="cart-item-image" />
                  </Link>
                  <div className="cart-item-details">
                    <Link to={`/products/${item.products.id}`} className="cart-item-link">
                      <h2>{item.products.name}</h2>
                    </Link>
                    <p className="price-fav">
                      {item.discount_percent ? (
                        <>
                          <span className="original-price-fav">{item.products.price} руб.</span>
                          <span className="discounted-price-fav">{(item.products.price * (1 - item.discount_percent / 100)).toFixed(2)} руб.</span>
                        </>
                      ) : (
                        `${item.products.price} руб.`
                      )}
                    </p>
                    <div className="quantity-controls">
                      <button onClick={() => handleDecreaseQuantity(item.products.id)}>-</button>
                      <input 
                        type="text" 
                        value={item.quantity} 
                        onChange={(e) => handleQuantityChange(item.products.id, e.target.value)} 
                      />
                      <button onClick={() => handleIncreaseQuantity(item.products.id)}>+</button>
                      <button className="remove-button-cart" onClick={() => handleRemoveItem(item.products.id)}>Удалить</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <h2>Итого: {totalPrice} руб.</h2>
              <button className="checkout-button">Оформить заказ</button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
