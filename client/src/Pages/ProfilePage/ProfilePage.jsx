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
  const [message, setMessage] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('purchased'); // Active tab state

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

    fetchPurchasedProducts();
    fetchTransactions();
  }, []);

  const fetchPurchasedProducts = () => {
    axios.get('http://localhost:3002/api/profile/purchased', { withCredentials: true })
      .then(res => {
        setPurchasedProducts(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const fetchTransactions = () => {
    axios.get('http://localhost:3002/api/profile/transactions', { withCredentials: true })
      .then(res => {
        setTransactions(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleSaveChanges = () => {
    if (newPassword !== confirmPassword) {
      setMessage('Новый пароль и подтверждение пароля не совпадают');
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
          setMessage('Изменения успешно сохранены');
          setEditMode(false);
          setUser(res.data);
        }
      })
      .catch(err => {
        console.log(err);
        setMessage('Ошибка при сохранении изменений');
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

  const renderContent = () => {
    if (activeTab === 'purchased') {
      return (
        <div className="purchased-products">
          <h3>Купленные товары</h3>
          {purchasedProducts.length > 0 ? (
            purchasedProducts.map(product => (
              <div key={product.id} className="purchased-product">
                <h4>{product.name}</h4>
                <p>Дата покупки: {new Date(product.purchase_date).toLocaleDateString()}</p>
                <p>Ключ: {product.key}</p>
              </div>
            ))
          ) : (
            <p>Вы еще не купили ни одного товара.</p>
          )}
        </div>
      );
    } else if (activeTab === 'transactions') {
      return (
        <div className="transactions">
          <h3>Транзакции</h3>
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <div key={transaction.id} className="transaction">
                <h4>{transaction.product_name}</h4>
                <p>Дата транзакции: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                <p>Сумма: {transaction.amount} руб.</p>
              </div>
            ))
          ) : (
            <p>У вас нет транзакций.</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="sidebar">
          <button onClick={() => setActiveTab('purchased')}>Купленные товары</button>
          <button onClick={() => setActiveTab('transactions')}>Транзакции</button>
          {/* Add more buttons for additional tabs here */}
        </div>
        <div className="profile-content">
          {user ? (
            <div className="profile-info">
              <div className="user-details">
                <h2>{user.username}</h2>
                <p>Избранные игры: {favoritesCount}</p>
                <p className="description">{user.description || 'Описание пользователя...'}</p>
              </div>
              <div className="avatar-edit">
                <img src={user.avatar || 'default-avatar.png'} alt="Avatar" className="avatar" />
                <button onClick={() => setEditMode(true)}>Редактировать</button>
              </div>
              {editMode && (
                <div className="modal">
                  <div className="modal-content">
                    <span className="close" onClick={() => setEditMode(false)}>&times;</span>
                    <div className="edit-form">
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
              {message && <p className="message">{message}</p>}
            </div>
          ) : (
            <div className="loading">Загрузка...</div>
          )}
          {renderContent()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
