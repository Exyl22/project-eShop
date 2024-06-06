import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainPage from './Pages/Main/MainPage';
import LibraryPage from './Pages/Library/LibraryPage';
import AgreementPage from './Pages/Agreement/AgreementPage';
import SupportPage from './Pages/Support/SupportPage';
import './App.css';
import ProductPage from './Pages/ProductPage/ProductPage';
import LoginPage from './Pages/Login/LoginPage';
import RegisterPage from './Pages/Registration/Registration';
import AdminPage from './Pages/AdminPage/AdminPage';
import ScrollToTopButton from './components/ScrollTopButton/ScrollTopButton';
import AllProductsPage from './Pages/AllProductsPage/AllProductsPage';
import ProfilePage from './Pages/ProfilePage/ProfilePage';
import CategoryCarousel from './components/CategoryCarousel/CategoryCarousel';
import CartPage from './Pages/CartPage/CartPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/store" />} />
        <Route path="/store" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage/>} />
        <Route path="/all-products" element={<AllProductsPage/>} />
        <Route path="/" component={<CategoryCarousel/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/register' element={<RegisterPage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/cart" element={<CartPage/>} />
        <Route path="/products/:productId" element={<ProductPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/agreement" element={<AgreementPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
      <ScrollToTopButton/>
    </Router>
  );
}

export default App;
