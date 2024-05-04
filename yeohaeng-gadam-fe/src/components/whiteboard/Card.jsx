import {
  useMutation,
  useSelf,
  useOthers,
} from "/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";


//////////////////////////// 카드 편집 ////////////////////////////
export const insertCard = useMutation(({ storage }, pageId, x, y) => {
  const cardId = nanoid();
  const card = new LiveObject({
    x: x,
    y: y,
    fill: "rgb(147, 197, 253)",
    text: "HELLO"
    // placeName: memoInputRef.current.value,
    // placeCord: "0,0",
  });
  // console.log("created card at ", x, ", ", y); /////////////
  storage.get("pages").get(pageId).get("cards").set(cardId, card);
  // setMyPresence({ selectedCard: cardId }, { addToHistory: true });
}, []);

export const moveCard = useMutation(({ storage }, pageId, cardId, dx, dy) => {
  const card = storage.get("pages").get(pageId).get("cards").get(cardId);
  card.update({
    x: card.get("x") + dx,
    y: card.get("y") + dy,
  });
}, []);

export const deleteCard = useMutation(({ storage, self, setMyPresence }, pageId, cardId) => {
  storage.get("pages").get(pageId).get("cards").delete(cardId);
}, []);


//////////////////////////// 카드 동작 ////////////////////////////

export const onCardPointerDown = (e, cardId) => {
  // console.log("onCardPointerDown: cardId = ", cardId); ///////////
  history.pause();
  e.stopPropagation();
  setDraggingCardId(cardId);
  updateMyPresence({ selectedCardId: cardId });
};

export default function Card({ id, card, x, y, zoom, onPointerDown }) {
  // const { fill } = useStorage((root) => root.pages.get(pageId).cards.get(id)) ?? {};

  // const selectedAsLineStart = useSelf((me) => me.presence.lineStartShape === id);
  const selectedByMe = useSelf((me) => me.presence.selectedCardId === id);
  const selectedByOthers = useOthers((others) =>
    others.some((other) => other.presence.selectedCardId === id)
  );

  const selectionColor = selectedByMe
    ? "blue"
    : selectedByOthers
      ? "green"
      : "transparent";

  // const selectionColor = selectedAsLineStart
  //   ? "gold"
  //   : selectedByMe
  //     ? "blue"
  //     : selectedByOthers
  //       ? "green"
  //       : "transparent";

  return (
    <div className="absolute flex flex-col items-center rounded-lg w-[175px] h-[100px]"
      style={{
        borderWidth: "3px",
        zIndex: "5000",
        ///////////////////////
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zoom}, ${zoom})`,
        borderColor: selectionColor,
        backgroundColor: card.fill,
      }}
      onPointerDown={(e) => onPointerDown(e, id)}
    >
      {card.text}
    </div>
  );
}