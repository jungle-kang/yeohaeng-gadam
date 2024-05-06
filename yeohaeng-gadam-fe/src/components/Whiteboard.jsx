import { useState, useEffect, useRef } from "react";
import {
  useStorage,
  useMutation,
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useSelf,
  useOthers,
  useHistory,
} from "/liveblocks.config";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { shallow } from "@liveblocks/react";
import { nanoid } from "nanoid";

import Cursor from "./whiteboard/Cursor";


import transportRunIcon from "../assets/whiteboard-transport-run.svg";
import transportBusIcon from "../assets/whiteboard-transport-bus.svg";
import transportCarIcon from "../assets/whiteboard-transport-car.svg";
import routesearchIcon from "../assets/whiteboard-routesearch.svg";

const TRANS_METHOD_RUN = 0;
const TRANS_METHOD_BUS = 1;
const TRANS_METHOD_CAR = 2;



export default function Whiteboard() {
  const [{ selectedPageId }, updateMyPresence] = useMyPresence();
  // 클라이언트가 현재 사용중인 페이지의 ID
  // const [curPageId, setCurPageId] = useState(null);
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

  // const curCanvas = selectedPage
  //   ? pageIds.map((pageId) => {
  //     if (pageId === selectedPage) {
  //       return <Canvas key={pageId} pageId={pageId} />;
  //     }
  //   })
  //   : <div>No page selected</div>;

  const curCanvas = selectedPageId
    ? <Canvas />
    : <div>No page selected</div>;

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
    // setCurPageId(newPageId);
    updateMyPresence({ selectedPageId: newPageId });
  };

  // 탭 버튼
  const onClickTab = (e, pageId) => {
    if (pageId === selectedPageId) {
      setRenamingPageId(pageId);
    } else {
      // setCurPageId(pageId);
      updateMyPresence({ selectedPageId: pageId });
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
    if (pageId === selectedPageId) {
      // 현재 탭을 삭제하면 다른 탭으로 이동
      const newId = pageIds.length === 1
        ? null
        : i === pageIds.length - 1
          ? pageIds[pageIds.length - 2]
          : pageIds[i + 1];

      // setCurPageId(newId);
      updateMyPresence({ selectedPageId: newId });
    }
    deletePage(pageId);
  };

  //////////////////////////// 핑 이벤트 관련 ////////////////////////////

  useEventListener(({ event, user, connectionId }) => {
    if (event.type === "PING") {
      console.log(event, user, connectionId); //////////////

      if (event.pageId !== selectedPageId && !pingedPageList.includes(event.pageId)) {
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
      // setCurPageId(pageIds[0]);
      updateMyPresence({ selectedPageId: pageIds[0] });
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
          const tabColor = pageId === selectedPageId
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
      {/* {curPageId ? <Canvas pageId={curPageId} /> : <div>No page selected</div>} */}
      {curCanvas}
    </>
  );
}

////////////////////////// 쪼개기

// 캔버스
// function Canvas({ pageId }) {
function Canvas() {
  const history = useHistory();
  const [{ cursor, selectedPageId, selectedCardId, lineStartCardId }, updateMyPresence] = useMyPresence();

  const canvasRef = useRef(null);
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 }); // 좌상단의 캔버스 좌표
  const [canvasZoomLevel, setCanvasZoomLevel] = useState(3);
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  // const [lineStartCardId, setLineStartCardId] = useState(null);
  const [lineIndicatorEndPos, setLineIndicatorEndPos] = useState({ x: 0, y: 0 });

  // const page = useStorage((root) => root.pages.get(pageId));

  //////////////////////////// 커서 공유 관련 ////////////////////////////
  const others = useOthers();

  // 다른 이용자들의 커서 표시
  const othersCursorList = others.map(({ connectionId, presence }) => {
    // 커서가 없다면 표시하지 않기
    if (presence.cursor === null) {
      return null;
    }

    if (presence.selectedPageId !== selectedPageId) {
      return null;
    }

    // 커서가 캔버스 밖에 있다면 표시하지 않기
    if (!isInsideCanvas(presence.cursor.x, presence.cursor.y, 0, 0)) {
      return null;
    }

    // 이용자의 캔버스 위치와 줌 배율을 기반으로 계산한 캔버스 상의 위치
    const x = canvasRef.current.offsetWidth / 2
      + (presence.cursor.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y = canvasRef.current.offsetHeight / 2
      + (presence.cursor.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

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
    broadcast({ type: "PING", pageId: selectedPageId, canvasX: 0, canvasY: 0 });
  };

  //////////////////////////// 카드 편집 ////////////////////////////
  const cardIds = useStorage(
    (root) => Array.from(root.pages.get(selectedPageId).cards.keys()),
    shallow
  );

  const cards = useStorage((root) => root.pages.get(selectedPageId).cards);

  const insertCard = useMutation(({ storage, self }, x, y) => {
    const pageId = self.presence.selectedPageId;
    const cardId = nanoid();
    const card = new LiveObject({
      x: x,
      y: y,
      fill: "rgb(147, 197, 253)",
      placeName: "Placeholder Name",
      // placeCord: "0,0",
    });
    // console.log("created card at ", x, ", ", y); /////////////
    storage.get("pages").get(pageId).get("cards").set(cardId, card);
    // setMyPresence({ selectedCard: cardId }, { addToHistory: true });
  }, []);

  const moveCard = useMutation(({ storage, self }, cardId, dx, dy) => {
    const pageId = self.presence.selectedPageId;
    const card = storage.get("pages").get(pageId).get("cards").get(cardId);
    card.update({
      x: card.get("x") + dx,
      y: card.get("y") + dy,
    });
  }, []);

  const deleteCard = useMutation(({ storage, self, setMyPresence }, e, cardId) => {
    e.stopPropagation();
    // const pageId = self.presence.selectedPageId;
    const page = storage.get("pages").get(self.presence.selectedPageId);
    page.get("cards").delete(cardId);
    // storage.get("pages").get(pageId).get("cards").delete(cardId);

    const lineIdList = Array.from(page.get("lines").keys());

    lineIdList.map((lineId) => {
      const curLine = page.get("lines").get(lineId);
      if (curLine.get("card1Id") === cardId || curLine.get("card2Id") === cardId) {
        deleteLine(lineId);
      }
    });

    if (self.presence.selectedCardId === cardId) {
      setMyPresence({ selectedCardId: null });
    }
  }, []);


  //////////////////////////// 카드 동작 ////////////////////////////

  const onCardPointerDown = (e, cardId) => {
    // console.log("onCardPointerDown: cardId = ", cardId); ///////////
    history.pause();
    e.stopPropagation();
    setDraggingCardId(cardId);
    updateMyPresence({ selectedCardId: cardId });
  };

  const onCardPointerUp = (e, cardId) => {
    // 간선 생성 과정에서 마우스를 때면 땐 카드로 간선 연결
    if (!lineStartCardId) {
      return null;
    }

    if (lineStartCardId !== cardId) {
      createLine(lineStartCardId, cardId);
    }
  }

  // useMutation(
  //   ({ setMyPresence }, e, shapeId) => {
  //     history.pause();
  //     e.stopPropagation();

  //     setMyPresence({ selectedShape: shapeId }, { addToHistory: true });
  //     setIsDragging(true);
  //   },
  //   [history]
  // );


  //////////////////////////// 간선 편집 ////////////////////////////
  const lineIds = useStorage(
    (root) => Array.from(root.pages.get(selectedPageId).lines.keys()),
    shallow
  );

  const lines = useStorage((root) => root.pages.get(selectedPageId).lines);

  const createLine = useMutation(({ storage, self }, card1Id, card2Id) => {
    const pageId = self.presence.selectedPageId;
    const lineId = nanoid();
    const line = new LiveObject({
      card1Id: card1Id,
      card2Id: card2Id,
      isChoosingTrans: true,
      transportMethod: null,
      distance: 0,
      duration: 0,
    });
    storage.get("pages").get(pageId).get("lines").set(lineId, line);
  }, []);

  const deleteLine = useMutation(({ storage, self }, lineId) => {
    const pageId = self.presence.selectedPageId;
    storage.get("pages").get(pageId).get("lines").delete(lineId);
  }, []);

  const onTransportBtnDown = useMutation(({ storage, self }, lineId, transportMethod) => {
    const pageId = self.presence.selectedPageId;
    const line = storage.get("pages").get(pageId).get("lines").get(lineId);

    if (line) {
      const card1 = storage.get("pages").get(pageId).get("cards").get(line.get("card1Id"));
      const card2 = storage.get("pages").get(pageId).get("cards").get(line.get("card2Id"));

      const dist = getDistFromCord(
        card1.get("placeX"),
        card1.get("placeY"),
        card2.get("placeX"),
        card2.get("placeY"),
      );

      line.update({
        isChoosingTrans: false,
        transportMethod: transportMethod,
        distance: dist,
      })

      // calculateLineTime(line, transportMethod, shape1, shape2);
    }
  }, []);

  //////////////////////////// 간선 동작 ////////////////////////////

  const onLineBtnPointerDown = (e, cardId) => {
    e.stopPropagation();
    updateMyPresence({ lineStartCardId: cardId });
    // 간선 생성 표시기 좌표 업데이트
    setLineIndicatorEndPos({
      x: e.clientX - canvasRef.current.getBoundingClientRect().left,
      y: e.clientY - canvasRef.current.getBoundingClientRect().top,
    });
  };


  //////////////////////////// 버튼 및 캔버스 동작 관련 ////////////////////////////
  const onCanvasPointerDown = (e) => {
    // console.log(isDraggingCanvas); ////////////
    // e.stopPropagation();
    // console.log(canvasRef.current); ///////////
    // console.log(e); ////////////
    setIsDraggingCanvas(true);
    updateMyPresence({ selectedCardId: null });
  };

  // const onCanvasPointerMove = useMutation(({ setMyPresence, self }, e) => {
  const onCanvasPointerMove = (e) => {
    e.preventDefault();

    const dx = e.movementX / ZOOMS[canvasZoomLevel];
    const dy = e.movementY / ZOOMS[canvasZoomLevel];

    if (isDraggingCanvas) {
      // 캔버스를 움직임
      setCanvasPos({
        x: canvasPos.x - dx,
        y: canvasPos.y - dy,
      });
    } else {
      // 커서만 움직이거나 카드 또는 간선 버튼을 움직임
      if (canvasRef.current) {
        updateMyCursor(
          Math.round(canvasPos.x
            + (e.clientX - canvasRef.current.getBoundingClientRect().left
              - canvasRef.current.offsetWidth / 2)
            / ZOOMS[canvasZoomLevel]),
          Math.round(canvasPos.y
            + (e.clientY - canvasRef.current.getBoundingClientRect().top
              - canvasRef.current.offsetHeight / 2)
            / ZOOMS[canvasZoomLevel])
        );
      }
      // updateMyCursor(
      //   Math.round(canvasPos.x
      //     + (e.nativeEvent.offsetX - canvasRef.current.offsetWidth / 2)
      //     / ZOOMS[canvasZoomLevel]),
      //   Math.round(canvasPos.y
      //     + (e.nativeEvent.offsetY - canvasRef.current.offsetHeight / 2)
      //     / ZOOMS[canvasZoomLevel])
      // );

      if (draggingCardId) {
        // 카드 이동
        moveCard(draggingCardId, dx, dy);
      }

      if (lineStartCardId) {
        // 간선 생성 표시기 좌표 업데이트
        setLineIndicatorEndPos({
          x: e.clientX - canvasRef.current.getBoundingClientRect().left,
          y: e.clientY - canvasRef.current.getBoundingClientRect().top,
        });
      }
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
    setDraggingCardId(null);
    updateMyPresence({ lineStartCardId: null });
    // setLineStartCardId(null);
    history.resume();
  };

  const onCanvasPointerLeave = () => {
    onCanvasPointerUp();
    updateMyPresence({
      cursor: null,
    });
  };

  const zoomOut = () => {
    if (canvasZoomLevel > 0) {
      setCanvasZoomLevel(canvasZoomLevel - 1);
    }
  };

  const zoomIn = () => {
    if (canvasZoomLevel < ZOOMS.length - 1) {
      setCanvasZoomLevel(canvasZoomLevel + 1);
    }
  };

  //////////////////////////// HELPERS ////////////////////////////

  // x, y위치에 있는 물체가 캔버스 내부에 있는지 여부 반환
  // bufX, bufY만큼의 여유를 줌
  function isInsideCanvas(x, y, bufX, bufY) {
    const offX = Math.abs(x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const offY = Math.abs(y - canvasPos.y) * ZOOMS[canvasZoomLevel];
    if (canvasRef.current) {

      // console.log("offset: ", offX, offY); ///////////
      // console.log("WH: ", canvasRef.current.offsetWidth, canvasRef.current.offsetHeight); ///
    }
    return (
      canvasRef.current
      && offX < canvasRef.current.offsetWidth / 2 + bufX
      && offY < canvasRef.current.offsetHeight / 2 + bufY
    );
    // return (
    //   canvasRef.current
    //   && x > canvasPos.x - bufX
    //   && x < canvasPos.x + canvasRef.current.offsetWidth / ZOOMS[canvasZoomLevel] + bufX
    //   && y > canvasPos.y - bufY
    //   && y < canvasPos.y + canvasRef.current.offsetHeight / ZOOMS[canvasZoomLevel] + bufY
    // );
  }

  //////////////////////////// 렌더링 ////////////////////////////

  const cardList = cardIds.map((cardId) => {
    // const { cardX, cardY } = useStorage((root) => root.cards.get(cardId));
    const card = cards.get(cardId);
    if (!isInsideCanvas(card.x, card.y, 0, 0)) {
      return null;
    }

    const x = canvasRef.current.offsetWidth / 2
      + (card.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y = canvasRef.current.offsetHeight / 2
      + (card.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

    return (
      <Card
        key={cardId}
        id={cardId}
        card={card}
        x={x}
        y={y}
        zoom={ZOOMS[canvasZoomLevel]}
        onCardPointerDown={onCardPointerDown}
        onCardPointerUp={onCardPointerUp}
        onLineBtnPointerDown={onLineBtnPointerDown}
        deleteCard={deleteCard}
      />
    );
  });

  const lineList = lineIds.map((lineId) => {
    const line = lines.get(lineId);
    const card1 = cards.get(line.card1Id);
    const card2 = cards.get(line.card2Id);

    if (!isInsideCanvas(card1.x, card1.y, 0, 0)
      && !isInsideCanvas(card2.x, card2.y, 0, 0)) {
      return null;
    }

    const x1 = canvasRef.current.offsetWidth / 2
      + (card1.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y1 = canvasRef.current.offsetHeight / 2
      + (card1.y - canvasPos.y) * ZOOMS[canvasZoomLevel];
    const x2 = canvasRef.current.offsetWidth / 2
      + (card2.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y2 = canvasRef.current.offsetHeight / 2
      + (card2.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

    return (
      <Line
        key={lineId}
        id={lineId}
        line={line}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        zoom={ZOOMS[canvasZoomLevel]}
        onTransportBtnDown={onTransportBtnDown}
        deleteLine={deleteLine}
      />
    );
  });

  function LineIndicator() {
    if (!lineStartCardId) {
      return null;
    }

    const card = cards.get(lineStartCardId);

    const x1 = canvasRef.current.offsetWidth / 2
      + (card.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y1 = canvasRef.current.offsetHeight / 2
      + (card.y - canvasPos.y) * ZOOMS[canvasZoomLevel];
    const x2 = lineIndicatorEndPos.x;
    const y2 = lineIndicatorEndPos.y;

    const r = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    const theta = Math.atan((y2 - y1) / (x2 - x1));

    return (
      <>
        <div className="absolute bg-black h-[5px] z-[1000]"
          style={{
            position: "absolute",
            height: "5px",
            zIndex: "1000",
            //////////////////////
            transform: `translate(${x}px, ${y}px) translateX(-50%) rotate(${theta}rad)`,
            width: `${r}px`,
          }}
        />
        <div
          className="bg-yellow-200 flex justify-center items-center rounded-full font-bold border-black ring-1 w-8 h-8"
          style={{
            position: "absolute",
            transform: `translate(${x2}px, ${y2}px) translate(-50%, -50%)`,
            zIndex: "1000",
          }}
        >
          <img className="w-6" src={routesearchIcon} />
        </div>
      </>
    );
  };


  return (
    <div className="bg-yellow-100 w-full "
      style={{height: "96%"}}
      ref={canvasRef}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerLeave={onCanvasPointerLeave}
    >
      {othersCursorList}
      {cardList}
      {lineList}
      <LineIndicator />

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
      <div>Page ID: {selectedPageId}</div>
      <div>Middle: {canvasPos.x}, {canvasPos.y}</div>
      <div>isDraggingCanvas: {isDraggingCanvas ? "true" : "false"}</div>
      <div>draggingCardId: {draggingCardId}</div>
      <div>selectedCardId: {selectedCardId}</div>
      <div>lineStartCardId: {lineStartCardId}</div>
      <div>Zoom Level: {ZOOMS[canvasZoomLevel]}</div>
    </div>
  );
}


function Card({ id, card, x, y, zoom, onCardPointerDown, onCardPointerUp, onLineBtnPointerDown, deleteCard }) {

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
      onPointerDown={(e) => onCardPointerDown(e, id)}
      onPointerUp={(e) => onCardPointerUp(e, id)}
    >
      {card.placeName}
      <button
        className="bg-white flex justify-center items-center rounded-full border-black border-2 w-8 h-8"
        style={{ position: "absolute", top: "50%", left: "100%", transform: "translate(-50%, -50%)" }}
        onPointerDown={(e) => onLineBtnPointerDown(e, id)}
      >
        <img className="w-6" src={routesearchIcon} />
      </button>
      <button
        className="bg-black text-white flex justify-center items-center rounded-full font-bold w-6 h-6"
        style={{ position: "absolute", top: "100%", transform: "translate(0, -50%)" }}
        onPointerDown={(e) => deleteCard(e, id)}
      >
        X
      </button>
    </div>
  );
}

function LineInfoChoosing({ id, onTransportBtnDown }) {
  return (
    <>
      <button
        className="flex justify-center items-center bg-white rounded-full w-7 h-7"
        style={{ position: "absolute", transform: "translate(0, -20px)" }}
        onClick={() => onTransportBtnDown(id, TRANS_METHOD_RUN)}
      >
        <img
          className="w-6"
          src={transportRunIcon}
        />
      </button>
      <button
        className="flex justify-center items-center bg-white rounded-full w-7 h-7"
        style={{ position: "absolute", transform: "translate(17px, 10px)" }}
        onClick={() => onTransportBtnDown(id, TRANS_METHOD_BUS)}
      >
        <img
          className="w-6"
          src={transportBusIcon}
        />
      </button>
      <button
        className="flex justify-center items-center bg-white rounded-full w-7 h-7"
        style={{ position: "absolute", transform: "translate(-17px, 10px)" }}
        onClick={() => onTransportBtnDown(id, TRANS_METHOD_CAR)}
      >
        <img
          className="w-6"
          src={transportCarIcon}
        />
      </button>
    </>
  );
}

function LineInfoChosen({ id, deleteLine, transportMethod, distance, duration }) {
  let transportIcon = "";
  switch (transportMethod) {
    case TRANS_METHOD_RUN:
      transportIcon = transportRunIcon;
      break;
    case TRANS_METHOD_BUS:
      transportIcon = transportBusIcon;
      break;
    case TRANS_METHOD_CAR:
      transportIcon = transportCarIcon;
      break;
  }

  return (
    <>
      <img src={transportIcon} className="w-6 mt-2" />
      <div className="text-xs">
        {distance > 0 ? formatDist(distance) : "- km"}
      </div>
      <div className="text-xs">
        {duration > 0 ? formatDur(duration) : "- min"}
      </div>
      <button className="bg-black font-bold text-white text-xs rounded-full w-4 z-[2000]"
        onClick={() => deleteLine(id)}
      >
        X
      </button>
    </>
  );
}

function Line({ id, line, x1, y1, x2, y2, zoom, deleteLine, onTransportBtnDown }) {
  const r = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;
  const theta = Math.atan((y2 - y1) / (x2 - x1));

  const infoBody = line.isChoosingTrans
    ? <LineInfoChoosing id={id} onTransportBtnDown={onTransportBtnDown} />
    : <LineInfoChosen
        id={id}
        deleteLine={deleteLine}
        transportMethod={line.transportMethod}
        distance={line.distance}
        duration={line.duration}
      />;

  return (
    <>
      <div className="absolute bg-black h-[5px] z-[1000]"
        style={{
          position: "absolute",
          height: "5px",
          zIndex: "1000",
          //////////////////////
          transform: `translate(${x}px, ${y}px) translateX(-50%) rotate(${theta}rad)`,
          width: `${r}px`,
        }}
      />
      <div className="card-line-info justify-center rounded-full gap-0.5"
        style={{
          backgroundColor: "gold",
          borderColor: "black",
          borderStyle: "solid",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",

          // transition: "width 0.5s, height 0.5s",

          position: "absolute",
          zIndex: "2000",

          //////////////////////////////
          width: "80px",
          height: "80px",
          transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zoom}, ${zoom})`,
        }}
      >
        {infoBody}
      </div>
    </>
  );
}


// 위도, 경도로부터 거리 계산 (km)
// x: 경도, y: 위도 (deg)
function getDistFromCord(x1, y1, x2, y2) {
  const r = 6371;
  const dx = deg2rad(x2 - x1);
  const dy = deg2rad(y2 - y1);
  const a = Math.sin(dy / 2) ** 2 +
    Math.cos(deg2rad(y1)) * Math.cos(deg2rad(y2)) *
    Math.sin(dx / 2) ** 2;
  const dist = 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return dist;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// km로 받은 거리를 적절하게 변환
function formatDist(dist) {
  if (dist < 1) {
    return Math.round(dist * 1000) + " m";
  }
  if (dist < 10) {
    return Math.round(dist * 10) / 10 + " km";
  }
  return Math.round(dist) + " km";
}

// s로 받은 시간을 적절하게 변환
function formatDur(dur) {
  const hr = 3600;
  if (dur < hr) {
    return Math.round(dur / 60) + " min";
  }
  if (dur < 10 * hr) {
    return Math.round(dur / hr * 10) / 10 + " hr";
  }
  return Math.round(dur / hr) + " hr";
}




// 커서 색상 목록
const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

// 줌 배율 목록
const ZOOMS = [0.1, 0.2, 0.5, 1, 2, 4];