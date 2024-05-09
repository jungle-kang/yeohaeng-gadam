// import {useParams} from "react-router-dom";
import React from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useMutation } from "/liveblocks.config";

import RoomContent from "../components/RoomContent";

const API_KEY = import.meta.env.VITE_LIVEBLOCKS_API_PUBLIC;


const client = createClient({
  publicApiKey: API_KEY,
});

const Room = () => {
  const {roomId} = useParams<{roomId:string}>();
  const roomProviderId = "whiteboard-" + roomId

  return (
        <RoomProvider
          id={roomProviderId}
          initialPresence={{
            cursor: null,
            selectedPageId: null,
            selectedCardId: null,
            lineStartCardId: null,
            // selectedShape: null, /////////
            // lineStartShape: null, //////
          }}
          initialStorage={{
            pages: new LiveMap(),
            // cards: new LiveMap(),
            // shapes: new LiveMap(), ///////////
            // lines: new LiveMap(),
          }}
        >
          <RoomContent />
        </RoomProvider>
  )
}

export default Room