import React, { useState } from 'react';
import './LoginPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import passwordicon from '../../Source/password.svg';
import user from '../../Source/user.svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [username, setUsername] = useState(""); // изменено на username
  const [password, setPassword] = useState(""); 
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const res = await axios.post('http://localhost:3002/api/login', { username, password }, { withCredentials: true }); // изменено на username
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
      <div className='container'>
        <div className="header">
          <div className="text">Вход</div>
          <div className="underline"></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="inputs">
            <div className="input">
              <img src={user} alt="Login" />
              <input 
                type="text" 
                placeholder='Username' // изменено на Username
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
      <Footer />
    </>
  );
}

export default LoginPage;
