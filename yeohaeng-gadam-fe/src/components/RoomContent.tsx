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

const RoomContent = ({ roomId, userId, userName, colorId }) => {
  // const {roomId} = useParams<{roomId:string}>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  // const [myColor, setMyColor] = useState(null);

  // liveblocks에 새로운 shape를 추가
  const insertCard = useMutation(({ storage, self, setMyPresence }, data) => {
    const selectedPageId = self.presence.selectedPageId;
    const selectedCardId = self.presence.selectedCardId;
    
    const prevCard = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);

    const x = prevCard ? prevCard.get("x") + 30 : 0;
    const y = prevCard ? prevCard.get("y") + 30 : 0;

    console.log("new card pos: ", x, y);
    
    // 새 카드
    const cardId = nanoid();
    const card = new LiveObject({
      // x: 300,
      // y: 300,
      x: x,
      y: y,
      fill: "rgb(147, 197, 253)",
      cardType: "place",
      placeName: data.place_name,
      placeX: data.x,
      placeY: data.y,
      placeCategory: data.category_name,
      likedUsers: [],
      // likes: 0,
      // text: data.place_name,
      // placeName: memoInputRef.current.value,
      // placeCord: "0,0",
    });
    // console.log("created card at ", x, ", ", y); /////////////
    storage.get("pages").get(selectedPageId).get("cards").set(cardId, card);

    setMyPresence({ selectedCardId: cardId }, { addToHistory: true });
  }, []);

  return (
      <div>
        <div className="flex"
             style={{
               height: "calc(100vh - 88px)",
             }}
        >
          <div className="bg-blue-300 w-3/12 h-full p-2 overflow-scroll overflow-x-hidden"
          >
            <SearchPanel insertCard={insertCard}/>
          </div>
          <div className="flex-col w-7/12 h-full">
            <Whiteboard myUserId={userId} myColorId={colorId} />
          </div>

          <div className="w-2/12 h-full bg-blue-600">
            <div
                className="flex justify-center h-6 bg-blue-50 text-center font-bold text-4l logo-font rounded-lg mt-5 mr-5 ml-5">
              <button
                  onClick={() => setModalOpen(true)}>방 설정
              </button>
            </div>
            <div className="h-5/6 mt-5">
              <Videochat roomId={roomId} myName={userName} myColorId={colorId}/>
            </div>
          </div>
          <SettingModal isOpen={modalOpen} closeModal={() => setModalOpen(false)}/>
        </div>
      </div>

  )
}

export default RoomContent
