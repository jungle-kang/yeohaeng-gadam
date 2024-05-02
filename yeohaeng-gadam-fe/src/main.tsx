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
import Stream from './webRTC/Stream.tsx';

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
        path: "video-chat-room/:roomName",
        element: <Stream />
    }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    </GoogleOAuthProvider>,
)
