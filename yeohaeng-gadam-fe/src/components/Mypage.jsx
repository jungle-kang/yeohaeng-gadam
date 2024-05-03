import React from "react";

export default function Mypage() {
  return (
    <>
    <div className=" bg-amber-300">
      <div className="bg-indigo-200 basis-1/5 font-bold text-4xl p-4 logo-font text-center ml-10 mr-10">
        <h1>마이페이지</h1>
      </div>

      <div
      className="bg-indigo-500 basis-2/5 mt-20 ml-20 mr-20 h-64">
        <h2
        className="text-4xl mt-10 ml-5 ">진행중</h2>
        <div className="text-right">
          <button className="bg-stone-100 mt-20 mr-20 p-8 rounded-md">확인</button>
        </div>
      </div>

      <div
      className="bg-indigo-500 basis-2/5 mt-20 ml-20 mr-20 h-64">
        <h2
        className=" text-4xl mt-10 ml-5">완료</h2>
        <div className="text-right">
          <button className="bg-stone-100 mt-20 mr-20 p-8 rounded-md">확인</button>
        </div>
      </div>
      </div>
    </>
  );
}
