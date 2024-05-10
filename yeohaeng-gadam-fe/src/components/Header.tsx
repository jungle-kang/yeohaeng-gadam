import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

import '../index.css';
import {getCookie} from "../pages/TestBoard.tsx";
import {jwtDecode} from "jwt-decode";
import { googleLogout } from '@react-oauth/google';
import { removeCookie } from '../pages/TestBoard.tsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Header() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(()=>{
      const accessToken:string = getCookie('access_token')? getCookie('access_token'):'' ;
      let id = '';
      // @ts-ignore
      if(accessToken!== '') {
          id = jwtDecode(accessToken).id;
      }
      const meCheck = async () =>{
          try{
              const response = await fetch(`/api/auth/me/${id}`,{
                  method: 'GET',
                  credentials: 'include',
              }).then(res=>res.json())
              if(response.data) {
                  setIsLogin(true);
              }
          }catch(e){
              console.log(e);
          }
      }
      if (accessToken){
          meCheck();
      }

  },[setIsLogin])

  const logout = async () => {
    try {
        // await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        googleLogout();
        removeCookie('access_token');
        setIsLogin(false);
        toast.success("로그아웃에 성공했습니다😁")
        navigate('/');
    } catch (error) {
        console.error('Logout failed:', error);
        toast.error('로그아웃 실패😭');
    }
};

  return (
    <header className="w-full h-20 flex flex-row bg-white mt-2">
      <ToastContainer
position="top-center"
autoClose={1500}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
// transition: Bounce,
/>
      <button
        onClick={() => navigate('/')}
        className="basis-1/5 font-bold text-4xl p-4 logo-font">
        여행가담
      </button>
      <div className="basis-3/5"></div>
      <div className="basis-1/5 h-full flex">
       {/* 주석처리 */}
          {isLogin ? (
            <button className="w-1/2 h-full logo-font hover:text-gray-400" onClick={logout}>
                로그아웃
            </button>
        ) : (
            <button className="w-1/2 h-full logo-font hover:text-gray-400" onClick={() => window.location.href = '/api/auth/google'}>
                로그인
            </button>
        )}

          <button
              onClick={() => navigate('/Mypage')}
              className="w-1/2 h-full logo-font hover:text-gray-400">
              마이페이지
        </button>
      </div>
    </header>
  );
}
