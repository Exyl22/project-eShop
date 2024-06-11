import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
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
  const [contextMenu, setContextMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState(false); 

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = () => {
    axios.get(`http://localhost:3002/api/admin/products?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, { withCredentials: true })
      .then(response => {
        setProducts(response.data.products);
        setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
      })
      .catch(error => {
        console.error('Ошибка при получении данных о товарах:', error);
      });
  };

  const handleAdd = () => {
    setSelectedProduct({ id: '', name: '', description: '', price: '', image: '', recommended: false, new: false, banner: '', category: '', steamappid: '' });
    setViewMode(false);
    setShowProductModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setViewMode(false);
    setShowProductModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setViewMode(true);
    setShowProductModal(true);
  };

  const handleDelete = (id) => {
    setSelectedProduct({ id });
    setShowConfirmationModal(true);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:3002/api/admin/products/${selectedProduct.id}`, { withCredentials: true })
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

  const handleContextMenu = (event, product) => {
    event.preventDefault();
    setSelectedProduct(product);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleContextMenuOption = (option) => {
    switch (option) {
      case 'view':
        handleView(selectedProduct);
        break;
      case 'edit':
        handleEdit(selectedProduct);
        break;
      case 'delete':
        handleDelete(selectedProduct.id);
        break;
      default:
        break;
    }
    setContextMenu(null);
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <Header />
      <div className="admin-container">
        <h1>Панель администратора</h1>
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
          <button className="add-button" onClick={handleAdd}>Добавить продукт</button>
          <button className="add-button">Скидка на товар</button>
          <button className="add-button">Тест</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Цена</th>
              <th>Рекомендовано</th>
              <th>Новинка</th>
              <th>Категория</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map(product => (
              <tr key={product.id} onContextMenu={(event) => handleContextMenu(event, product)} onDoubleClick={(event) => handleContextMenu(event, product)}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.recommended ? 'Да' : 'Нет'}</td>
                <td>{product.new ? 'Да' : 'Нет'}</td>
                <td>{product.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-admin">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-button-admin ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {contextMenu && (
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={() => setContextMenu(null)}
          >
            <button onClick={() => handleContextMenuOption('view')}>Просмотр</button>
            <button onClick={() => handleContextMenuOption('edit')}>Редактировать</button>
            <button onClick={() => handleContextMenuOption('delete')}>Удалить</button>
          </div>
        )}
      </div>
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
          fetchProducts={fetchProducts}
          viewMode={viewMode} 
        />
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={confirmDelete}
          onClose={handleConfirmationClose}
        />
      )}
      <Footer />
    </>
  );
}

export default AdminPage;
