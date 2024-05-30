import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreSliderItem.css';

const StoreSliderItem = ({ slider }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${slider.product_id}`);
  };

  return (
    <div className="store-slider-item">
      <img src={slider.product_image} alt={slider.name} />
      <div className="text-overlay">
        <h2 className="product-name">{slider.name}</h2>
        <p className="product-description">{slider.description}</p>
        <button className="product-button" onClick={handleClick}>Перейти</button>
      </div>
    </div>
  );
};

export default StoreSliderItem;
