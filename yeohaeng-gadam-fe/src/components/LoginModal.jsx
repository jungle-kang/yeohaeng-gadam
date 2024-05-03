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
      <div className={'modal-content rounded-lg'}>
        <div>
          <div className="text-center mt-10">
            <button className="text-center mt-10"><GoogleLoginButton/></button>
          
            {/* <button className='mt-20' onClick={closeModal}>
            X
          </button> */}
          
          </div>
          {/* <div className="text-center">
            <button><KakaoLogin/></button>
          </div> */}
        </div>
        <div>
          <div className='ml-96 mb-96 top-20'>
          
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Modal;
