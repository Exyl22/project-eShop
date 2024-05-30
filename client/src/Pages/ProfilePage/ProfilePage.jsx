import React, { useEffect, useState } from 'react';
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
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3002/profile', { withCredentials: true })
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

    axios.get('http://localhost:3002/orders', { withCredentials: true })
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleSaveChanges = () => {
    if (newPassword !== confirmPassword) {
      setMessage('Новый пароль и подтверждение пароля не совпадают');
      return;
    }

    const formData = new FormData();
    formData.append('username', user.username); // Добавляем логин пользователя
    formData.append('email', email);
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    axios.put('http://localhost:3002/profile', formData, { withCredentials: true })
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
    axios.post('http://localhost:3002/logout', {}, { withCredentials: true })
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

  return (
    <>
      <Header />
      <div className="profile-container">
        {user ? (
          <div className="profile-info">
            <h1>Профиль</h1>
            {editMode ? (
              <div className="edit-form">
                <label>Логин:</label>
                <input type="text" value={user.username} disabled />
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
            ) : (
              <>
                <img src={user.avatar || 'default-avatar.png'} alt="Avatar" className="avatar" />
                <p>Логин: {user.username}</p>
                <p>Email: {user.email}</p>
                <button onClick={() => setEditMode(true)}>Редактировать</button>
              </>
            )}
            <button onClick={handleLogout}>Выйти</button>
            {message && <p className="message">{message}</p>}
            <h2>История заказов</h2>
            <ul className="orders-list">
              {orders.map(order => (
                <li key={order.id}>
                  <p>Заказ №{order.id}</p>
                  <p>Дата: {new Date(order.date).toLocaleDateString()}</p>
                  <p>Сумма: {order.total} руб.</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="loading">Загрузка...</div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;