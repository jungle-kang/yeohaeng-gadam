// import {useParams} from "react-router-dom";
import React from "react";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useMutation } from "/liveblocks.config";



import RoomContent from "./RoomContent.jsx";


const client = createClient({
  publicApiKey: "pk_dev_D0wfBLYE808M7fX_lLoN_qZ9LaSNWrITw1rZc5ruC63IiaVpIczKB6NG_XCCVFjA",
});

const Room = () => {
  // const {roomId} = useParams<{roomId:string}>();
  

  return (
        <RoomProvider
          id="react-whiteboard-app"
          initialPresence={{
            cursor: null,
            selectedShape: null,
            lineStartShape: null,
          }}
          initialStorage={{
            shapes: new LiveMap(),
            lines: new LiveMap(),
          }}
        >
          <RoomContent />
        </RoomProvider>
  )
}

export default Room