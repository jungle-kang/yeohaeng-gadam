import React, { useRef } from 'react';
import '../index.css';
import GoogleLoginButton from '../login/jwtgoogle';
import KakaoLogin from '../login/KakaoLogin';

const Modal = ({ isOpen, closeModal }) => {
  const modalBackground = useRef();

  if (!isOpen) return null;

  return (
    <div className={'modal-container'} ref={modalBackground} onClick={e => {
      if (e.target === modalBackground.current) {
        closeModal();
      }
    }}>
      <div className={'modal-content'}>
        <div className="mt-5">
          <div className="text-center">
            <button><GoogleLoginButton/></button>
          </div>
          <div className="text-center">
            <button><KakaoLogin/></button>
          </div>
        </div>
        <div>
          <button className={'modal-close-btn'} onClick={closeModal}>
            모달 닫기
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default Modal;
