import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Roomlist from "./RoomList";

export default function Mypage() {
  const navigate = useNavigate();
  const { pageId } = useParams();

  return (
    <>      
        <div className="bg-indigo-200 basis-1/5 font-bold text-4xl p-4 logo-font text-center ml-96 mr-96 rounded-lg">
          <h1>마이페이지</h1>
        </div>
        <div>
          <button
            className="bg-stone-100 hover:bg-slate-200 active:bg-slate-400 mt-10 mr-10 ml-20 p-4 rounded-lg focus:outline-none focus:ring focus:ring-violet-300"
            onClick={() => navigate('/Mypage/1')}
          >
            진행중
          </button>
          <button
            className="bg-stone-100 hover:bg-slate-200 active:bg-slate-400 p-4 rounded-lg focus:outline-none focus:ring focus:ring-violet-300"
            onClick={() => navigate('/Mypage/2')}
          >
            완료
          </button>
        </div>
            <Roomlist/>
    </>
  );
}
