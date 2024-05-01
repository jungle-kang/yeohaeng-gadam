import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Room from "./pages/Room.tsx";
import Home from "./pages/Home.tsx";

const router = createBrowserRouter([
    {
        path:'/',
        element:<App/>,
        children: [
            {
                index: true,
                path: '/',
                element: <Home/>
            },
            {
                path: '/:roomId',
                element: <Room/>
            }
        ]
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
