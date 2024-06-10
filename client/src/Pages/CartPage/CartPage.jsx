import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

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
      })
      .finally(() => {
        setLoading(false);
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

  const handleCheckout = () => {
    axios.post('http://localhost:3002/api/purchase', {}, { withCredentials: true })
      .then(response => {
        alert('Покупка успешно завершена');
        setCartItems([]);
        setTotalPrice(0);
        navigate('/'); // Redirect to home page after successful purchase
      })
      .catch(error => {
        console.error('Ошибка при оформлении покупки:', error);
      });
  };

  const renderCartItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);

    return currentItems.map(item => (
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
    ));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(cartItems.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    return pageNumbers.map(number => (
      <button
        key={number}
        onClick={() => handlePageChange(number)}
        className={`page-number ${currentPage === number ? 'active' : ''}`}
      >
        {number}
      </button>
    ));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-container">
          <div className="message-block-cart">
            <div className="loader">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-container">
        <h1>Корзина</h1>
        {cartItems.length === 0 ? (
          <div className="message-block-cart">Ваша корзина пуста</div>
        ) : (
          <>
            <div className="message-block-cart">
              <ul className="cart-items-list">
                {renderCartItems()}
              </ul>
              <div className="pagination">
                {renderPageNumbers()}
              </div>
            </div>
            <div className="cart-total">
              <h2>Итого: {totalPrice} руб.</h2>
              <button className="checkout-button" onClick={handleCheckout}>Оформить заказ</button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
