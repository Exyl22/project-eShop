import React, { useState } from 'react';
import axios from 'axios';
import './ProductModal.css';

function ProductModal({ product, onClose, fetchProducts }) {
  const [formData, setFormData] = useState(product);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.id) {
      axios.put(`http://localhost:3002/api/products/${product.id}`, formData, { withCredentials: true })
        .then(() => {
          fetchProducts();
          onClose();
        })
        .catch(error => {
          console.error('Ошибка при обновлении товара:', error);
        });
    } else {
      axios.post('http://localhost:3002/api/products', formData, { withCredentials: true })
        .then(() => {
          fetchProducts();
          onClose();
        })
        .catch(error => {
          console.error('Ошибка при добавлении товара:', error);
        });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{product.id ? 'Редактировать товар' : 'Добавить товар'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Название</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <label>Описание</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <label>Цена</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />
          <button type="submit">{product.id ? 'Сохранить изменения' : 'Добавить товар'}</button>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
