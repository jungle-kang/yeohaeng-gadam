import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

import Modal from './LoginModal.jsx';
import '../index.css';
import {getCookie} from "../pages/TestBoard.tsx";
import {jwtDecode} from "jwt-decode";


export default function Header() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(()=>{
      const accessToken = getCookie('access_token');
      const id = jwtDecode(accessToken).id;
      console.log(isLogin);
      const meCheck = async () =>{
          try{
              const response = await fetch(`/api/auth/me/${id}`,{
                  method: 'GET',
                  credentials: 'include',
              }).then(res=>res.json())
              console.log(response.data);
              setIsLogin(true);
              console.log(isLogin);
          }catch(e){
              console.log(e);
          }
      }
      if (accessToken){
          meCheck();
      }

  },[setIsLogin])

  return (
    <header className="w-full h-20 flex flex-row bg-white mt-2">
      <button
        onClick={() => navigate('/')}
        className="basis-1/5 font-bold text-4xl p-4 logo-font">
        여행가담
      </button>
      <div className="basis-3/5"></div>
      <div className="basis-1/5 h-full flex">
        {/* <button className="w-1/2 h-full logo-font hover:text-gray-400" onClick={() => setModalOpen(true)}> */}
          {isLogin? (
              <button className="w-1/2 h-full logo-font hover:text-gray-400" onClick={() => window.location.href = '/api/auth/google'}>
              로그아웃
          </button>): (
              <button className="w-1/2 h-full logo-font hover:text-gray-400"
                               onClick={() => window.location.href = '/api/auth/google'}>
              로그인
          </button>)}

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
