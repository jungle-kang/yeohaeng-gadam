import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from "../pages/TestBoard.tsx";
import { jwtDecode } from "jwt-decode";
import { googleLogout } from '@react-oauth/google';
import { removeCookie } from '../pages/TestBoard.tsx';
import { toast } from "react-toastify";

export default function Header() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const accessToken: string = getCookie('access_token') ? getCookie('access_token') : '';
    let id = '';
    if (accessToken !== '') {
      // @ts-ignore
      id = jwtDecode(accessToken).id;
    }
    const meCheck = async () => {
      try {
        const response = await fetch(`/api/auth/me/${id}`, {
          method: 'GET',
          credentials: 'include',
        }).then(res => res.json());
        if (response.data) {
          setIsLogin(true);
        }
      } catch (e) {
        console.log(e);
      }
    };
    if (accessToken) {
      meCheck();
    }
  }, [setIsLogin]);

  const logout = async () => {
    
    try {
      googleLogout();
      removeCookie('access_token');
      setIsLogin(false);
      toast.success("로그아웃에 성공했습니다😁");
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('로그아웃 실패😭');
    }
  };

  const login = async () => {
    try {
      localStorage.setItem('loginAttempt', 'true');
      toast.success('로그인 시도 중');
      setTimeout(() => {
        window.location.href = '/api/auth/google';
      }, 1000);
    } catch (error) {
      toast.error('로그인에 실패했습니다.');
    }
  };

  useEffect(() => {
    const loginAttempt = localStorage.getItem('loginAttempt');
    const accessToken = getCookie('access_token') ? getCookie('access_token') : '';

    if (loginAttempt && accessToken) {
      toast.success('로그인에 성공했습니다!');
      localStorage.removeItem('loginAttempt');
    } else if (loginAttempt) {
      toast.error('로그인에 실패했습니다.');
      localStorage.removeItem('loginAttempt');
    }
  }, []);

  return (
    <header className="w-full px-4 sm:px-4 md:px-16 h-20 flex flex-row bg-white mt-2">
      <button
        onClick={() => navigate('/')}
        className="h-full basis-1/5 font-bold pb-1 logo-font text-logo whitespace-nowrap">
        여행가담
      </button>

      <div className="basis-3/5"></div>
      <div className="basis-1/5 h-full flex">
        {isLogin ? (
          <button
            className="w-1/2 h-full nanumbarungothic hover:text-gray-400 text-menu whitespace-nowrap"
            onClick={logout}>
            로그아웃
          </button>
        ) : (
          <button
            className="w-1/2 h-full nanumbarungothic hover:text-gray-400 text-menu whitespace-nowrap"
            onClick={login}>
            로그인
          </button>
        )}
        <button
          onClick={() => navigate('/Mypage')}
          className="w-1/2 h-full nanumbarungothic hover:text-gray-400 text-menu whitespace-nowrap">
          마이페이지
        </button>
      </div>
    </header>
  );
}
