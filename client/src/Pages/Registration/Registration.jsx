import React, { useState } from 'react';
import './Registration.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import passwordicon from '../../Source/password.svg';
import usericon from '../../Source/user.svg';
import emailicon from '../../Source/email.svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post('http://localhost:3002/api/auth/register', { username, email, password }, { withCredentials: true });
      if (res.data && res.data.message === 'Регистрация успешна') {
        navigate('/login');
      } else {
        setErrorMessage(res.data.error);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setErrorMessage("Имя пользователя или адрес электронной почты уже используются.");
      } else {
        console.log(err);
        setErrorMessage("Ошибка сервера. Попробуйте позже.");
      }
    }
  }

  return (
    <>
      <Header />
      <div className="register-container">
        <div className="image-container">
          <img src="https://www.fonstola.ru/images/201503/fonstola.ru_169889.jpg" alt="Register Illustration" className="auth-image" />
        </div>
        <div className="form-container">
          <div className="header">
            <div className="text">Регистрация</div>
            <div className="underline"></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="inputs">
              <div className="input">
                <img src={usericon} alt="Username" />
                <input 
                  type="text" 
                  placeholder='Логин' 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="input">
                <img src={emailicon} alt="Email" />
                <input 
                  type="email" 
                  placeholder='Email' 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
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
              <button type="submit" className="submit">Зарегистрироваться</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RegisterPage;
