import './App.css'
import { ToastContainer } from 'react-toastify';
import Header from "./components/Header.tsx";
import {Outlet} from "react-router-dom";

function App() {
  return (
      <>
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
        />
        <Header/>
        <Outlet/>
      </>
  )
}

export default App
