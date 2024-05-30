import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import StoreSlider from '../../components/StoreSlider/StoreSlider';
import CategoryCarousel from '../../components/CategoryCarousel/CategoryCarousel';
import AllProducts from '../../components/AllProducts/AllProducts';
import ProductsCarousel from '../../components/ProductsCarousel/ProductsCarousel';

function MainPage() {

  return (
    <div>
      <Header />
      <StoreSlider />
      <CategoryCarousel/>
      <ProductsCarousel/>
      <AllProducts/>
      <Footer />
    </div>
  );
}

export default MainPage;
