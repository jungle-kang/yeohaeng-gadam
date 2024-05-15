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

import Canvas from "./whiteboard/Canvas";

export default function Whiteboard({ myUserId, myColorId }) {
  const [{ selectedPageId }, updateMyPresence] = useMyPresence();
  // 핑 이벤트 리스트
  const [pingEventList, setPingEventList] = useState([]);


  //////////////////////////// 페이지 storage 관련 ////////////////////////////

  // 페이지 탭에서 사용할 페이지 ID 배열
  // const pageIds = useStorage(
  //   (root) => Array.from(root.pages.keys()),
  //   shallow
  // );

  const pageIds = useStorage(
    (root) => Array.from(root.pages.keys()).sort(),
    shallow
  );

  // const curCanvas = selectedPage
  //   ? pageIds.map((pageId) => {
  //     if (pageId === selectedPage) {
  //       return <Canvas key={pageId} pageId={pageId} />;
  //     }
  //   })
  //   : <div>No page selected</div>;

  // const curCanvas = selectedPageId
  //   ? <Canvas />
  //   : <div>No page selected</div>;

  // 페이지 추가
  // const createPage = useMutation(({ storage }) => {
  //   const pageId = nanoid();
  //   const newPage = new LiveObject({
  //     name: "새 보드",
  //     cards: new LiveMap(),
  //     lines: new LiveMap(),
  //   });
  //   storage.get("pages").set(pageId, newPage);

  //   return pageId;
  // }, []);

  // 페이지 삭제
  // const deletePage = useMutation(({ storage }, pageId) => {
  //   storage.get("pages").delete(pageId);
  // }, []);

  // 페이지 이름 수정
  // const updatePage = useMutation(({ storage }, pageId, newName) => {
  //   storage.get("pages").get(pageId).update({
  //     name: newName,
  //   });
  // }, []);



  //////////////////////////// 버튼 동작 관련 ////////////////////////////

  // 새 탭 버튼
  // const onClickNewTab = () => {
  //   // 새 페이지 생성
  //   const newPageId = createPage();
  //   // 새로운 페이지를 현재 탭으로
  //   // setCurPageId(newPageId);
  //   updateMyPresence({ selectedPageId: newPageId });
  // };

  // 탭 버튼
  // const onClickTab = (e, pageId) => {
  //   if (pageId === selectedPageId) {
  //     setRenamingPageId(pageId);
  //   } else {
  //     // setCurPageId(pageId);
  //     updateMyPresence({ selectedPageId: pageId });
  //     // setPingedPageList(pingedPageList.filter((id) => (pageId !== id)));
  //   }
  // };
  const onClickTab = (e, pageId) => {
    updateMyPresence({ selectedPageId: pageId });
  };

  // 탭 이름 변경
  // const onChangeTabRename = (e, pageId) => {
  //   updatePage(pageId, e.target.value);
  // };

  // const onBlurTabRename = (e) => {
  //   console.log("hi");
  // };

  // 탭 이름 변경 완료
  // const onKeyDownTabRename = (e) => {
  //   if (e.key === "Enter") {
  //     setRenamingPageId(null);
  //   }
  // }

  // 탭 삭제 버튼
  // const onClickTabRemoveBtn = (pageId, i) => {
  //   if (pageId === selectedPageId) {
  //     // 현재 탭을 삭제하면 다른 탭으로 이동
  //     const newId = pageIds.length === 1
  //       ? null
  //       : i === pageIds.length - 1
  //         ? pageIds[pageIds.length - 2]
  //         : pageIds[i + 1];

  //     // setCurPageId(newId);
  //     updateMyPresence({ selectedPageId: newId });
  //   }
  //   deletePage(pageId);
  // };

  //////////////////////////// 핑 이벤트 관련 ////////////////////////////

  useEventListener(({ event, user }) => {
    console.log("new ping event: ", event, ", from user ", user); ///

    if (event.type === "PING") {
      setPingEventList((prev) => {
        const modifiedPingEventList = prev.filter((pingEvent) => (
          pingEvent.userId !== user.presence.userId
        )); // 핑을 찍은 사용자의 이전 핑은 삭제
        const newPingEvent = {
          userId: user.presence.userId,
          pageId: event.pageId,
          x: event.x,
          y: event.y,
          pingType: event.pingType,
          color: event.color,
        };
        return ([...modifiedPingEventList, newPingEvent]);
      });
      // console.log(event, user, connectionId); //////////////

      console.log("updated pingEventList: ", pingEventList); ///////

      // if (event.pageId !== selectedPageId && !pingedPageList.includes(event.pageId)) {
      //   setPingedPageList([...pingedPageList, event.pageId]);
      //   console.log("pinged list: ", pingedPageList); /////////////
      // }
      // if (event.pageId !== selectedPageId) {

      // }
    }
  });

  const pingedPageList = pingEventList.map((pingEvent) => (pingEvent.pageId));




  // liveblocks가 로딩되었는지 확인용
  const pages = useStorage((root) => root.pages);
  // console.log(pages); ////////


  useEffect(() => {
    // 로딩 완료 시 첫 탭을 현재 탭으로
    if (pages != null) {
      // setCurPageId(pageIds[0]);
      updateMyPresence({
        selectedPageId: pageIds[0],
        userId: myUserId,
        colorId: myColorId,
      });
    }
  }, [pages == null])



  // 로딩중 표시
  if (pages == null) {
    return <div className="flex justify-center items-center w-full h-full">로딩 중...</div>;
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
                {pages.get(pageId).name}
              </button>
            </div>
          );
        })}
      </div>
      {
        selectedPageId
          ? <Canvas pingEventList={pingEventList} setPingEventList={setPingEventList} />
          : <div>No page selected</div>
      }
    </>
  );

  // return (
  //   <>
  //     <div className="w-full h-8 flex">
  //       {pageIds.map((pageId, i) => {
  //         const tabColor = pageId === selectedPageId
  //           ? "green"
  //           : pingedPageList.includes(pageId)
  //             ? "yellow"
  //             : "grey";

  //         return (
  //           <div className="flex w-1/6 border-black border-2"
  //             key={pageId}
  //           >
  //             <button className="w-full h-full"
  //               style={{ backgroundColor: tabColor }}
  //               onClick={(e) => onClickTab(e, pageId)}
  //             >
  //               {
  //                 pageId === renamingPageId
  //                   ? <textarea
  //                     className="resize-none w-full h-full"
  //                     // value={pages.get(pageId).name}
  //                     autoFocus
  //                     onChange={(e) => onChangeTabRename(e, pageId)}
  //                     // onBlur={(e) => onBlurTabRename(e)}
  //                     onKeyDown={(e) => onKeyDownTabRename(e)}
  //                   />
  //                   : pages.get(pageId).name
  //               }
  //             </button>
  //             <button className="bg-red-300"
  //               onClick={() => onClickTabRemoveBtn(pageId, i)}
  //             >
  //               X
  //             </button>
  //           </div>
  //         );
  //       })}
  //       <button className="bg-green-100 border-black border-2"
  //         onClick={onClickNewTab}
  //       >
  //         new
  //       </button>
  //     </div>
  //     {/* {curPageId ? <Canvas pageId={curPageId} /> : <div>No page selected</div>} */}
  //     {
  //       selectedPageId
  //         ? <Canvas pingEventList={pingEventList} setPingEventList={setPingEventList} />
  //         : <div>No page selected</div>
  //     }
  //   </>
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

  // 두 지점 사이의 이동 시간 업데이트
  const updateLineTime = useMutation(({ storage, self }, line, duration) => {
    // const pageId = self.presence.selectedPageId;
    // const line = storage.get("pages").get(pageId).get("lines").get(lineId);

    line.update({
      duration: duration,
    })
  }, []);

  // 두 지점 사이의 이동 거리 계산
  const calculateLineTime = async (line, transportMethod, card1, card2) => {
    console.log("calculateTime(", line, transportMethod, card1, card2, ")"); ////////

    let duration = 0;
    let res = null;
    let result = null;

    switch (transportMethod) {
      case TRANS_METHOD_RUN:
        // 걷기: 직선거리 기반 시간 계산
        // console.log("line distance: ",line.get("distance") ); ///////////
        // duration = line.get("distance") / WALK_SPEED;

        // 걷기: SK TMAP API
        res = await fetch(
          "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result"
          + `&startX=${card1.get("placeX")}`
          + `&startY=${card1.get("placeY")}`
          + `&endX=${card2.get("placeX")}`
          + `&endY=${card2.get("placeY")}`
          + `&startName=${card1.get("placeName")}`
          + `&endName=${card2.get("placeName")}`,
          {
            method: "POST",
            headers: { "appKey": SK_API_KEY },
          }
        );
        result = await res.json();

        // console.log("walk API res: ", result);
        console.log("totalTime: ", result.features[0].properties.totalTime);
        duration = result.features[0].properties.totalTime;

        break;
      case TRANS_METHOD_BUS:
        // 버스: 구글 Directions API

        // const res = await fetch(
        //   `/maps/api/directions/json?destination=${shape2.get("placeName")}&origin=${shape1.get("placeName")}&departure_time=1714532400&mode=transit&key=${API_KEY}`
        // );

        // console.log("Google API req: ", `/maps/api/directions/json?destination=${card2.get("placeY")},${card2.get("placeX")}&origin=${card1.get("placeY")},${card1.get("placeX")}&departure_time=1714532400&mode=transit&key={GOOGLE_API_KEY}`);
        const curTime = Math.floor(Date.now() / 1000);
        const today = Math.floor(curTime / 86400) * 86400;

        res = await fetch(
          `/maps/api/directions/json`
          + `?destination=${card2.get("placeY")},${card2.get("placeX")}`
          + `&origin=${card1.get("placeY")},${card1.get("placeX")}`
          + `&departure_time=${today + 10800}` // 오늘 정오
          + `&mode=transit&key=${GOOGLE_API_KEY}`
        );
        result = await res.json();
        duration = result.routes.length > 0
          ? result.routes[0].legs[0].duration.value
          : 0;
        console.log(result); ///////////////////////
        break;
      case TRANS_METHOD_CAR:
        // 자동차: SK TMAP API
        res = await fetch(
          "https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result"
          + `&startX=${card1.get("placeX")}`
          + `&startY=${card1.get("placeY")}`
          + `&endX=${card2.get("placeX")}`
          + `&endY=${card2.get("placeY")}`,
          {
            method: "POST",
            headers: { "appKey": SK_API_KEY },
          }
        );
        result = await res.json();

        // console.log("walk API res: ", result);
        console.log("totalTime: ", result.features[0].properties.totalTime);
        duration = result.features[0].properties.totalTime;

        break;
        break;
    }

    // console.log(duration); /////////////////

    updateLineTime(line, duration);
  };

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

      calculateLineTime(line, transportMethod, card1, card2);
    }
  }, []);


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

  const onCanvasWheel = (e) => {
    e.preventDefault();
    // console.log(e); /////////////
    if (e.deltaY > 0) {
      zoomOut();
    } else {
      zoomIn();
    }
  }

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

  const pingIndicatorList = pingEventList.map((pingEvent) => {
    if (pingEvent.pageId !== selectedPageId) {
      return null;
    }

    if (!isInsideCanvas(pingEvent.x, pingEvent.y, 0, 0)) {
      return null;
    }

    const x = canvasRef.current.offsetWidth / 2
      + (pingEvent.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y = canvasRef.current.offsetHeight / 2
      + (pingEvent.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

    return (
      <PingIndicator
        x={x}
        y={y}
        color={pingEvent.color}
        userId={pingEvent.userId}
        removePingEvent={removePingEvent} />
    )
  });

  const cardList = cardIds.map((cardId) => {
    if (!canvasRef.current) { ////////////////
      return null;
    }

    // const { cardX, cardY } = useStorage((root) => root.cards.get(cardId));
    const card = cards.get(cardId);
    if (!isInsideCanvas(card.x, card.y, 200, 200)) {
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
        deleteCard={deleteCard}
        onLineBtnPointerDown={onLineBtnPointerDown} // place card
        onLikeBtnClick={onLikeBtnClick}
        onCardChange={onCardChange} // memo card
      />
    );
  });

  const lineList = lineIds.map((lineId) => {
    if (!canvasRef.current) { ///////////
      return null;
    }

    const line = lines.get(lineId);
    const card1 = cards.get(line.card1Id);
    const card2 = cards.get(line.card2Id);

    // if (!isInsideCanvas(card1.x, card1.y, 0, 0)
    //   && !isInsideCanvas(card2.x, card2.y, 0, 0)) {
    //   return null;
    // }

    const x1 = canvasRef.current.offsetWidth / 2
      + (card1.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y1 = canvasRef.current.offsetHeight / 2
      + (card1.y - canvasPos.y) * ZOOMS[canvasZoomLevel];
    const x2 = canvasRef.current.offsetWidth / 2
      + (card2.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
    const y2 = canvasRef.current.offsetHeight / 2
      + (card2.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

    if (Math.max(x1, x2) < 0
      || Math.min(x1, x2) > canvasRef.current.getBoundingClientRect().width
      || Math.max(y1, y2) < 0
      || Math.min(y1, y2) > canvasRef.current.getBoundingClientRect().height) {
      return null;
    }

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
            height: 5 * ZOOMS[canvasZoomLevel],
            zIndex: "1000",
            // zIndex: "-9000",
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
            // zIndex: "-9000",
          }}
        >
          <img className="w-6" src={routesearchIcon} />
        </div>
      </>
    );
  };


  return (
    <div className="relative overflow-hidden bg-gray-100 w-full"
      style={{
        height: "calc(100% - 32px)",
      }}
      ref={canvasRef}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerLeave={onCanvasPointerLeave}
      onWheel={onCanvasWheel}
    >
      {othersCursorList}
      {pingIndicatorList}
      {cardList}
      {lineList}
      <LineIndicator />

      {/* DEBUG */}
      <button className="bg-red-500"
        onClick={onClickPingBtn}
      >
        PING!!
      </button>
      <button className="bg-gray-400"
        onClick={() => history.undo()}
      >
        Undo
      </button>
      <button className="bg-gray-400"
        onClick={() => history.redo()}
      >
        Redo
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
        onClick={() => insertPlaceCard(canvasPos.x + 100, canvasPos.y + 100)}
      >
        Place
      </button>
      <button className="bg-blue-600 text-white"
        onClick={() => insertMemoCard(canvasPos.x + 100, canvasPos.y + 100)}
      >
        Memo
      </button>
      <button className="bg-blue-600 text-white"
        onClick={() => insertMapCard(canvasPos.x + 100, canvasPos.y + 100)}
      >
        Map
      </button>

      {/* DEBUG */}
      <div>Page ID: {selectedPageId}</div>
      <div>Middle: {canvasPos.x}, {canvasPos.y}</div>
      <div>isDraggingCanvas: {isDraggingCanvas ? "true" : "false"}</div>
      <div>draggingCardId: {draggingCardId}</div>
      <div>selectedCardId: {selectedCardId}</div>
      <div>lineStartCardId: {lineStartCardId}</div>
      <div>Zoom Level: {ZOOMS[canvasZoomLevel]}</div>
      <div>My ID: {useSelf().connectionId}</div>
      <div>Others ID: {others.map(({ connectionId }) => connectionId)}</div>
    </div>
  );
}


function PingIndicator({ x, y, color, userId, removePingEvent }) {
  return (
    <div className="absolute flex justify-center items-center bg-red-200 rounded-full"
      style={{
        width: "50px",
        height: "50px",
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
        zIndex: 9000,
      }}
      onMouseOver={() => removePingEvent(userId)}
    >
      <div
        style={{
          fontSize: "100px",
          color: color,
          transform: "translateY(-25%)",
        }}
      >
        !
      </div>
    </div>
  );
}

function PlaceCardContent({ id, card, onLineBtnPointerDown }) {
  return (
    <>
      {card.placeName}
      <button
        className="bg-white flex justify-center items-center rounded-full border-black border-2 w-8 h-8"
        style={{ position: "absolute", top: "50%", left: "100%", transform: "translate(-50%, -50%)" }}
        onPointerDown={(e) => onLineBtnPointerDown(e, id)}
      >
        <img className="w-6" src={routesearchIcon} />
      </button>
    </>
  );
}

function MemoCardContent({ id, card, isSelected, onCardChange }) {
  const textLines = card.memoText.split('\n').map((line, i) => (
    <div key={i}>{line}</div>
  ));
  return (
    <>
      {
        isSelected
          ? <textarea className="resize-none w-full h-full"
            value={card.memoText}
            onChange={(e) => onCardChange(e, id)}
          />
          : textLines
      }
    </>
  );
}

function MapCardContent({ id, card }) {
  const [{ selectedPageId }] = useMyPresence();
  const containerRef = useRef(null);

  const cardIds = useStorage(
    (root) => Array.from(root.pages.get(selectedPageId).cards.keys()),
    shallow
  );
  const cards = useStorage((root) => root.pages.get(selectedPageId).cards);

  const lineIds = useStorage(
    (root) => Array.from(root.pages.get(selectedPageId).lines.keys()),
    shallow
  );
  const lines = useStorage((root) => root.pages.get(selectedPageId).lines);

  useEffect(() => {
    if (!kakao) {
      console.log("no kakao detected");
      return;
    }
    const options = {
      center: new kakao.maps.LatLng(33.450701, 126.570667),
      level: 3,
    };
    const map = new kakao.maps.Map(containerRef.current, options);
    map.setDraggable(false);
    map.setZoomable(false);

    const bounds = new kakao.maps.LatLngBounds();

    cardIds.map((cardId) => {
      const card = cards.get(cardId);
      if (card.cardType !== "place") {
        return;
      }
      const LatLng = new kakao.maps.LatLng(card.placeY, card.placeX);

      // 지도에 표시될 영역을 확장
      bounds.extend(LatLng);
      // 지도에 마커를 추가
      new kakao.maps.Marker({
        map: map,
        position: LatLng,
        title: card.placeName,
      });
    });

    // 확장된 영역을 지도에 적용
    map.setBounds(bounds);

    lineIds.map((lineId) => {
      const line = lines.get(lineId);
      const card1 = cards.get(line.card1Id);
      const card2 = cards.get(line.card2Id);

      const linePath = [
        new kakao.maps.LatLng(card1.placeY, card1.placeX),
        new kakao.maps.LatLng(card2.placeY, card2.placeX),
      ];

      const polyline = new kakao.maps.Polyline({
        path: linePath, // 선을 구성하는 좌표배열 입니다
        strokeWeight: 5, // 선의 두께 입니다
        strokeColor: '#FFAE00', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'shortdash' // 선의 스타일입니다
      });

      // 지도에 선을 표시합니다 
      polyline.setMap(map);
    });

    // var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    // const container = document.getElementById('myMap');
    // const options = {
    //   center: new kakao.maps.LatLng(33.450701, 126.570667),
    //   level: 3,
    // };
    // const map = new kakao.maps.Map(container, options);
    // const ps = new kakao.maps.services.Places();

    // ps.keywordSearch(searchPlace, placesSearchCB);


    // function placesSearchCB(data, status, pagination) {
    //   let bounds = new kakao.maps.LatLngBounds();
    //   for (let i = 0; i < data.length; i++) {
    //     displayMarker(data[i]);
    //     bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
    //   }
    //   map.setBounds(bounds);

    //   setPlaces(data);
    // }

    // function displayMarker(place) {
    //   let marker = new kakao.maps.Marker({
    //     map: map,
    //     position: new kakao.maps.LatLng(place.y, place.x),
    //   });
    //   kakao.maps.event.addListener(marker, 'click', () => {
    //     infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
    //     infowindow.open(map, marker);
    //   });
    // }

  }, [cardIds, lineIds]);

  return (
    <>
      <div className="w-full h-full"
        // style={{ zInedx: 5001 }}
        ref={containerRef}
      />
    </>
  );
}

function Card({
  id, card, x, y, zoom,
  onCardPointerDown,
  onCardPointerUp,
  deleteCard,
  onLineBtnPointerDown,
  onLikeBtnClick,
  onCardChange,
}) {
  const selectedByMe = useSelf((me) => me.presence.selectedCardId === id);
  const selectedByOthers = useOthers((others) =>
    others.some((other) => other.presence.selectedCardId === id)
  );

  const selectionColor = selectedByMe
    ? "blue"
    : selectedByOthers
      ? "green"
      : "transparent";

  const width = card.cardType === "place"
    ? 175
    : card.cardType === "memo"
      ? 150
      : 400; // map

  const height = card.cardType === "place"
    ? 100
    : card.cardType === "memo"
      ? 120
      : 400; // map

  const zIndex = card.cardType === "map"
    ? 0
    : 5000; // place, memo

  return (
    <div className="absolute rounded-lg"
      style={{
        borderWidth: "3px",
        zIndex: zIndex,
        // zIndex: "-5000",
        ///////////////////////
        width: width,
        height: height,
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zoom}, ${zoom})`,
        borderColor: selectionColor,
        backgroundColor: card.fill,
        fontFamily: 'Ownglyph_meetme-Rg' // 여기에 폰트 적용
      }}
      onPointerDown={(e) => onCardPointerDown(e, id)}
      onPointerUp={(e) => onCardPointerUp(e, id, card.cardType === "place")}
    >
      {card.cardType === "place"
        ? <PlaceCardContent id={id} card={card} onLineBtnPointerDown={onLineBtnPointerDown} />
        : card.cardType === "memo"
          ? <MemoCardContent id={id} card={card} isSelected={selectedByMe} onCardChange={onCardChange} />
          : <MapCardContent id={id} card={card} />
      }
      {
        card.cardType !== "map" &&
        <div className="absolute"
          style={{
            top: "100%",
          }}
        >
          <button onClick={() => onLikeBtnClick(id)}>
            ❤️
          </button>
          {card.likedUsers}
        </div>
      }
      <button
        className="bg-black text-white flex justify-center items-center rounded-full font-bold w-6 h-6 ml-3"
        style={{ position: "absolute", top: "0", left: "100%", transform: "translate(-50%, -50%)" }}
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
          height: 5 * zoom,
          zIndex: "1000",
          // zIndex: "-5000",
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
          // zIndex: "-8000",

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
const ZOOMS = [0.2, 0.25, 0.33, 0.4, 0.5, 0.65, 0.8, 1, 1.25, 1.55];

