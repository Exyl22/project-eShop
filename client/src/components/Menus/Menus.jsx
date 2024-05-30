import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Menus.css';

function Menus() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [activeTabPosition, setActiveTabPosition] = useState(0);

  useEffect(() => {
    setActiveTab(determineActiveTab());
    setActiveTabPosition(getActiveTabPosition());
  }, [location.pathname]);

  const determineActiveTab = () => {
    const path = location.pathname;
    switch (path) {
      case '/store':
        return 'Магазин';
      case '/library':
        return 'Библиотека';
      case '/agreement':
        return 'Соглашение';
      case '/support':
        return 'Поддержка';
      default:
        return '';
    }
  };

  const getActiveTabPosition = () => {
    switch (activeTab) {
      case 'Магазин':
        return 0;
      case 'Библиотека':
        return 1;
      case 'Соглашение':
        return 2;
      case 'Поддержка':
        return 3;
      default:
        return 0;
    }
  };

  const handleTabClick = (tab, position) => {
    setActiveTab(tab);
    setActiveTabPosition(position);
  };

  return (
    <div className="menus">
      <Link to="/store" className={activeTab === 'Магазин' ? 'active' : ''} onClick={() => handleTabClick('Магазин', 0)}>
        Магазин
      </Link>
      <Link to="/library" className={activeTab === 'Библиотека' ? 'active' : ''} onClick={() => handleTabClick('Библиотека', 1)}>
        Библиотека
      </Link>
      <Link to="/agreement" className={activeTab === 'Соглашение' ? 'active' : ''} onClick={() => handleTabClick('Соглашение', 2)}>
        Соглашение
      </Link>
      <Link to="/support" className={activeTab === 'Поддержка' ? 'active' : ''} onClick={() => handleTabClick('Поддержка', 3)}>
        Поддержка
      </Link>
    </div>
  );
}

export default Menus;
