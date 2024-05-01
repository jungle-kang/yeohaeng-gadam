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

import placehoderImg from "../assets/img-placeholder.png";


const TRANS_METHOD_RUN = 0;
const TRANS_METHOD_BUS = 1;
const TRANS_METHOD_CAR = 2;

// const [canvasPos, setCanvasPos] = useState({x: 0, y: 0});


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

  const onTransportButtonDown = useMutation(({ storage }, lineId, transportMethod) => {
    const line = storage.get("lines").get(lineId);
    if (line) {
      line.update({
        isChoosingTrans: false,
        transportMethod: transportMethod,
      })
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
      text: memoInputRef.current.value,
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
  const { x, y, fill, text, memo } = useStorage((root) => root.shapes.get(id)) ?? {};

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
          <div className="rounded-lg bg-blue-400">
            {text}
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
        className="bg-white rounded-full font-bold border-black ring-1 w-8 h-8"
        style={{ position: "absolute", top: "100%", transform: "translate(0, -50%)" }}
        onPointerDown={(e) => onLineButtonDown(e, id)}
      >
        GO
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

function CardLineChosen({ id, deleteLine, transportMethod }) {
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
      <div className="text-xs">0 km</div>
      <button className="bg-black font-bold text-white text-xs rounded-full w-4 z-[2000]"
        onClick={() => deleteLine(id)}
      >
        X
      </button>
    </>
  );
}

function CardLine({ id, onTransportButtonDown, deleteLine }) {
  const { shape1Id, shape2Id, isChoosingTrans, transportMethod } = useStorage((root) => root.lines.get(id)) ?? {};
  const shape1 = useStorage((root) => root.shapes.get(shape1Id)) ?? {};
  const shape2 = useStorage((root) => root.shapes.get(shape2Id)) ?? {};

  const r = Math.sqrt((shape2.x - shape1.x) ** 2 + (shape2.y - shape1.y) ** 2);
  const x = (shape1.x + shape2.x) / 2;
  const y = (shape1.y + shape2.y) / 2;
  const theta = Math.atan((shape2.y - shape1.y) / (shape2.x - shape1.x));

  const infoSize = isChoosingTrans ? "80px" : "58px";

  const infoBody = isChoosingTrans
    ? <CardLineChoosing id={id} onTransportButtonDown={onTransportButtonDown} />
    : <CardLineChosen id={id} deleteLine={deleteLine} transportMethod={transportMethod} />;

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