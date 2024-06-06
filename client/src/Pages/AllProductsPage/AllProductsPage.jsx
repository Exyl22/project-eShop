import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AllProductsPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import likes from '../../Source/heart.svg';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all-products');
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const categoryFromQuery = query.get('category');
    if (categoryFromQuery) {
      setCategory(categoryFromQuery);
    }
  }, [query]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, category, sortBy, order]);

  const fetchCategories = () => {
    axios.get('http://localhost:3002/api/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке категорий:', error);
      });
  };

  const fetchProducts = () => {
    let endpoint = '/api/all-products';
    if (category !== 'all-products') {
      endpoint = `/api/products/${category}`;
    }

    axios.get(`http://localhost:3002${endpoint}`, {
      params: {
        search,
        sortBy,
        order,
        category,
      },
    })
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке товаров:', error);
      });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    navigate(`/all-products?category=${newCategory}`);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
  };

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <>
      <Header />
      <div className="all-products-container">
        <div className="filter-container">
          <div className="category-buttons">
            <button value="all-products" onClick={handleCategoryChange}>Все товары</button>
            <button value="recommended" onClick={handleCategoryChange}>Рекомендуемые</button>
            <button value="discounts" onClick={handleCategoryChange}>Скидки</button>
            <button value="new" onClick={handleCategoryChange}>Новинки</button>
          </div>
        </div>
        <div className="main-content">
          <div className="top-filters">
            <input 
              type="text" 
              placeholder="Поиск товаров..." 
              value={search} 
              onChange={handleSearchChange} 
            />
            <select value={category} onChange={handleCategoryChange}>
              <option value="all-products">Все товары</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select value={sortBy} onChange={handleSortChange}>
              <option value="">Сортировать по</option>
              <option value="price">Цена</option>
              <option value="name">Название</option>
            </select>
            <select value={order} onChange={handleOrderChange}>
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
          <div className="product-list-all">
            {products.map(product => (
              <div className="product-card-all" key={product.id} onClick={() => handleProductClick(product.id)}>
                <div className="product-image-container-all">
                  <img src={product.banner} alt={product.name} className="product-banner-image-all" />
                </div>
                <div className="product-details-all">
                  <div className="product-info-all">
                    <h2 className="product-name-all">{product.name}</h2>
                    <h4 className="product-name-all">{product.description}</h4>
                  </div>
                  <button className="favorite-button-all">
                    <img src={likes} alt="Favorite" />
                  </button>
                  <div className="product-actions-all">
                    <p className="product-price-all">Цена: {product.price}</p>
                    <button className="buy-button-all">Купить</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AllProductsPage;