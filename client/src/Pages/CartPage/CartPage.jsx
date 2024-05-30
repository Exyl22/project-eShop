// src/pages/CartPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    axios.get('http://localhost:3002/cart', { withCredentials: true })
      .then(response => {
        setCartItems(response.data);
        calculateTotalPrice(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке товаров корзины:', error);
      });
  };

  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const handleRemoveItem = (id) => {
    axios.delete(`http://localhost:3002/cart/${id}`, { withCredentials: true })
      .then(response => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        calculateTotalPrice(cartItems.filter(item => item.id !== id));
      })
      .catch(error => {
        console.error('Ошибка при удалении товара из корзины:', error);
      });
  };

  const handleIncreaseQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    axios.put(`http://localhost:3002/cart/${id}`, { quantity: item.quantity + 1 }, { withCredentials: true })
      .then(response => {
        setCartItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
        calculateTotalPrice(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
      })
      .catch(error => {
        console.error('Ошибка при увеличении количества товара:', error);
      });
  };

  const handleDecreaseQuantity = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item.quantity > 1) {
      axios.put(`http://localhost:3002/cart/${id}`, { quantity: item.quantity - 1 }, { withCredentials: true })
        .then(response => {
          setCartItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
          calculateTotalPrice(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
        })
        .catch(error => {
          console.error('Ошибка при уменьшении количества товара:', error);
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
                <li key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h2>{item.name}</h2>
                    <p>Цена: {item.price} руб.</p>
                    <div className="quantity-controls">
                      <button onClick={() => handleDecreaseQuantity(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncreaseQuantity(item.id)}>+</button>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)}>Удалить</button>
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