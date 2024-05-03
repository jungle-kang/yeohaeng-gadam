import React, { useRef } from 'react';
import '../index.css';
import GoogleLoginButton from '../login/jwtgoogle';
import Home from "../pages/Home.tsx";
import { Navigate, useNavigate } from "react-router-dom";

const SettingModal = ({ isOpen, closeModal }) => {
  const modalBackground = useRef();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className={'modal-container'} ref={modalBackground} onClick={e => {
      if (e.target === modalBackground.current) {
        closeModal();
      }
    }}>
      <div className={'modal-content rounded-lg'}>
        <div>
          <div className="text-center ">
            <button onClick={()=>closeModal()} className=" bg-slate-300 text-center p-2 mt-10 ">메인화면</button>
            <br/>
            <button className="bg-slate-300 text-center p-2 mt-10 ">확정하기</button>
            <br/>            
            <button onClick={()=>navigate("/")} className="bg-slate-300 text-center p-2 mt-10 ">방나가기</button>           
          </div>         
        </div>
        <div>
          <div className='ml-96 mb-96 top-20'>
          
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SettingModal;
