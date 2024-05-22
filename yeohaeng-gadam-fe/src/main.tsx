
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Room from "./pages/Room.tsx";
import Home from "./pages/Home.tsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Mypage from "./pages/Mypage.tsx"
import { CookiesProvider } from 'react-cookie';
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
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <CookiesProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <RouterProvider router={router} />
        </GoogleOAuthProvider>
    </CookiesProvider>
)
