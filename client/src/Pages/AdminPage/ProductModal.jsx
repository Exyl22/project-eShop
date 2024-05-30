import React, { useState, useEffect } from 'react';
import axios from 'axios';
function ProductModal({ product, onClose, fetchProducts }) {
  const [formData, setFormData] = useState(product);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = product.id ? 'put' : 'post';
    const url = product.id ? `http://localhost:3002/products/${product.id}` : 'http://localhost:3002/products';

    axios[method](url, formData)
      .then(() => {
        fetchProducts();
        onClose();
      })
      .catch(error => {
        console.error(`Ошибка при ${product.id ? 'редактировании' : 'добавлении'} товара:`, error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-contentt">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{product.id ? 'Редактировать' : 'Добавить'} товар</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Название"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Цена"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{product.id ? 'Сохранить' : 'Добавить'}</button>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
