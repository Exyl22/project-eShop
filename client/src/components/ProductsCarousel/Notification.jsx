import React from 'react';
import './Notification.css';

const Notification = ({ message }) => {
  return (
    <div className="notification-fav">
      <p>{message}</p>
    </div>
  );
};

export default Notification;