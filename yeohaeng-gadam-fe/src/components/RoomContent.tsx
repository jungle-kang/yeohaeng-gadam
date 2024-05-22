import React, { useState } from "react";
import { LiveObject } from "@liveblocks/client";
import { useMutation } from "/liveblocks.config";
import { nanoid } from "nanoid";

import SearchPanel from "./SearchPanel.jsx";
import Whiteboard from "../components/Whiteboard.jsx";
import SettingModal from "../components/SettingModal.tsx"
import Videochat from "../videochat/Videochat.jsx";

const RoomContent = ({ roomId, userId, userName, colorId }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // liveblocks에 새로운 shape를 추가
  const insertCard = useMutation(({ storage, self, setMyPresence }, data) => {
    const selectedPageId = self.presence.selectedPageId;
    const selectedCardId = self.presence.selectedCardId;
    
    const prevCard = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);

    const x = prevCard ? prevCard.get("x") + 30 : 0;
    const y = prevCard ? prevCard.get("y") + 30 : 0;
    
    // 새 카드 추가
    const cardId = nanoid();
    const card = new LiveObject({
      x: x,
      y: y,
      fill: "#ffffff",
      cardType: "place",
      placeName: data.place_name,
      placeAddr: data.road_address_name ? data.road_address_name : data.address_name,
      placeCategory: data.category_name,
      placeX: data.x,
      placeY: data.y,
      likedUsers: [],
    });
    storage.get("pages").get(selectedPageId).get("cards").set(cardId, card);

    setMyPresence({ selectedCardId: cardId }, { addToHistory: true });
  }, []);

  return (
        <div className="flex border-t-2"
             style={{
               height: "calc(100vh - 88px)",
             }}
        >
          <div className="bg-white w-3/12 h-full p-2 overflow-scroll overflow-x-hidden "
          >
            <SearchPanel insertCard={insertCard}/>
          </div>
          <div className="flex-col grow h-full">
            <Whiteboard myUserId={userId} myColorId={colorId} />
          </div>

          <div className="pt-3 flex flex-col items-end h-full border-l-2">
            <button
                className="text-xl pb-1 bg-white font-bold w-8 rounded-2xl h-8 hover:bg-gray-300 font-bold mr-2"
                onClick={() => setModalOpen(true)}>⚙️
            </button>
            <div className="h-5/6 mt-2 w-full">
              <Videochat roomId={roomId} myName={userName} myColorId={colorId}/>
            </div>
          </div>
          <SettingModal isOpen={modalOpen} closeModal={() => setModalOpen(false)}/>
        </div>

  )
}

export default RoomContent
