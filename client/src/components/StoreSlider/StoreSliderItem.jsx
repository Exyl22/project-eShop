import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreSliderItem.css';

const StoreSliderItem = ({ slider }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${slider.product_id}`);
  };

  return (
    <div className="store-slider-item-slider">
      <img src={slider.image} alt={slider.name} />
      <div className="text-overlay-slider">
        <h2 className="product-name-slider">{slider.name}</h2>
        <p className="product-description-slider">{slider.description}</p>
        <button className="product-button-slider" onClick={handleClick}>Перейти</button>
      </div>
    </div>
  );
};

export default StoreSliderItem;
