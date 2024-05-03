import React, { useRef } from 'react';
import '../index.css';
import GoogleLoginButton from '../login/jwtgoogle';
import Home from "../pages/Home.tsx";
import { Navigate, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingModal = ({ isOpen, closeModal }) => {
  const modalBackground = useRef();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const { roomId } = useParams(); // URL 파라미터에서 roomId 추출
  const url = `http://localhost:5173/${roomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast('URL이 클립보드에 복사되었습니다!'); // 성공 메시지를 toast로 표시
      })
      .catch(err => {
        console.error('클립보드 복사에 실패했습니다:', err);
        toast.error('클립보드 복사에 실패했습니다!'); // 실패 메시지를 toast로 표시
      });
  };

  return (
    <div className={'modal-container'} ref={modalBackground} onClick={e => {
      if (e.target === modalBackground.current) {
        closeModal();
      }
    }}>
      <div className={'modal-content rounded-lg'}>
        <div>
          <div className='text-center mt-3'>
            <button onClick={copyToClipboard}>링크 복사🔗</button>
          </div>
          <div className="text-center ">
            <button onClick={()=>closeModal()} className="bg-slate-300 text-center p-2 mt-10 rounded-lg">메인화면</button>
            <br/>
            <button className="bg-slate-300 text-center p-2 mt-10 rounded-lg">확정하기</button>
            <br/>            
            <button onClick={()=>navigate("/")} className="bg-slate-300 text-center p-2 mt-10 rounded-lg">방나가기</button>           
          </div>         
        </div>
        <div>
          <div className='ml-96 mb-96 top-20'></div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  );
};

export default SettingModal;
