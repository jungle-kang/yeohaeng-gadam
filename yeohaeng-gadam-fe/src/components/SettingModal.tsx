import React, { useRef } from 'react';
import '../index.css';
import GoogleLoginButton from '../login/jwtgoogle';
import Home from "../pages/Home.tsx";
import { Navigate, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCookie } from "../pages/TestBoard.tsx";
import { jwtDecode } from "jwt-decode";

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
      toast.error('로그인이 필요합니다.');
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

  // <ToastContainer
  // position="top-center"
  // autoClose={1500}
  // hideProgressBar={false}
  // newestOnTop={false}
  // closeOnClick
  // rtl={false}
  // pauseOnFocusLoss
  // draggable
  // pauseOnHover
  // theme="light"
  // // transition="bounce"
// />

// toast.success('방에서 성공적으로 나왔습니다!', {
//   position: "top-center",
//   autoClose: 1500,
//   hideProgressBar: false,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
//   theme: "light",
//   transition: "bounce"
// });


  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast('URL이 클립보드에 복사되었습니다!', {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }); // 성공 메시지를 toast로 표시
      })
      .catch(err => {
        console.error('클립보드 복사에 실패했습니다:', err);
        toast.error('클립보드 복사에 실패했습니다!', {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }); // 실패 메시지를 toast로 표시
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
            <button onClick={() => closeModal()} className="bg-slate-300 text-center p-2 mt-10 rounded-lg">메인화면</button>
            <br />
            <button className="bg-slate-300 text-center p-2 mt-10 rounded-lg">확정하기</button>
            <br />
            <button onClick={() => handleRoomExit()} className="bg-slate-300 text-center p-2 mt-10 rounded-lg">방나가기</button>
          </div>
        </div>
        <div>
          <div className='ml-96 mb-96 top-20'></div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  );
};

export default SettingModal;
