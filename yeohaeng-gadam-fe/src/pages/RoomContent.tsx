// import {useParams} from "react-router-dom";
import React from "react";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useMutation } from "/liveblocks.config";

import SearchForm from "../map/SearchForm";
import Whiteboard from "../components/Whiteboard";

const RoomContent = () => {
  // const {roomId} = useParams<{roomId:string}>();

  // liveblocks에 새로운 shape를 추가
  const insertRectangle = useMutation(({ storage, setMyPresence }, data) => {
    const shapeId = Date.now().toString();
    const shape = new LiveObject({
      x: 300,
      y: 300,
      fill: "rgb(147, 197, 253)",
      placeName: data.place_name,
      placeX: data.x,
      placeY: data.y,
    });
    storage.get("shapes").set(shapeId, shape);
    setMyPresence({ selectedShape: shapeId }, { addToHistory: true });
  }, []);

  return (
    <div className="flex h-screen bg-blue-200">
      <div className="bg-blue-300 h-4/5 w-3/12 p-2 overflow-scroll overflow-x-hidden">
        <SearchForm insertRectangle={insertRectangle} />
      </div>
      <div className="w-7/12 h-4/5">
          <Whiteboard />
      </div>
      {/* <div className="w-2/12 h-4/5 bg-blue-600">
        TODO: 채팅 패널
      </div> */}
    </div>
  )
}

export default RoomContent