import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Room from "./pages/Room.tsx";
import Home from "./pages/Home.tsx";
import SearchForm from './map/SearchForm.jsx';
import SearchDetail from './map/SearchDetail.jsx';
import FindWay from './map/FindWay.jsx';
import GoogleOauth from './login/GoogleLogin.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './login/jwtgoogle.tsx';
import KakaoLogin from './login/KakaoLogin.tsx';
import Stream from './webRTC/Stream.tsx';
import Mypage from "./components/Mypage.jsx"
import SettingModal from './components/SettingModal.jsx';
import BoardList from './pages/TestBoard.tsx';
import { CookiesProvider } from 'react-cookie';
import VideoChat from './webRTC/VideoChat.tsx';
import VideoTest from './webRTC/test.tsx';
import NtoN from './webRTC/test1.tsx';
import Search from "./pages/Search.tsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                path: '/',
                element: <Home />
            },
            {
                path: '/:roomId',
                element: <Room />
            },
            {
                path: "Mypage",
                element: <Mypage />
            },
            {
                path: "/Mypage/:pageId", element: <Mypage/>
            },
            {
                path:"/search",
                element: <Search/>
            }
        ]
    },
    {
        path: "/map",
        element: <SearchForm />,
    },
    {
        path: "/detail",
        element: <SearchDetail />,
    },
    {
        path: "/findway",
        element: <FindWay />,
    },
    {
        path: "/googleLogin",
        element: <GoogleOauth />
    },
    {
        path: "/gOauth",
        element: <GoogleLoginButton />
    },
    {
        path: "video-test",
        element: <Stream />
    },
    {
        path: "/KakaoLogin",
        element: <KakaoLogin />
    },

    // {
    //     path: "/stream/:roomId",
    //     element: <Stream />
    // },
    {
        path: "/test",
        element: <BoardList />
    },
    // {
    //     path: "/video",
    //     element: <VideoChat />
    // },
    // {
    //     path: "/videoTest",
    //     element: <VideoTest />
    // },
    {
        path: "/nton",
        element: <NtoN />
    }
    



])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <CookiesProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <React.StrictMode>
                <RouterProvider router={router} />
            </React.StrictMode>
        </GoogleOAuthProvider>,
    </CookiesProvider>
)
