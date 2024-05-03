import { useState, useEffect, useRef } from "react";
import {
  useStorage,
  useMutation,
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "/liveblocks.config";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { shallow } from "@liveblocks/react";
import { nanoid } from "nanoid";

import Cursor from "./Cursor";



export default function Whiteboard() {
  // 클라이언트가 현재 사용중인 페이지의 ID
  const [curPageId, setCurPageId] = useState(null);
  // 클라이언트가 현재 이름 변경중인 페이지의 ID
  const [renamingPageId, setRenamingPageId] = useState(null);
  // 핑 이벤트가 발생한 탭의 리스트
  const [pingedPageList, setPingedPageList] = useState([]);


  //////////////////////////// 페이지 storage 관련 ////////////////////////////

  // 페이지 탭에서 사용할 페이지 ID 배열
  const pageIds = useStorage(
    (root) => Array.from(root.pages.keys()),
    shallow
  );

  // 페이지 추가
  const createPage = useMutation(({ storage }) => {
    const pageId = nanoid();
    const newPage = new LiveObject({
      name: "새 보드",
      cards: new LiveMap(),
      lines: new LiveMap(),
    });
    storage.get("pages").set(pageId, newPage);

    return pageId;
  }, []);

  // 페이지 삭제
  const deletePage = useMutation(({ storage }, pageId) => {
    storage.get("pages").delete(pageId);
  }, []);

  // 페이지 이름 수정
  const updatePage = useMutation(({ storage }, pageId, newName) => {
    storage.get("pages").get(pageId).update({
      name: newName,
    });
  }, []);



  //////////////////////////// 버튼 동작 관련 ////////////////////////////

  // 새 탭 버튼
  const onClickNewTab = () => {
    // 새 페이지 생성
    const newPageId = createPage();
    // 새로운 페이지를 현재 탭으로
    setCurPageId(newPageId);
  };

  // 탭 버튼
  const onClickTab = (e, pageId) => {
    if (pageId === curPageId) {
      setRenamingPageId(pageId);
    } else {
      setCurPageId(pageId);
      setPingedPageList(pingedPageList.filter((id) => (pageId !== id)));
    }
  };

  // 탭 이름 변경
  const onChangeTabRename = (e, pageId) => {
    updatePage(pageId, e.target.value);
  };

  // const onBlurTabRename = (e) => {
  //   console.log("hi");
  // };

  // 탭 이름 변경 완료
  const onKeyDownTabRename = (e) => {
    if (e.key === "Enter") {
      setRenamingPageId(null);
    }
  }

  // 탭 삭제 버튼
  const onClickTabRemoveBtn = (pageId, i) => {
    if (pageId === curPageId) {
      // 현재 탭을 삭제하면 다른 탭으로 이동
      const newId = pageIds.length === 1
        ? null
        : i === pageIds.length - 1
          ? pageIds[pageIds.length - 2]
          : pageIds[i + 1];

      setCurPageId(newId);
    }
    deletePage(pageId);
  };

  //////////////////////////// 핑 이벤트 관련 ////////////////////////////

  useEventListener(({ event, user, connectionId }) => {
    if (event.type === "PING") {
      console.log(event, user, connectionId); //////////////

      if (event.pageId !== curPageId && !pingedPageList.includes(event.pageId)) {
        setPingedPageList([...pingedPageList, event.pageId]);
        console.log("pinged list: ", pingedPageList); /////////////
      }
    }
  });




  // liveblocks가 로딩되었는지 확인용
  const pages = useStorage((root) => root.pages);
  // console.log(pages); ////////


  useEffect(() => {
    // 로딩 완료 시 첫 탭을 현재 탭으로
    if (pages != null) {
      setCurPageId(pageIds[0]);
    }
  }, [pages == null])



  // 로딩중 표시
  if (pages == null) {
    return <div className="flex justify-center items-center w-full h-full">Loading</div>;
  }



  return (
    <>
      <div className="w-full h-8 flex">
        {pageIds.map((pageId, i) => {
          const tabColor = pageId === curPageId
            ? "green"
            : pingedPageList.includes(pageId)
              ? "yellow"
              : "grey";

          return (
            <div className="flex w-1/6 border-black border-2"
              key={pageId}
            >
              <button className="w-full h-full"
                style={{ backgroundColor: tabColor }}
                onClick={(e) => onClickTab(e, pageId)}
              >
                {pageId === renamingPageId
                  ? <textarea
                    className="resize-none w-full h-full"
                    // value={pages.get(pageId).name}
                    autoFocus
                    onChange={(e) => onChangeTabRename(e, pageId)}
                    // onBlur={(e) => onBlurTabRename(e)}
                    onKeyDown={(e) => onKeyDownTabRename(e)}
                  />
                  : pages.get(pageId).name}
              </button>
              <button className="bg-red-300"
                onClick={() => onClickTabRemoveBtn(pageId, i)}
              >
                X
              </button>
            </div>
          );
        })}
        <button className="bg-green-100 border-black border-2"
          onClick={onClickNewTab}
        >
          new
        </button>
      </div>
      {curPageId ? <Canvas pageId={curPageId} /> : <div>No page selected</div>}
    </>
  );
}

////////////////////////// 쪼개기

// 캔버스
function Canvas({ pageId }) {
  const canvasRef = useRef(null);
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 }); // 좌상단의 캔버스 좌표
  const [canvasZoomLevel, setCanvasZoomLevel] = useState(3);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

  // const page = useStorage((root) => root.pages.get(pageId));

  //////////////////////////// 커서 공유 관련 ////////////////////////////
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // 다른 이용자들의 커서 표시
  const othersCursorList = others.map(({ connectionId, presence }) => {
    // 커서가 없다면 표시하지 않기
    if (presence.cursor === null) {
      return null;
    }

    // 커서가 캔버스 밖에 있다면 표시하지 않기
    if (!isInsideCanvas(presence.cursor.x, presence.cursor.y, 0, 0)) {
      return null;
    }

    // 이용자의 캔버스 위치와 줌 배율을 기반으로 계산한 캔버스 상의 위치
    const x = (presence.cursor.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y = (presence.cursor.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

    return (
      <Cursor
        key={`cursor-${connectionId}`}
        // connectionId is an integer that is incremented at every new connections
        // Assigning a color with a modulo makes sure that a specific user has the same colors on every clients
        color={COLORS[connectionId % COLORS.length]}
        x={x}
        y={y}
      />
    );
  })

  const updateMyCursor = useMutation(({ setMyPresence }, x, y) => {
    setMyPresence({ cursor: { x, y } });
  }, []);

  //////////////////////////// 핑 이벤트 관련 ////////////////////////////
  const broadcast = useBroadcastEvent();

  const onClickPingBtn = () => {
    broadcast({ type: "PING", pageId: pageId, canvasX: 0, canvasY: 0 });
  };

  //////////////////////////// 버튼 및 캔버스 동작 관련 ////////////////////////////
  const onCanvasPointerDown = () => {
    // console.log(isDraggingCanvas); ////////////
    setIsDraggingCanvas(true);
  };

  // const onCanvasPointerMove = useMutation(({ setMyPresence, self }, e) => {
  const onCanvasPointerMove = (e) => {
    const dx = e.movementX / ZOOMS[canvasZoomLevel];
    const dy = e.movementY / ZOOMS[canvasZoomLevel];

    if (isDraggingCanvas) {
      // 캔버스를 움직임
      setCanvasPos({
        x: canvasPos.x - dx,
        y: canvasPos.y - dy,
      });
    } else {
      // 커서만 움직이거나 카드를 움직임
      updateMyCursor(
        Math.round(canvasPos.x + e.nativeEvent.offsetX / ZOOMS[canvasZoomLevel]),
        Math.round(canvasPos.y + e.nativeEvent.offsetY / ZOOMS[canvasZoomLevel])
      );
    }
    // }, []);
  };

  // const onCanvasPointerMove = (e) => {
  //   // const dx = 


  //   console.log(e); ////////////
  //   updateMyCursor(
  //     canvasPos.x + Math.round(e.nativeEvent.offsetX / canvasZoom),
  //     canvasPos.y + Math.round(e.nativeEvent.offsetY / canvasZoom)
  //   );
  // };

  const onCanvasPointerUp = () => {
    // console.log(canvasRef.current.offsetWidth); //////////
    // console.log(canvasRef.current.offsetHeight); //////////
    setIsDraggingCanvas(false);
  };

  const zoomOut = () => {
    if (canvasZoomLevel > 0) {
      setCanvasZoomLevel(canvasZoomLevel - 1);
    }
  }

  const zoomIn = () => {
    if (canvasZoomLevel < ZOOMS.length - 1) {
      setCanvasZoomLevel(canvasZoomLevel + 1);
    }
  }


  //////////////////////////// 카드 편집 ////////////////////////////
  const cardIds = useStorage(
    (root) => Array.from(root.pages.get(pageId).cards.keys()),
    shallow
  );

  const cards = useStorage((root) => root.pages.get(pageId).cards);

  const cardList = cardIds.map((cardId) => {
    // const { cardX, cardY } = useStorage((root) => root.cards.get(cardId));
    const card = cards.get(cardId);
    if (!isInsideCanvas(card.x, card.y, 0, 0)) {
      return null;
    }

    const x = (card.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y = (card.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

    return (
      <Card
        key={cardId}
        card={card}
        x={x}
        y={y}
        zoom={ZOOMS[canvasZoomLevel]}
      />
    );
    // shapeIds.map((shapeId) => {
    //   return (
    //     <Rectangle
    //       key={shapeId}
    //       id={shapeId}
    //       onShapePointerDown={onShapePointerDown}
    //       onLineButtonDown={onLineButtonDown}
    //       updateMemo={updateMemo}
    //     />
    //   );
    // })
  });

  const insertCard = useMutation(({ storage, setMyPresence }, x, y) => {
    const cardId = nanoid();
    const card = new LiveObject({
      x: x,
      y: y,
      fill: "rgb(147, 197, 253)",
      // text: memoInputRef.current.value,
      // placeName: memoInputRef.current.value,
      // placeCord: "0,0",
    });
    console.log("created card at ", x , ", ", y); /////////////
    storage.get("pages").get(pageId).get("cards").set(cardId, card);
    // setMyPresence({ selectedCard: cardId }, { addToHistory: true });
  }, []);

  const deleteCard = useMutation(({ storage, self, setMyPresence }, cardId) => {
    storage.get("pages").get(pageId).get("cards").delete(cardId);


    // const shapeId = self.presence.selectedShape;
    // if (!shapeId) {
    //   return;
    // }

    // const lineIdList = Array.from(storage.get("lines").keys());

    // lineIdList.map((lineId) => {
    //   const curLine = storage.get("lines").get(lineId);
    //   if (curLine.get("shape1Id") === shapeId || curLine.get("shape2Id") === shapeId) {
    //     deleteLine(lineId);
    //   }
    // });

    // setMyPresence({ selectedShape: null });
    // if (selectedShape === self.presence.lineStartShape) {
    //   setMyPresence({ lineStartShape: null });
    // }
  }, []);

  //////////////////////////// HELPERS ////////////////////////////

  // x, y위치에 있는 물체가 캔버스 내부에 있는지 여부 반환
  // bufX, bufY만큼의 여유를 줌
  function isInsideCanvas(x, y, bufX, bufY) {
    return (
      canvasRef.current
      && x > canvasPos.x - bufX
      && x < canvasPos.x + canvasRef.current.offsetWidth / ZOOMS[canvasZoomLevel] + bufX
      && y > canvasPos.y - bufY
      && y < canvasPos.y + canvasRef.current.offsetHeight / ZOOMS[canvasZoomLevel] + bufY
    );
  }


  return (
    <div className="bg-yellow-100 w-full h-full"
      ref={canvasRef}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerLeave={() =>
        // When the pointer goes out, set cursor to null
        updateMyPresence({
          cursor: null,
        })
      }
    >
      {othersCursorList}
      {cardList}

      {/* DEBUG */}
      <button className="bg-red-500"
        onClick={onClickPingBtn}
      >
        PING!!
      </button>
      <button className="bg-black text-white"
        onClick={zoomOut}
      >
        Zoom Out
      </button>
      <button className="bg-black text-white"
        onClick={zoomIn}
      >
        Zoom In
      </button>
      <button className="bg-blue-600 text-white"
        onClick={() => insertCard(canvasPos.x + 100, canvasPos.y + 100)}
      >
        New Card
      </button>

      {/* DEBUG */}
      <div>Page ID: {pageId}</div>
      <div>TopLeft: {canvasPos.x}, {canvasPos.y}</div>
      <div>isDraggingCanvas: {isDraggingCanvas ? "true" : "false"}</div>
      <div>Zoom Level: {ZOOMS[canvasZoomLevel]}</div>
    </div>
  );
}


function Card({ card, x, y, zoom }) {
  // const { fill } = useStorage((root) => root.pages.get(pageId).cards.get(id)) ?? {};

  return (
    <div className="absolute flex flex-col items-center rounded-lg w-[175px] h-[100px]"
      style={{
        borderWidth: "3px",
        zIndex: "5000",
        ///////////////////////
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zoom}, ${zoom})`,
        // borderColor: selectionColor,
        backgroundColor: card.fill,
      }}
    >
      HELLO
    </div>
  );
}





// 커서 색상 목록
const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

// 줌 배율 목록
const ZOOMS = [0.1, 0.2, 0.5, 1, 2, 4];