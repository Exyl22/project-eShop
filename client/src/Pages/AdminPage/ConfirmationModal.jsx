// ConfirmationModal.js

import React from 'react';
import './ConfirmationModal.css';

function ConfirmationModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay-adm">
      <div className="modal-content-adm">
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить этот продукт?</p>
        <div className="modal-actions-adm">
          <button onClick={onClose}>Отмена</button>
          <button onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;