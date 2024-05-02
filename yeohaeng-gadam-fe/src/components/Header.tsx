import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import '../index.css';

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
          signIn
        </button>
        <button className="w-1/2 h-full logo-font hover:text-gray-400">
          signUp
        </button>
      </div>
      <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />
    </header>
  );
}
