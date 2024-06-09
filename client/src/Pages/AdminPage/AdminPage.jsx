import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';
import Header from '../../components/Header/Header';
import ProductModal from './ProductModal';
import ConfirmationModal from './ConfirmationModal';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:3002/api/products/admin', { withCredentials: true }) 
      .then(response => {
        setProducts(response.data); 
      })
      .catch(error => {
        console.error('Ошибка при получении данных о товарах:', error);
      });
  };

  const handleAdd = () => {
    setSelectedProduct({ id: '', name: '', description: '', price: '' });
    setShowProductModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDelete = (id) => {
    setSelectedProduct({ id });
    setShowConfirmationModal(true);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:3002/api/products/${selectedProduct.id}`, { withCredentials: true })
      .then(() => {
        fetchProducts();
        setShowConfirmationModal(false);
      })
      .catch(error => {
        console.error('Ошибка при удалении товара:', error);
      });
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm.toLowerCase())
    );
  });

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  return (
    <>
      <Header />
      <div className="admin-container">
        <h1>Админка</h1>
        <div className="admin-controls">
          <input
            type="text"
            placeholder="Поиск по названию, описанию или ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id">ID</option>
            <option value="name">Название</option>
            <option value="description">Описание</option>
            <option value="price">Цена</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
        <button className="add-button" onClick={handleAdd}>Добавить</button>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td className="admin-actions">
                  <button onClick={() => handleEdit(product)}>Редактировать</button>
                  <button onClick={() => handleDelete(product.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
          fetchProducts={fetchProducts}
        />
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={confirmDelete}
          onClose={handleConfirmationClose}
        />
      )}
    </>
  );
}

export default AdminPage;
