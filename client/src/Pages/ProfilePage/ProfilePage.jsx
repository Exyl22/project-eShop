import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('purchased');
  const [purchasedPage, setPurchasedPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalPurchasedPages, setTotalPurchasedPages] = useState(1);
  const [totalTransactionPages, setTotalTransactionPages] = useState(1);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    axios.get('http://localhost:3002/api/profile', { withCredentials: true })
      .then(res => {
        if (res.data) {
          setUser(res.data);
          setEmail(res.data.email);
          setAvatar(res.data.avatar);
        }
      })
      .catch(err => {
        console.log(err);
      });

    axios.get('http://localhost:3002/api/favorites', { withCredentials: true })
      .then(res => {
        setFavoritesCount(res.data.length);
      })
      .catch(err => {
        console.log(err);
      });

    fetchPurchasedProducts(purchasedPage);
    fetchTransactions(transactionPage);
  }, [purchasedPage, transactionPage]);

  const fetchPurchasedProducts = (page) => {
    axios.get(`http://localhost:3002/api/profile/purchased?page=${page}&limit=${ITEMS_PER_PAGE}`, { withCredentials: true })
      .then(res => {
        setPurchasedProducts(res.data.products);
        setTotalPurchasedPages(res.data.totalPages);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const fetchTransactions = (page) => {
    axios.get(`http://localhost:3002/api/profile/transactions?page=${page}&limit=${ITEMS_PER_PAGE}`, { withCredentials: true })
      .then(res => {
        setTransactions(res.data.transactions);
        setTotalTransactionPages(res.data.totalPages);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleSaveChanges = () => {
    if (newPassword !== confirmPassword) {
      setNotification({ message: 'Новый пароль и подтверждение пароля не совпадают', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('email', email);
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    axios.put('http://localhost:3002/api/profile', formData, { withCredentials: true })
      .then(res => {
        if (res.data) {
          setNotification({ message: 'Изменения успешно сохранены', type: 'success' });
          setEditMode(false);
          setUser(res.data);
        }
      })
      .catch(err => {
        console.log(err);
        setNotification({ message: 'Ошибка при сохранении изменений', type: 'error' });
      });
  };

  const handleLogout = () => {
    axios.post('http://localhost:3002/api/auth/logout', {}, { withCredentials: true })
      .then(res => {
        if (res.data) {
          window.location.href = '/login';
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const renderPurchasedProducts = () => (
    <div className="purchased-products-profile">
      <h3>Купленные товары</h3>
      {purchasedProducts && purchasedProducts.length > 0 ? (
        purchasedProducts.map(product => (
          <div key={product.id} className="purchased-product-profile">
            <h4>{product.name}</h4>
            <p>Дата покупки: {new Date(product.purchase_date).toLocaleDateString()}</p>
            <p>Ключ: {product.key}</p>
          </div>
        ))
      ) : (
        <p>Вы еще не купили ни одного товара.</p>
      )}
      <div className="pagination">
        {Array.from({ length: totalPurchasedPages }, (_, index) => (
          <button
            key={index}
            className={`page-button-profile ${purchasedPage === index + 1 ? 'active' : ''}`}
            onClick={() => setPurchasedPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="transactions-profile">
      <h3>Транзакции</h3>
      {transactions && transactions.length > 0 ? (
        transactions.map(transaction => (
          <div key={transaction.id} className="transaction-profile">
            <h4>{transaction.name}</h4>
            <p>Дата транзакции: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
            <p>Сумма: {transaction.amount} руб.</p>
          </div>
        ))
      ) : (
        <p>У вас нет транзакций.</p>
      )}
      <div className="pagination-profile">
        {Array.from({ length: totalTransactionPages }, (_, index) => (
          <button
            key={index}
            className={`page-button-profile ${transactionPage === index + 1 ? 'active' : ''}`}
            onClick={() => setTransactionPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'purchased') {
      return renderPurchasedProducts();
    } else if (activeTab === 'transactions') {
      return renderTransactions();
    }
    return null;
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-info">
          {user && (
            <>
              <div className="user-details">
                <h2>{user.username}</h2>
                <p>Избранные игры: {favoritesCount}</p>
                <p className="description-profile">{user.description || 'Описание пользователя...'}</p>
              </div>
              <div className="avatar-edit-profile">
                <img src={user.avatar || 'default-avatar.png'} alt="Avatar" className="avatar" />
                <button className="edit-button-profile" onClick={() => setEditMode(true)}>Редактировать</button>
              </div>
            </>
          )}
          {editMode && (
            <div className="modal-profile">
              <div className="modal-content-profile">
                <span className="close-profile" onClick={() => setEditMode(false)}>&times;</span>
                <div className="edit-form-profile">
                  <label>Email:</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label>Текущий пароль:</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <label>Новый пароль:</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <label>Подтвердите новый пароль:</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <label>Аватар:</label>
                  <input type="file" onChange={handleAvatarChange} />
                  <button onClick={handleSaveChanges}>Сохранить изменения</button>
                </div>
              </div>
            </div>
          )}
          {notification.message && (
            <div className={`notification-modal-profile ${notification.type}`}>
              <div className="notification-content-profile">
                <span className="close-profile" onClick={() => setNotification({ message: '', type: '' })}>&times;</span>
                <p>{notification.message}</p>
              </div>
            </div>
          )}
        </div>
        <div className="content-tabs-profile">
          <div className="tabs-container-profile">
            <button className={`tab-button-profile ${activeTab === 'purchased' ? 'active' : ''}`} onClick={() => setActiveTab('purchased')}>Купленные товары</button>
            <button className={`tab-button-profile ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Транзакции</button>
          </div>
          {renderContent()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
