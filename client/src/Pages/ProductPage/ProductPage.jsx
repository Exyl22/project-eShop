import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProductPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const ProductPage = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('description');
    const [steamDetails, setSteamDetails] = useState({ description: '', images: [], tags: [], headerImage: '', pc_requirements: {} });
    const [modalImageIndex, setModalImageIndex] = useState(null);
    const [likeDislikeRatio, setLikeDislikeRatio] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const { productId } = useParams();

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:3002/api/products/${productId}`)
            .then(response => {
                const productData = response.data;
                setProduct(productData);
                setLoading(false);
                if (productData.steamDetails) {
                    setSteamDetails(productData.steamDetails);
                    calculateLikeDislikeRatio(productData.steamDetails);
                }
            })
            .catch(error => {
                console.error('There was an error fetching the product!', error);
                setLoading(false);
            });
    }, [productId]);

    const calculateLikeDislikeRatio = (steamDetails) => {
        const { recommendations_total, recommendations_positive } = steamDetails;
        const positivePercentage = recommendations_total > 0 ? Math.round((recommendations_positive / recommendations_total) * 100) : 0;
        setLikeDislikeRatio({ positive: positivePercentage, negative: 100 - positivePercentage });
    };

    const renderContent = () => {
        if (view === 'description') {
            return (
                <div className="descriptionn center-content">
                    <div dangerouslySetInnerHTML={{ __html: steamDetails.description }} />
                </div>
            );
        } else if (view === 'requirements') {
            return (
                <div className="requirements center-content">
                    <div dangerouslySetInnerHTML={{ __html: steamDetails.pc_requirements?.minimum || 'No minimum requirements available.' }} />
                    <div dangerouslySetInnerHTML={{ __html: steamDetails.pc_requirements?.recommended || 'No recommended requirements available.' }} />
                </div>
            );
        } else {
            return null;
        }
    };

    const handlePrevImage = () => {
        setModalImageIndex((prevIndex) => (prevIndex - 1 + steamDetails.images.length) % steamDetails.images.length);
    };

    const handleNextImage = () => {
        setModalImageIndex((prevIndex) => (prevIndex + 1) % steamDetails.images.length);
    };

    const handleAddToCart = () => {
        axios.post('http://localhost:3002/api/cart', { productId: product.id, quantity: 1 }, { withCredentials: true })
            .then(response => {
                alert('Товар добавлен в корзину');
            })
            .catch(error => {
                console.error('Ошибка при добавлении товара в корзину:', error);
                alert('Ошибка при добавлении товара в корзину');
            });
    };

    const handleAddToFavorites = () => {
        axios.post(`http://localhost:3002/api/favorites/${product.id}`, {}, { withCredentials: true })
            .then(response => {
                alert('Товар добавлен в избранное');
            })
            .catch(error => {
                console.error('Ошибка при добавлении товара в избранное:', error);
                alert('Ошибка при добавлении товара в избранное');
            });
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!product) {
        return <div className="loading">Product not found</div>;
    }

    const visibleImages = Array.isArray(steamDetails.images) ? (showMore ? steamDetails.images : steamDetails.images.slice(0, 3)) : [];

    return (
        <>
            <Header />
            <div className="product-page">
                <button className="back-button" onClick={() => window.history.back()}>Back</button>
                <div className="product-info-container">
                    <div className="main-image-container">
                        <div className="product-name">{product.name}</div>
                        <img className="main-image" src={steamDetails.header_image} alt="Header" />
                        <div className="product-tags">
                            {Array.isArray(steamDetails.tags) && steamDetails.tags.map((tag, index) => (
                                <span key={index} className="product-tag">{tag}</span>
                            ))}
                        </div>
                        <div className="product-price-button-container">
                            <div className="product-price">
                                {product.discount_percent !== null ? (
                                    <>
                                        <span className="original-price">{product.price} руб.</span>
                                        <span className="discounted-price">{(product.price * (1 - product.discount_percent / 100)).toFixed(2)} руб.</span>
                                    </>
                                ) : (
                                    <span className="current-price">{product.price} руб.</span>
                                )}
                            </div>
                            <button className="add-to-cart" onClick={handleAddToCart}>В корзину</button>
                            <button className="add-to-favorites">
                                <i className="fas fa-heart" onClick={handleAddToFavorites}></i>
                            </button>
                        </div>
                    </div>
                    <div className="product-info">
                        <div className="product-images-info">
                            {visibleImages.map((image, index) => (
                                <div key={index} className="image-container-info">
                                    <img className="additional-image-info" src={image} alt={`Screenshot ${index + 1}`} onClick={() => setModalImageIndex(index)} />
                                </div>
                            ))}
                            {Array.isArray(steamDetails.images) && steamDetails.images.length > 3 && (
                                <button className="show-more-button" onClick={() => setShowMore(!showMore)}>
                                    {showMore ? 'Показать меньше' : 'Показать больше'}
                                </button>
                            )}
                            {modalImageIndex !== null && (
                                <div className="modal">
                                    <div className="modal-content">
                                        <button className="prev" onClick={handlePrevImage}>&lt;</button>
                                        <img src={steamDetails.images[modalImageIndex]} alt={`Screenshot ${modalImageIndex + 1}`} />
                                        <button className="next" onClick={handleNextImage}>&gt;</button>
                                    </div>
                                    <span className="close" onClick={() => setModalImageIndex(null)}>&times;</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="tabs">
                    <div className={`tab ${view === 'description' ? 'active' : ''}`} onClick={() => setView('description')}>Описание</div>
                    <div className={`tab ${view === 'requirements' ? 'active' : ''}`} onClick={() => setView('requirements')}>Системные требования</div>
                </div>
                <div className="tab-content">
                    {renderContent()}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductPage;
