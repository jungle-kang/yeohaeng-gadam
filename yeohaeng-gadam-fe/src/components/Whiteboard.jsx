// 민수 whiteboard prototype

import { useState, useMemo, PointerEvent, useRef } from "react";
import {
  useHistory,
  useOthers,
  RoomProvider,
  useStorage,
  useMutation,
  useSelf,
  useMyPresence,
} from "/liveblocks.config";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { shallow, ClientSideSuspense } from "@liveblocks/react";
import Cursor from "./Cursor";
// import "./Whiteboard.css";

import transportRunIcon from "../assets/whiteboard-transport-run.svg";
import transportBusIcon from "../assets/whiteboard-transport-bus.svg";
import transportCarIcon from "../assets/whiteboard-transport-car.svg";
import routesearchIcon from "../assets/whiteboard-routesearch.svg";

import placehoderImg from "../assets/img-placeholder.png";


const TRANS_METHOD_RUN = 0;
const TRANS_METHOD_BUS = 1;
const TRANS_METHOD_CAR = 2;

// const [canvasPos, setCanvasPos] = useState({x: 0, y: 0});


const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API // calculateTime 전용
const WALK_SPEED = 1 / 900; // 걷기 속도 4km/h (0.001km/s)

export default function Whiteboard() {
  const shapes = useStorage((root) => root.shapes);

  if (shapes == null) {
    return <div className="flex justify-center items-center">Loading</div>;
  }

  return <Canvas />;
}

function Canvas() {
  const memoInputRef = useRef(null);

  ////////////////////////////// LiveCursor //////////////////////////////
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();

  ////////////////////////////// CardLine //////////////////////////////
  const lineIds = useStorage(
    (root) => Array.from(root.lines.keys()),
    shallow
  );
  // const lineStartRef = useRef(null);

  const createLine = useMutation(({ storage }, shape1, shape2) => {
    const lineId = Date.now().toString();
    const cardLine = new LiveObject({
      shape1Id: shape1,
      shape2Id: shape2,
      isChoosingTrans: true,
      transportMethod: null,
      distance: 0,
      duration: 0,
    });
    storage.get("lines").set(lineId, cardLine);
  }, []);

  const onLineButtonDown = useMutation(({ self, setMyPresence }, e, shapeId) => {
    const lineStartShape = self.presence.lineStartShape;

    if (lineStartShape !== null) {
      if (lineStartShape !== shapeId) {
        createLine(lineStartShape, shapeId);
      }
      setMyPresence({ lineStartShape: null }, { addToHistory: true });
    } else {
      setMyPresence({ lineStartShape: shapeId }, { addToHistory: true });
    }
  }, []);

  // 두 지점 사이의 이동 거리 업데이트
  const updateLineTime = useMutation(({ storage }, line, duration) => {
    // const line = storage.get("lines").get(lineId);
    line.update({
      duration: duration,
    })
  }, []);

  // 두 지점 사이의 이동 거리 계산
  const calculateLineTime = async (line, transportMethod, shape1, shape2) => {
    console.log("calculateTime(", line, transportMethod, shape1, shape2, ")"); ////////

    // let transportString = "";
    // switch (transportMethod) {
    //   case TRANS_METHOD_RUN:
    //     transportString = "walking";
    //     break;
    //   case TRANS_METHOD_BUS:
    //     // 버스: 구글 Directions API
    //     transportString = "transit";
    //     break;
    //   case TRANS_METHOD_CAR:
    //     transportString = "driving";
    //     break;
    // }

    // console.log(transportString); //////////

    // 구글 API
    // const res = await fetch(
    //   `/maps/api/directions/json?destination=${destCord}&origin=${originCord}&mode=${transportString}&key=${API_KEY}`
    // );
    // const result = await res.json();
    // const distance = result.routes.length > 0
    //   ? result.routes[0].legs[0].distance.value
    //   : 0;
    // const duration = result.routes.length > 0
    //   ? result.routes[0].legs[0].duration.value
    //   : 0;


    let duration = 0;
    switch (transportMethod) {
      case TRANS_METHOD_RUN:
        // 걷기: 직선거리 기반 시간 계산
        // console.log("line distance: ",line.get("distance") ); ///////////
        duration = line.get("distance") / WALK_SPEED;
        break;
      case TRANS_METHOD_BUS:
        // 버스: 구글 Directions API
        const res = await fetch(
          `/maps/api/directions/json?destination=${shape2.get("placeName")}&origin=${shape1.get("placeName")}&departure_time=1714532400&mode=transit&key=${API_KEY}`
        );
        const result = await res.json();
        duration = result.routes.length > 0
          ? result.routes[0].legs[0].duration.value
          : 0;
        console.log(result); ///////////////////////
        break;
      case TRANS_METHOD_CAR:
        break;
    }

    // console.log(duration); /////////////////

    updateLineTime(line, duration);
  };

  const onTransportButtonDown = useMutation(({ storage }, lineId, transportMethod) => {
    const line = storage.get("lines").get(lineId);

    if (line) {
      const shape1Id = line.get("shape1Id");
      const shape2Id = line.get("shape2Id");

      const shape1 = storage.get("shapes").get(shape1Id);
      const shape2 = storage.get("shapes").get(shape2Id);

      const dist = getDistFromCord(
        shape1.get("placeX"),
        shape1.get("placeY"),
        shape2.get("placeX"),
        shape2.get("placeY"),
      );

      line.update({
        isChoosingTrans: false,
        transportMethod: transportMethod,
        distance: dist,
      })

      calculateLineTime(line, transportMethod, shape1, shape2);
    }
  }, []);

  const deleteLine = useMutation(({ storage }, lineId) => {
    storage.get("lines").delete(lineId);
  }, []);

  ////////////////////////////// Memo //////////////////////////////
  const updateMemo = useMutation(
    ({ storage, self }, e, shapeId) => {
      const shape = storage.get("shapes").get(shapeId);
      if (shape) {
        shape.update({
          memo: e.target.value,
        });
      }
    }, []
  );

  ////////////////////////////// Rectangle //////////////////////////////
  const [isDragging, setIsDragging] = useState(false);
  const shapeIds = useStorage(
    (root) => Array.from(root.shapes.keys()),
    shallow
  );

  const history = useHistory();

  const insertRectangle = useMutation(({ storage, setMyPresence }) => {
    const shapeId = Date.now().toString();
    const shape = new LiveObject({
      x: getRandomInt(300),
      y: 200 + getRandomInt(300),
      fill: "rgb(147, 197, 253)",
      // text: memoInputRef.current.value,
      placeName: memoInputRef.current.value,
      placeCord: "0,0",
    });
    storage.get("shapes").set(shapeId, shape);
    setMyPresence({ selectedShape: shapeId }, { addToHistory: true });
  }, []);

  const deleteRectangle = useMutation(({ storage, self, setMyPresence }) => {
    const shapeId = self.presence.selectedShape;
    if (!shapeId) {
      return;
    }

    storage.get("shapes").delete(shapeId);

    const lineIdList = Array.from(storage.get("lines").keys());

    lineIdList.map((lineId) => {
      const curLine = storage.get("lines").get(lineId);
      if (curLine.get("shape1Id") === shapeId || curLine.get("shape2Id") === shapeId) {
        deleteLine(lineId);
      }
    });

    setMyPresence({ selectedShape: null });
    if (selectedShape === self.presence.lineStartShape) {
      setMyPresence({ lineStartShape: null });
    }
  }, []);

  const onShapePointerDown = useMutation(
    ({ setMyPresence }, e, shapeId) => {
      history.pause();
      e.stopPropagation();

      setMyPresence({ selectedShape: shapeId }, { addToHistory: true });
      setIsDragging(true);
    },
    [history]
  );

  const onCanvasPointerUp = useMutation(
    ({ setMyPresence }) => {
      if (!isDragging) {
        setMyPresence({ selectedShape: null }, { addToHistory: true });
      }

      setIsDragging(false);
      history.resume();
    },
    [isDragging, history]
  );

  const onCanvasPointerMove = useMutation(
    ({ storage, self, setMyPresence }, e) => {
      const dx = self.presence.cursor ? Math.round(e.clientX) - self.presence.cursor.x : 0;
      const dy = self.presence.cursor ? Math.round(e.clientY) - self.presence.cursor.y : 0;

      setMyPresence({
        cursor: {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        },
      });

      e.preventDefault();
      if (!isDragging) {
        return;
      }

      const shapeId = self.presence.selectedShape;
      if (!shapeId) {
        return;
      }

      const shape = storage.get("shapes").get(shapeId);

      if (shape) {
        shape.update({
          x: shape.get("x") + dx,
          y: shape.get("y") + dy,
        });
      }
    },
    [isDragging]
  );

  ////////////////////////////// return //////////////////////////////
  return (
    <>
      <div
        className="w-full h-full"
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerLeave={() =>
          // When the pointer goes out, set cursor to null
          updateMyPresence({
            cursor: null,
          })
        }
      >
        {
          /**
           * Iterate over other users and display a cursor based on their presence
           */
          others.map(({ connectionId, presence }) => {
            if (presence.cursor === null) {
              return null;
            }

            return (
              <Cursor
                key={`cursor-${connectionId}`}
                // connectionId is an integer that is incremented at every new connections
                // Assigning a color with a modulo makes sure that a specific user has the same colors on every clients
                color={COLORS[connectionId % COLORS.length]}
                x={presence.cursor.x}
                y={presence.cursor.y}
              />
            );
          })
        }

        {shapeIds.map((shapeId) => {
          return (
            <Rectangle
              key={shapeId}
              id={shapeId}
              onShapePointerDown={onShapePointerDown}
              onLineButtonDown={onLineButtonDown}
              updateMemo={updateMemo}
            />
          );
        })}

        {lineIds.map((lineId) => {
          return (
            <CardLine
              key={lineId}
              id={lineId}
              onTransportButtonDown={onTransportButtonDown}
              deleteLine={deleteLine}
            />
          );
        })}
      </div>
      <div className="bg-white w-1/2 h-5 mx-auto">
        <textarea className="w-full resize-none" ref={memoInputRef}>
        </textarea>
        <div>
          <button className="w-1/4 bg-white border-2 border-black" onClick={() => insertRectangle()}>Rectangle</button>
          <button className="w-1/4 bg-white border-2 border-black" onClick={() => deleteRectangle()}>Delete</button>
          <button className="w-1/4 bg-white border-2 border-black" onClick={() => history.undo()}>Undo</button>
          <button className="w-1/4 bg-white border-2 border-black" onClick={() => history.redo()}>Redo</button>
        </div>
      </div>
    </>
  );
}


function Rectangle({ id, onShapePointerDown, onLineButtonDown, updateMemo }) {
  const { x, y, fill, placeName, memo } = useStorage((root) => root.shapes.get(id)) ?? {};

  const selectedAsLineStart = useSelf((me) => me.presence.lineStartShape === id);
  const selectedByMe = useSelf((me) => me.presence.selectedShape === id);
  const selectedByOthers = useOthers((others) =>
    others.some((other) => other.presence.selectedShape === id)
  );

  const selectionColor = selectedAsLineStart
    ? "gold"
    : selectedByMe
      ? "blue"
      : selectedByOthers
        ? "green"
        : "transparent";

  return (
    <div
      onPointerDown={(e) => onShapePointerDown(e, id)}
      // className="rectangle bg-blue-300 flex-col justify-center gap-1 w-40"
      className="absolute flex flex-col items-center rounded-lg w-[175px] h-[100px]"
      style={{
        borderWidth: "3px",
        zIndex: "5000",
        ///////////////////////
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
        borderColor: selectionColor,
        backgroundColor: fill,
      }}
    >
      <div className="flex items-center">
        <div className="w-2/3 h-[100px]" >
          <div className="logo-font rounded-lg bg-blue-400">
            {placeName}
          </div>
          {selectedByMe
            ? <textarea className="w-full h-auto resize-none" onChange={(e) => updateMemo(e, id)} value={memo}></textarea>
            : <div className="h-auto">{memo}</div>}
        </div>
        <div className="w-1/3">
          <img src={placehoderImg} className="" />
        </div>
      </div>

      <button
        className="bg-white flex justify-center items-center rounded-full font-bold border-black ring-1 w-8 h-8"
        style={{ position: "absolute", top: "100%", transform: "translate(0, -50%)" }}
        onPointerDown={(e) => onLineButtonDown(e, id)}
      >
        <img className="w-6" src={routesearchIcon} />
      </button>

    </div>
  );
}

function CardLineChoosing({ id, onTransportButtonDown }) {
  return (
    <>
      <button
        className="flex justify-center items-center bg-white rounded-full w-7 h-7"
        style={{ position: "absolute", transform: "translate(0, -20px)" }}
        onClick={() => onTransportButtonDown(id, TRANS_METHOD_RUN)}
      >
        <img
          className="w-6"
          src={transportRunIcon}
        />
      </button>
      <button
        className="flex justify-center items-center bg-white rounded-full w-7 h-7"
        style={{ position: "absolute", transform: "translate(17px, 10px)" }}
        onClick={() => onTransportButtonDown(id, TRANS_METHOD_BUS)}
      >
        <img
          className="w-6"
          src={transportBusIcon}
        />
      </button>
      <button
        className="flex justify-center items-center bg-white rounded-full w-7 h-7"
        style={{ position: "absolute", transform: "translate(-17px, 10px)" }}
        onClick={() => onTransportButtonDown(id, TRANS_METHOD_CAR)}
      >
        <img
          className="w-6"
          src={transportCarIcon}
        />
      </button>
    </>
  );
}

function CardLineChosen({ id, deleteLine, transportMethod, distance, duration }) {
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

function CardLine({ id, onTransportButtonDown, deleteLine }) {
  const { shape1Id, shape2Id, isChoosingTrans, transportMethod, distance, duration } = useStorage((root) => root.lines.get(id)) ?? {};
  const shape1 = useStorage((root) => root.shapes.get(shape1Id)) ?? {};
  const shape2 = useStorage((root) => root.shapes.get(shape2Id)) ?? {};

  const r = Math.sqrt((shape2.x - shape1.x) ** 2 + (shape2.y - shape1.y) ** 2);
  const x = (shape1.x + shape2.x) / 2;
  const y = (shape1.y + shape2.y) / 2;
  const theta = Math.atan((shape2.y - shape1.y) / (shape2.x - shape1.x));

  const infoSize = isChoosingTrans ? "80px" : "75px";

  const infoBody = isChoosingTrans
    ? <CardLineChoosing id={id} onTransportButtonDown={onTransportButtonDown} />
    : <CardLineChosen id={id} deleteLine={deleteLine} transportMethod={transportMethod} distance={distance} duration={duration} />;

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

          transition: "width 0.5s, height 0.5s",

          position: "absolute",
          zIndex: "2000",

          //////////////////////////////
          width: infoSize,
          height: infoSize,
          transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
        }}
      >
        {infoBody}
      </div>
    </>
  );
}


const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomColor() {
  return `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)})`;
}


// 위도, 경도로부터 거리 계산 (km)
function getDistFromCord(x1, y1, x2, y2) {
  const r = 6371;
  const dx = deg2rad(x2 - x1);
  const dy = deg2rad(y2 - y1);
  const a = Math.sin(dx / 2) ** 2 +
    Math.cos(deg2rad(x1)) * Math.cos(deg2rad(x2)) *
    Math.sin(dy / 2) ** 2;
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
