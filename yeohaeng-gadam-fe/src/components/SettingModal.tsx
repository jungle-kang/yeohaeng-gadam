import React, { useRef } from 'react';
import '../index.css';
import GoogleLoginButton from '../login/jwtgoogle';
import Home from "../pages/Home.tsx";
import { Navigate, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCookie } from "../pages/TestBoard.tsx";
import {jwtDecode} from "jwt-decode"; // jwtDecode import 수정

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const SettingModal = ({ isOpen, closeModal, onExitSucess }) => {
  const modalBackground = useRef();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const { roomId } = useParams(); // URL 파라미터에서 roomId 추출
  const url = `${FRONTEND_URL}${roomId}`;

  const handleRoomExit = async () => {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      toast.error('로그인이 필요합니다😣');
      navigate('/');
      return;
    }
    const userId = jwtDecode(accessToken).id;

    try {
      const response = await fetch(`/api/room/exit?room_id=${roomId}&user_id=${userId}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.statusMsg);
        navigate('/'); // Redirect to home after exit
      } else {
        toast.error(result.statusMsg);
      }
    } catch (error) {
      console.error('Exit failed:', error);
      toast.error('방 나가기 실패');
    }
    onExitSucess();
    closeModal();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('URL이 클립보드에 복사되었습니다!🔗');
      })
      .catch(err => {
        toast.error('클립보드 복사에 실패했습니다!');
      });
  };

  return (
    <div className={'modal-container'}
      style={{ position: "absolute", zIndex: 20000 }}
      ref={modalBackground}
      onClick={e => {
        if (e.target === modalBackground.current) {
          closeModal();
        }
      }}>
      <div className='modal-content rounded-lg'>
        <div>
          <div className='text-center mt-3'>
            <button onClick={copyToClipboard}>링크 복사🔗</button>
          </div>
          <div className="text-center ">
            <button onClick={() => closeModal()} className="mt-10 ml-48 nanumbarungothic font-bold h-full text-center block w-1/5 rounded-md border-0 py-1.5 px-auto text-white hover:bg-blue-800  bg-blue-600">메인화면</button>
            <br />
            <button className=" ml-48 nanumbarungothic font-bold h-full text-center block w-1/5 rounded-md border-0 py-1.5 px-auto text-white hover:bg-blue-800  bg-blue-600">확정하기</button>
            <br />
            <button onClick={() => handleRoomExit()} className=" ml-48 nanumbarungothic font-bold h-full text-center block w-1/5 rounded-md border-0 py-1.5 px-auto text-white hover:bg-blue-800  bg-blue-600">방나가기</button>
          </div>
        </div>
        <div>
          <div className='ml-96 mb-96 top-20'></div>
        </div>
      </div>
    </div>
  );
};

export default SettingModal;
