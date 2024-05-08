// import {useParams} from "react-router-dom";
import React, { useState } from "react";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useMutation } from "/liveblocks.config";
import { nanoid } from "nanoid";

// import SearchForm from "../map/SearchForm.jsx";
import SearchPanel from "./SearchPanel.jsx";
import Whiteboard from "../components/Whiteboard.jsx";
import { Navigate, useNavigate } from "react-router-dom";
import SettingModal from "../components/SettingModal.tsx"
import Videochat from "../videochat-proto/Videochat.jsx";
// import VideoChat from "../webRTC/VideoChat.tsx";

const RoomContent = () => {
  // const {roomId} = useParams<{roomId:string}>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // liveblocks에 새로운 shape를 추가
  const insertCard = useMutation(({ storage, self }, data) => {
    const pageId = self.presence.selectedPageId;
    const cardId = nanoid();
    const card = new LiveObject({
      x: 300,
      y: 300,
      fill: "rgb(147, 197, 253)",
      cardType: "place",
      placeName: data.place_name,
      placeX: data.x,
      placeY: data.y,
      likes: 0,
      // text: data.place_name,
      // placeName: memoInputRef.current.value,
      // placeCord: "0,0",
    });
    // console.log("created card at ", x, ", ", y); /////////////
    storage.get("pages").get(pageId).get("cards").set(cardId, card);
    // setMyPresence({ selectedCard: cardId }, { addToHistory: true });
  }, []);

  // const insertCard = useMutation(({ storage, self, setMyPresence }, data) => {
  //   const shapeId = nanoid();
  //   const shape = new LiveObject({
  //     x: 300,
  //     y: 300,
  //     fill: "rgb(147, 197, 253)",
  //     text: data.place_name,
  //     // placeName: data.place_name,
  //     // placeX: data.x,
  //     // placeY: data.y,
  //   });
  //   storage.get("pages").set(shapeId, shape);
  //   setMyPresence({ selectedShape: shapeId }, { addToHistory: true });
  // }, []);

  return (
    <div className="flex"
      style={{
        height: "calc(100vh - 80px)",
      }}
    >
      <div className="bg-blue-300 w-3/12 h-full p-2 overflow-scroll overflow-x-hidden"
      >
        <SearchPanel insertCard={insertCard} />
      </div>
      <div className="flex-col w-7/12 h-full">
        <Whiteboard />
        {/* <div 
      className="  bg-slate-300"
      style={{height: "25%", width: "100%", float: "left"}}
      >       
        <p>여행 확정</p>
      </div> */}
      </div>

      <div className="w-2/12 h-full bg-blue-600">
        <div className="  h-15 bg-blue-50 text-center font-bold text-4xl p-4 logo-font rounded-lg mt-5 mr-5 ml-5">
          <button
            onClick={() => setModalOpen(true)}>설정</button>
        </div>
        <div className="h-5/6 mt-5">
          <Videochat />
        </div>
      </div>

      <SettingModal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />

    </div>
  )
}

export default RoomContent
