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
import Mypage from "./pages/Mypage.tsx"
import SettingModal from './components/SettingModal.jsx';
import BoardList from './pages/TestBoard.tsx';
import { CookiesProvider } from 'react-cookie';
import Videochat from './videochat-proto/Videochat.jsx';
import Search from './pages/Search.tsx';


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
                path: "/Mypage/:pageId", element: <Mypage />
            },
            {
                path: "/Search",
                element: <Search />
            }
        ]
    },
    { //////////////
        path: "/map",
        element: <SearchForm />,
    },
    { //////////////
        path: "/detail",
        element: <SearchDetail />,
    },
    { //////////////
        path: "/findway",
        element: <FindWay />,
    },
    { //////////////
        path: "/googleLogin",
        element: <GoogleOauth />
    },
    { //////////////
        path: "/gOauth",
        element: <GoogleLoginButton />
    },
    { //////////////
        path: "/KakaoLogin",
        element: <KakaoLogin />
    },
    {
        path: "/test",
        element: <BoardList />
    },

    {
        path: "/zoom",
        element: <Videochat />
    }




])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <CookiesProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {/* <React.StrictMode> */}
            <RouterProvider router={router} />
            {/* </React.StrictMode> */}
        </GoogleOAuthProvider>
    </CookiesProvider>
)
