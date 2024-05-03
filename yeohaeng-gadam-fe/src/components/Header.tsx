import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './LoginModal.jsx';
import '../index.css';
import Mypage from './Mypage.jsx'

export default function Header() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <header className="w-full h-20 flex flex-row bg-white mt-2">
      <button
        onClick={() => navigate('/')}
        className="basis-1/5 font-bold text-4xl p-4 logo-font">
        여행가담
      </button>
      <div className="basis-3/5"></div>
      <div className="basis-1/5 h-full flex">
        <button className="w-1/2 h-full logo-font hover:text-gray-400" onClick={() => setModalOpen(true)}>
          로그인
        </button>
        <button 
        onClick={() => navigate('/Mypage')}
        className="w-1/2 h-full logo-font hover:text-gray-400">
          마이페이지
        </button>
      </div>
      <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />
    </header>
  );
}
