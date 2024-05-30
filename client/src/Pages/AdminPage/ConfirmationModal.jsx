import React from 'react';

function ConfirmationModal({ onConfirm, onClose }) {
  return (
    <div className="modal">
      <div className="modal-contentt">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить этот товар?</p>
        <button onClick={onConfirm}>Да</button>
        <button onClick={onClose}>Нет</button>
      </div>
    </div>
  );
}

export default ConfirmationModal;
