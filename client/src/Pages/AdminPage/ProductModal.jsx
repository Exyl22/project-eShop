// ProductModal.js
import React, { useState } from 'react';
import axios from 'axios';
import './ProductModal.css';

function ProductModal({ product, onClose, fetchProducts }) {
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price || '');

  const handleSave = () => {
    const payload = { name, description, price };

    if (product.id) {
      axios.put(`http://localhost:3002/api/products/${product.id}`, payload, { withCredentials: true })
        .then(() => {
          fetchProducts();
          onClose();
        })
        .catch(error => {
          console.error('Ошибка при обновлении продукта:', error);
        });
    } else {
      axios.post('http://localhost:3002/api/products', payload, { withCredentials: true })
        .then(() => {
          fetchProducts();
          onClose();
        })
        .catch(error => {
          console.error('Ошибка при добавлении продукта:', error);
        });
    }
  };

  return (
    <div className="modal-overlay-adm">
      <div className="modal-content-adm">
        <h2>{product.id ? 'Редактировать продукт' : 'Добавить продукт'}</h2>
        <label>
          Название:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Описание:
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Цена:
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <div className="modal-actions-adm">
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;