import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './CategoryCarousel.css';

const CategoryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('http://localhost:3002/api/categories')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Ошибка при получении категорий:', error));
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/all-products?category=${categoryName}`); 
  };
  
  return (
    <div className="category-carousel">
      <div className="carousel-buttons">
      </div>
      <h1>Рекомендуемые категории</h1>
      <div className="category-list">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={`category ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.name)}
          >
            <img src={category.image} alt={category.name} />
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
