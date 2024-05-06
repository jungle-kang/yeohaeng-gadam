import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  // publicApiKey: "pk_dev_D0wfBLYE808M7fX_lLoN_qZ9LaSNWrITw1rZc5ruC63IiaVpIczKB6NG_XCCVFjA",
  publicApiKey: "pk_prod_9M_WTfouoMxktBHjkUipC0ifJR18-GHvJ0tQi1Z3SeeRHvXtZnfsdS64WpyxQcsg",
});

export const {
  RoomProvider,
  useOthers,
  useMyPresence,
  useStorage,
  useMutation,
  useSelf,
  useBroadcastEvent,
  useEventListener,
  useHistory,
} = createRoomContext(client);