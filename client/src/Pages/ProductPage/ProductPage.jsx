import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import './ProductPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('description');
  const [steamRequirements, setSteamRequirements] = useState(null);
  const [steamDetails, setSteamDetails] = useState({ description: '', images: [], tags: [], headerImage: '' });
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const [likeDislikeRatio, setLikeDislikeRatio] = useState(null);
  const navigate = useNavigate();
  const { productId } = useParams();

  useEffect(() => {
    console.log('Product ID:', productId);
    setLoading(true);
    axios.get(`http://localhost:3002/products/${productId}`)
      .then(response => {
        console.log('Product data:', response.data); // Отладочная информация
        setProduct(response.data);
        setLoading(false);
        if (response.data.steamAppId) {
          fetchSteamDetails(response.data.steamAppId);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the product!', error);
        setLoading(false);
      });
  }, [productId]);

  const fetchSteamDetails = (appId) => {
    console.log('Fetching Steam details for appId:', appId); // Отладочная информация
    axios.get(`http://localhost:3002/steam-game/${appId}`)
      .then(response => {
        console.log('Steam API Response:', response.data); // Отладочная информация
        const data = response.data;
        setSteamRequirements(data.pc_requirements);
        setSteamDetails(prevDetails => ({
          ...prevDetails,
          ...data.steamDetails
        }));
        calculateLikeDislikeRatio(data.steamDetails, appId); // Вычисление соотношения лайков/дизлайков
      })
      .catch(error => {
        console.error('There was an error fetching the Steam game details!', error);
      });
  };

  const calculateLikeDislikeRatio = (details, appId) => {
    const { recommendations_total: total, recommendations_positive: positive } = details;
    if (total && positive) {
      const ratio = (positive / total) * 100;
      setLikeDislikeRatio(ratio.toFixed(2)); // Установка соотношения с двумя знаками после запятой
    } else {
      // Если информация о рекомендациях отсутствует, попробуем запросить ее отдельно
      axios.get(`https://store.steampowered.com/appreviews/${appId}?json=1&filter=recent`)
        .then(response => {
          console.log('Steam Reviews API Response:', response.data); // Отладочная информация
          const data = response.data;
          if (data.query_summary && data.query_summary.total_reviews && data.query_summary.total_positive) {
            const ratio = (data.query_summary.total_positive / data.query_summary.total_reviews) * 100;
            setLikeDislikeRatio(ratio.toFixed(2));
          }
        })
        .catch(error => {
          console.error('Error fetching reviews from Steam:', error);
        });
    }
  };

  const handleAddToCart = () => {
    axios.post('http://localhost:3002/cart', { productId: product.id, quantity: 1 }, { withCredentials: true })
      .then(response => {
        console.log('Product added to cart:', response.data);
        alert('Product added to cart');
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
        alert('Error adding product to cart');
      });
  };

  const openModal = (index) => {
    setModalImageIndex(index);
  };

  const closeModal = () => {
    setModalImageIndex(null);
  };

  const nextImage = () => {
    setModalImageIndex((prevIndex) => (prevIndex + 1) % steamDetails.images.length);
  };

  const prevImage = () => {
    setModalImageIndex((prevIndex) => (prevIndex - 1 + steamDetails.images.length) % steamDetails.images.length);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="loading">Product not found</div>;
  }

  const { name, price, images } = product;

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 2
        }
      }
    ]
  };

  return (
    <>
      <Header />
      <div className="product-page">
        <div>
          <button className="back-button" onClick={() => navigate('/all-products')}>← К каталогу</button>
        </div>
        <div className="product-info-container">
          <div className="main-image-container">
            <img src={steamDetails.headerImage || steamDetails.images[0]} alt="Main" className="main-image" />
            <div className="product-price-button-container">
              <div className="product-price">{price} руб.</div>
              <button className="add-to-cart" onClick={handleAddToCart}>Добавить в корзину</button>
            </div>
            <button className="add-to-favorites">Добавить в избранное</button>
          </div>
          {likeDislikeRatio && (
              <div className="like-dislike-ratio">
                Соотношение лайков/дизлайков: {likeDislikeRatio}%
              </div>
            )}
          <div className="product-info">
            <div className="product-name">{name}</div>
            <div className="product-tags">
              {steamDetails.tags && steamDetails.tags.length > 0 && steamDetails.tags.map((tag, index) => (
                <span key={index} className="product-tag">{tag}</span>
              ))}
            </div>
            <div className="product-images">
              <Slider {...carouselSettings}>
                {steamDetails.images.length > 0 && steamDetails.images.map((image, index) => (
                  <div key={index}>
                    <img src={image} alt={`Steam image ${index + 1}`} className="additional-image" onClick={() => openModal(index)} />
                  </div>
                ))}
                {images && images.slice(1).map((image, index) => (
                  <div key={index}>
                    <img src={image} alt={`${name} ${index + 1}`} className="additional-image" onClick={() => openModal(index + steamDetails.images.length)} />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
        <div className="product-extra-info">
          <div className="tabs">
            <button className={`tab ${view === 'description' ? 'active' : ''}`} onClick={() => setView('description')}>Описание</button>
            <button className={`tab ${view === 'systemRequirements' ? 'active' : ''}`} onClick={() => setView('systemRequirements')}>Системные требования</button>
          </div>
          <div className="tab-content center-content">
            {view === 'description' && <div>
              <div dangerouslySetInnerHTML={{ __html: steamDetails.description }} />
            </div>}
            {view === 'systemRequirements' && (
              <div>
                {steamRequirements && (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: steamRequirements.minimum }} />
                    <div dangerouslySetInnerHTML={{ __html: steamRequirements.recommended }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {modalImageIndex !== null && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-navigation">
            <button className="prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>&#10094;</button>
            <button className="next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>&#10095;</button>
          </div>
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-content" src={modalImageIndex < steamDetails.images.length ? steamDetails.images[modalImageIndex] : images[modalImageIndex - steamDetails.images.length]} alt="Modal" />
        </div>
      )}
    </>
  );
};

export default ProductPage;