import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductModal.css';

const ProductModal = ({ product, onClose, fetchProducts, viewMode }) => {
  const [formData, setFormData] = useState({ ...product });
  const [activeTab, setActiveTab] = useState('manual');
  const [steamAppId, setSteamAppId] = useState(product.steamappid || '');

  useEffect(() => {
    setFormData({ ...product });
    setSteamAppId(product.steamappid || '');
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = formData.id ? 'put' : 'post';
    const url = formData.id ? `http://localhost:3002/api/admin/products/${formData.id}` : `http://localhost:3002/api/admin/products`;

    const dataToSubmit = { ...formData, steamappid: formData.steamappid || steamAppId };

    axios[method](url, dataToSubmit, { withCredentials: true })
      .then(() => {
        fetchProducts();
        onClose();
      })
      .catch(error => {
        console.error('Ошибка при сохранении продукта:', error);
      });
  };

  const handleFetchSteamGameDetails = () => {
    axios.get(`http://localhost:3002/api/admin/steamgame/${steamAppId}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then(response => {
        const gameDetails = response.data;
        setFormData({
          ...formData,
          name: gameDetails.name,
          description: gameDetails.short_description,
          image: gameDetails.library_image || gameDetails.header_image,
          banner: gameDetails.header_image, 
          category: Array.isArray(gameDetails.tags) ? gameDetails.tags.join(', ') : gameDetails.tags,
          steamappid: steamAppId,
        });
      })
      .catch(error => {
        console.error('Ошибка при получении данных из Steam:', error);
      });
  };

  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin">
        <h2>{viewMode ? 'Просмотр информации' : formData.id ? 'Редактировать продукт' : 'Добавить продукт'}</h2>
        {!viewMode && (
          <div className="tab-container">
            <button className={activeTab === 'manual' ? 'active' : ''} onClick={() => setActiveTab('manual')}>Вручную</button>
            <button className={activeTab === 'steam' ? 'active' : ''} onClick={() => setActiveTab('steam')}>Steam</button>
          </div>
        )}
        {activeTab === 'manual' || viewMode ? (
          <form onSubmit={handleSubmit}>
            <label>Название:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={viewMode} />

            <label>Описание:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} disabled={viewMode} style={{ height: '150px' }} />

            <label>Цена:</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required disabled={viewMode} />

            <label>Изображение:</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} disabled={viewMode} />

            <div className="checkbox-container">
              <label>Рекомендовано:</label>
              <input type="checkbox" name="recommended" checked={formData.recommended} onChange={handleChange} disabled={viewMode} />

              <label>Новинка:</label>
              <input type="checkbox" name="new" checked={formData.new} onChange={handleChange} disabled={viewMode} />
            </div>

            <label>Баннер:</label>
            <input type="text" name="banner" value={formData.banner} onChange={handleChange} disabled={viewMode} />

            <label>Категория:</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} disabled={viewMode} />

            <label>Steam App ID:</label>
            <div className="steam-appid-container">
              <input type="number" name="steamappid" value={formData.steamappid || steamAppId} onChange={(e) => {
                handleChange(e);
                setSteamAppId(e.target.value); 
              }} disabled={viewMode} />
            </div>

            <div className="modal-actions-admin">
              {viewMode ? (
                <button type="button" onClick={onClose}>Закрыть</button>
              ) : (
                <>
                  <button type="submit">Сохранить</button>
                  <button type="button" onClick={onClose}>Отмена</button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div>
            <label>Steam App ID:</label>
            <div className="steam-appid-container">
              <input type="number" value={steamAppId} onChange={(e) => setSteamAppId(e.target.value)} />
              <button type="button" onClick={handleFetchSteamGameDetails}>Получить данные из Steam</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>Название:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />

              <label>Описание:</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ height: '150px' }} />

              <label>Цена:</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />

              <label>Изображение:</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} />

              <div className="checkbox-container">
                <label>Рекомендовано:</label>
                <input type="checkbox" name="recommended" checked={formData.recommended} onChange={handleChange} />

                <label>Новинка:</label>
                <input type="checkbox" name="new" checked={formData.new} onChange={handleChange} />
              </div>

              <label>Баннер:</label>
              <input type="text" name="banner" value={formData.banner} onChange={handleChange} />

              <label>Категория:</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} />

              <label>Steam App ID:</label>
              <div className="steam-appid-container">
                <input type="number" name="steamappid" value={steamAppId} onChange={(e) => {
                  handleChange(e);
                  setSteamAppId(e.target.value); 
                }} />
              </div>

              <div className="modal-actions-admin">
                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Отмена</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
