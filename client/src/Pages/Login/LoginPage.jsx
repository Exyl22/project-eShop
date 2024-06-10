import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import passwordicon from '../../Source/password.svg';
import usericon from '../../Source/user.svg';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post('http://localhost:3002/api/auth/login', { username, password }, { withCredentials: true });
      if (res.data && res.data.message === 'Login successful') {
        navigate('/profile');
      } else {
        setErrorMessage(res.data.error || "Неверный логин или пароль");
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Ошибка сервера. Попробуйте позже.");
    }
  }

  const handleRegisterClick = () => {
    navigate('/register');
  }

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="form-container">
          <div className="header">
            <div className="text">Авторизация</div>
            <div className="underline"></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="inputs">
              <div className="input">
                <img src={usericon} alt="Login" />
                <input 
                  type="text" 
                  placeholder='Username'
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="input">
                <img src={passwordicon} alt="Password" />
                <input 
                  type="password" 
                  placeholder='Пароль' 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="submit-container">
              <button type="submit" className="submit">Войти</button>
            </div>
            <div className="links-container">
              <div className="register-text">Нет учётной записи? <span className="register-link" onClick={handleRegisterClick}>Регистрация</span></div>
            </div>
          </form>
        </div>
        <div className="image-container">
          <img src="https://i.ytimg.com/vi/SMHS4lXEueY/maxresdefault_live.jpg" alt="Login Illustration" className="auth-image" />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LoginPage;
