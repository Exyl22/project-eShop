// src/Footer/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className='footer-content'>
        <div className="logo-soc">
          <div className="logo">ProjectS</div>
          <div className="social-buttons">
            <a href="/" className="social-button"><i className="fab fa-facebook-f"></i></a>
            <a href="/" className="social-button"><i className="fab fa-twitter"></i></a>
            <a href="/" className="social-button"><i className="fab fa-instagram"></i></a>
            <a href="/" className="social-button"><i className="fab fa-linkedin-in"></i></a>
          </div>
          <div className="copyright">
            Copyright 2024 © ProjectS
          </div>
        </div>
        <div className="menu-policy-wrapper">
        <div className="menu">
          <a href="/">Магазин</a>
          <a href="/">Каталог</a>
          <a href="/">Библиотека</a>
          <a href="/">Часто задаваемые вопросы</a>
          <a href="/">Поддержка</a>
          <a href="/">emailShop@projectS.ru</a>
        </div>
        <div className="policy">
          <a href="/">Пользовательское соглашение</a>
          <a href="/">Политика конфиденциальности</a>
        </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;