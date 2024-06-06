import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick'; // Исправлено название компонента
import axios from 'axios';
import StoreSliderItem from './StoreSliderItem';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './StoreSlider.css';

function StoreSlider() {
  const sliderRef = useRef(null);
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/sliders');
      console.log('Loaded sliders:', response.data); // Проверка данных
      setSliders(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке слайдов:', error);
    }
  };

  const updateCurrentSlide = (oldIndex, newIndex) => {
    setIsSliding(true);
    setCurrentSlide(newIndex);
  };

  const afterChangeSlide = () => {
    setIsSliding(false);
  };

  return (
    <div className="custom-slider-container">
      <Slider
        dots={false}
        infinite={true}
        speed={1000}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={5000}
        beforeChange={updateCurrentSlide}
        afterChange={afterChangeSlide}
        ref={sliderRef}
      >
        {sliders.map(slider => (
          <div key={slider.id}>
            <StoreSliderItem slider={slider} />
          </div>
        ))}
      </Slider>
      <div className="slide-switchers">
        {sliders.map((slider, index) => (
          <div
            key={index}
            className={`slide-switcher ${currentSlide === index ? 'active' : ''}`}
            onClick={() => sliderRef.current.slickGoTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default StoreSlider;
