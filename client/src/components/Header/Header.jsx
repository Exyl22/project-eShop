import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import Menus from '../../components/Menus/Menus';
import cart from '../../Source/cart.svg';
import profile from '../../Source/profile.svg';
import axios from 'axios';

function Header() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3002/api/profile', { withCredentials: true });
        setUser(res.data);
        if (res.data.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          return;
        }
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const openLoginForm = () => {
    setIsPanelOpen(false);
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3002/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      setIsAdmin(false);
      navigate('/store');
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">ProjectS</div>
        <div className='menuHead'>
          <Menus />
        </div>
        <div className="actions">
          <button onClick={() => navigate('/cart')}><i className="cart"><img src={cart} alt="cart" /></i></button>
          <div className="panel-wrapper">
            <button onClick={togglePanel}><i className="user"><img src={profile} alt="profile" /></i></button>
            {isPanelOpen && (
              <div className="panel-but">
                {user === null && <button onClick={openLoginForm}>Вход</button>}
                {user && (
                  <>
                    <Link to="/profile"><button>Профиль</button></Link>
                    {isAdmin && <Link to="/admin"><button>Админ</button></Link>}
                    <button onClick={handleLogout}>Выход</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
