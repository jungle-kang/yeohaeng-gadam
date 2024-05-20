import { useState, useEffect, useRef } from "react";
import {
    useStorage,
    useMutation,
    useBroadcastEvent,
    useMyPresence,
    useSelf,
    useOthers,
    useHistory,
} from "/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { shallow } from "@liveblocks/react";
import { nanoid } from "nanoid";

import Cursor from "./Cursor";
import Plan from "./Plan";

import { COLORS_BORDER, COLORS_CURSOR, COLORS_PING, COLORS_EFFECT, COLORS_LIKE_1, COLORS_LIKE_2 } from "./userColors"


// import transportRunIcon from "/src/assets/whiteboard-transport-run.svg";
// import transportBusIcon from "/src/assets/whiteboard-transport-bus.svg";
// import transportCarIcon from "/src/assets/whiteboard-transport-car.svg";
// import routesearchIcon from "/src/assets/whiteboard-routesearch.svg";
const ICON_SIZE = 25;
const transportRunIcon = (
    <svg width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 22V16.9612C14 16.3537 13.7238 15.7791 13.2494 15.3995L11.5 14M11.5 14L13 7.5M11.5 14L10 13M13 7.5L11 7M13 7.5L15.0426 10.7681C15.3345 11.2352 15.8062 11.5612 16.3463 11.6693L18 12M10 13L11 7M10 13L9.40011 16.2994C9.18673 17.473 8.00015 18.2 6.85767 17.8573L4 17M11 7L8.10557 8.44721C7.428 8.786 7 9.47852 7 10.2361V12M14.5 3.5C14.5 4.05228 14.0523 4.5 13.5 4.5C12.9477 4.5 12.5 4.05228 12.5 3.5C12.5 2.94772 12.9477 2.5 13.5 2.5C14.0523 2.5 14.5 2.94772 14.5 3.5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const transportBusIcon = (
    <svg width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`} viewBox="-1 -1 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 21.25c0 .414.336.75.75.75h1.615a.75.75 0 0 0 .74-.627L6.5 19h11l.395 2.373a.75.75 0 0 0 .74.627h1.615a.75.75 0 0 0 .75-.75V10l.78-.78a.75.75 0 0 0 .22-.53V6.75a.75.75 0 0 0-.75-.75H21v-.995c0-1.171-.814-2.183-1.97-2.373C17.299 2.347 14.65 2 12 2c-2.65 0-5.299.347-7.03.632C3.814 2.822 3 3.834 3 5.005V6h-.25a.75.75 0 0 0-.75.75v1.94c0 .198.079.389.22.53L3 10v11.25zm5-6.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm9.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 5.145V11h14V5.145c0-.37-.27-.685-.638-.732-1.166-.15-3.764-.442-6.362-.442-2.598 0-5.196.291-6.362.442A.734.734 0 0 0 5 5.145z" fill="#000000" />
    </svg>
);
const transportCarIcon = (
    <svg fill="#000000" width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`} viewBox="-4 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>car</title>
        <path d="M19.938 7.188l3.563 7.156c0.063 0.094 0.094 0.219 0.125 0.313 0.219 0.563 0.375 1.344 0.375 1.844v3.406c0 1.063-0.719 1.938-1.719 2.188v2c0 0.969-0.781 1.719-1.719 1.719-0.969 0-1.719-0.75-1.719-1.719v-1.938h-13.688v1.938c0 0.969-0.75 1.719-1.719 1.719-0.938 0-1.719-0.75-1.719-1.719v-2c-1-0.25-1.719-1.125-1.719-2.188v-3.406c0-0.5 0.156-1.281 0.375-1.844 0.031-0.094 0.063-0.219 0.125-0.313l3.563-7.156c0.281-0.531 1.031-1.031 1.656-1.031h12.563c0.625 0 1.375 0.5 1.656 1.031zM5.531 9.344l-1.906 4.344c-0.094 0.156-0.094 0.344-0.094 0.469h16.938c0-0.125 0-0.313-0.094-0.469l-1.906-4.344c-0.25-0.563-1-1.063-1.594-1.063h-9.75c-0.594 0-1.344 0.5-1.594 1.063zM4.688 19.906c1 0 1.781-0.813 1.781-1.844 0-1-0.781-1.781-1.781-1.781s-1.844 0.781-1.844 1.781c0 1.031 0.844 1.844 1.844 1.844zM19.313 19.906c1 0 1.844-0.813 1.844-1.844 0-1-0.844-1.781-1.844-1.781s-1.781 0.781-1.781 1.781c0 1.031 0.781 1.844 1.781 1.844z" />
    </svg>
);
const routesearchIcon = (
    <svg fill="#000000" width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <title>direction--bear-right</title>
        <path d="M12,4V6h6.5859L12.05,12.5356a6.954,6.954,0,0,0-2.05,4.95V28h2V17.4854A4.9683,4.9683,0,0,1,13.4644,13.95L20,7.4141V14h2V4Z" />
    </svg>
)

const TRANS_METHOD_RUN = 0;
const TRANS_METHOD_BUS = 1;
const TRANS_METHOD_CAR = 2;

// 줌 배율 목록
const ZOOMS = [0.2, 0.25, 0.33, 0.4, 0.5, 0.65, 0.8, 1, 1.25, 1.55];
const DEFAULT_ZOOM_LEVEL = 7;

const MEMO_WIDTH = [150, 225, 300];
const MEMO_HEIGHT = [120, 210, 300];

const { kakao } = window; // 카카오 지도 사용
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API // calculateTime 전용
const SK_API_KEY = import.meta.env.VITE_SK_MAP_API // calculateTime 전용

export default function Canvas({ pingEventList, setPingEventList }) {
    const history = useHistory();
    const [{ userId, colorId, cursor, selectedPageId, selectedCardId, lineStartCardId }, updateMyPresence] = useMyPresence();

    const canvasRef = useRef(null);
    const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 }); // 좌상단의 캔버스 좌표
    const [canvasZoomLevel, setCanvasZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
    const [draggingCardId, setDraggingCardId] = useState(null);
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    // const [lineStartCardId, setLineStartCardId] = useState(null);
    const [lineIndicatorEndPos, setLineIndicatorEndPos] = useState({ x: 0, y: 0 });
    const [myPingPos, setMyPingPos] = useState(null);

    // 추천 기능
    const [isPlanOpen, setIsPlanOpen] = useState(false);
    const [isSuggestOpen, setIsSuggestOpen] = useState(false);

    // const page = useStorage((root) => root.pages.get(pageId));

    const self = useSelf();
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
                color={COLORS_CURSOR[presence.colorId]}
                x={x}
                y={y}
                id={connectionId}
            />
        );
    })

    const updateMyCursor = useMutation(({ setMyPresence }, x, y) => {
        setMyPresence({ cursor: { x, y } });
    }, []);

    //////////////////////////// 핑 이벤트 관련 ////////////////////////////
    const broadcast = useBroadcastEvent();

    const broadcastPing = (pingType, x, y) => {
        broadcast({
            type: "PING",
            pingType: pingType,
            pageId: selectedPageId,
            x: x,
            y: y,
        });
    }

    // const onClickPingBtn = () => {
    //     broadcastPing("!", canvasPos.x, canvasPos.y);
    // };

    const removePingEvent = (userId) => {
        // userId에 해당하는 핑 이벤트를 pingEventList에서 삭제
        setPingEventList((prev) => prev.filter(((pingEvent) => (
            pingEvent.userId !== userId
        ))))
    };

    //////////////////////////// 카드 편집 ////////////////////////////
    const cardIds = useStorage(
        (root) => Array.from(root.pages.get(selectedPageId).cards.keys()),
        shallow
    );

    const cards = useStorage((root) => root.pages.get(selectedPageId).cards);

    // 디버깅용 함수
    // const insertPlaceCard = useMutation(({ storage, self }, x, y) => {
    //     const pageId = self.presence.selectedPageId;
    //     const cardId = nanoid();
    //     const card = new LiveObject({
    //         x: x,
    //         y: y,
    //         fill: "rgb(147, 197, 253)",
    //         cardType: "place",
    //         placeName: "Placeholder Name",
    //         // placeCord: "0,0",
    //     });
    //     // console.log("created card at ", x, ", ", y); /////////////
    //     storage.get("pages").get(pageId).get("cards").set(cardId, card);
    //     // setMyPresence({ selectedCard: cardId }, { addToHistory: true });
    // }, []);

    const insertMemoCard = useMutation(({ storage, self, setMyPresence }, canvasPos) => {
        const selectedPageId = self.presence.selectedPageId;
        const selectedCardId = self.presence.selectedCardId;
        const prevCard = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);

        const x = selectedCardId && prevCard ? prevCard.get("x") + 30 : canvasPos.x;
        const y = selectedCardId && prevCard ? prevCard.get("y") + 30 : canvasPos.y;

        const pageId = self.presence.selectedPageId;
        const cardId = nanoid();
        const card = new LiveObject({
            x: x,
            y: y,
            fill: "rgb(255, 255, 204)",
            cardType: "memo",
            memoText: "",
            memoSize: 0,
            likedUsers: [],
            // likes: 0,
        });
        // console.log("created card at ", x, ", ", y); /////////////
        storage.get("pages").get(pageId).get("cards").set(cardId, card);
        setMyPresence({ selectedCardId: cardId }, { addToHistory: true });
    }, []);

    const insertMapCard = useMutation(({ storage, self, setMyPresence }) => {
        const selectedPageId = self.presence.selectedPageId;
        const selectedCardId = self.presence.selectedCardId;
        const prevCard = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);

        const x = selectedCardId && prevCard ? prevCard.get("x") + 30 : canvasPos.x;
        const y = selectedCardId && prevCard ? prevCard.get("y") + 30 : canvasPos.y;

        const pageId = self.presence.selectedPageId;
        const cardId = nanoid();
        const card = new LiveObject({
            x: x,
            y: y,
            fill: "rgb(200, 200, 200)",
            cardType: "map",
        });
        // console.log("created card at ", x, ", ", y); /////////////
        storage.get("pages").get(pageId).get("cards").set(cardId, card);
        setMyPresence({ selectedCardId: cardId }, { addToHistory: true });
    }, []);

    const moveCard = useMutation(({ storage, self }, cardId, dx, dy) => {
        const pageId = self.presence.selectedPageId;
        const card = storage.get("pages").get(pageId).get("cards").get(cardId);
        card.update({
            x: card.get("x") + dx,
            y: card.get("y") + dy,
        });
    }, []);

    const updateMemoCardText = useMutation(({ storage, self }, cardId, text) => {
        const pageId = self.presence.selectedPageId;
        const card = storage.get("pages").get(pageId).get("cards").get(cardId);
        card.update({
            memoText: text,
        });
    }, []);

    const updateMemoCardSize = useMutation(({ storage, self }, cardId, increment) => {
        const pageId = self.presence.selectedPageId;
        const card = storage.get("pages").get(pageId).get("cards").get(cardId);
        const prevSize = card.get("memoSize");

        if (prevSize + increment < 0 || prevSize + increment >= MEMO_WIDTH.length) {
            return;
        }


        card.update({
            memoSize: prevSize + increment,
        });
    }, []);

    const deleteCard = useMutation(({ storage, self, setMyPresence }, cardId) => {
        // e.stopPropagation();
        // const pageId = self.presence.selectedPageId;
        const page = storage.get("pages").get(self.presence.selectedPageId);

        // cards에서 삭제
        page.get("cards").delete(cardId);
        // storage.get("pages").get(pageId).get("cards").delete(cardId);

        // 연결된 line을 삭제
        const lineIdList = Array.from(page.get("lines").keys());

        lineIdList.map((lineId) => {
            const curLine = page.get("lines").get(lineId);
            if (curLine.get("card1Id") === cardId || curLine.get("card2Id") === cardId) {
                deleteLine(lineId);
            }
        });

        // plan에서 삭제
        const plan = storage.get("pages").get(selectedPageId).get("plan");
        const placeIds = plan.get("placeIds");

        if (placeIds.includes(cardId)) {
            const filteredPlan = placeIds.filter((placeId) => (placeId !== cardId));
            plan.update({
                placeIds: filteredPlan,
            })
        }

        if (plan.get("startId") === cardId) {
            plan.update({
                startId: null,
            });
        }

        if (plan.get("endId") === cardId) {
            plan.update({
                endId: null,
            });
        }

        // selected 상태라면 삭제
        if (self.presence.selectedCardId === cardId) {
            setMyPresence({ selectedCardId: null });
        }
    }, []);

    const likeCard = useMutation(({ storage, self, setMyPresence }, cardId) => {
        // const pageId = self.presence.selectedPageId;
        const page = storage.get("pages").get(self.presence.selectedPageId);
        const card = page.get("cards").get(cardId);
        const likedUsers = card.get("likedUsers");

        console.log("likedUsers: ", likedUsers);

        let newLikedUsers = [];

        if (likedUsers.includes(self.presence.colorId)) {
            console.log("contains me");
            newLikedUsers = likedUsers.filter((colorId) => (colorId !== self.presence.colorId));
        } else {
            console.log("does not contain me");
            newLikedUsers = [...likedUsers, self.presence.colorId];
        }


        // console.log("newLikedUsers: ", newLikedUsers);

        card.update({
            likedUsers: newLikedUsers,
        });
        // storage.get("pages").get(pageId).get("cards").delete(cardId);
    }, []);


    //////////////////////////// 카드 동작 ////////////////////////////

    const onCardPointerDown = (e, cardId) => {
        // console.log("onCardPointerDown: cardId = ", cardId); ///////////
        history.pause();
        e.stopPropagation();
        setDraggingCardId(cardId);
        updateMyPresence({ selectedCardId: cardId });
    };

    const onCardPointerUp = (e, cardId, isPlace) => {
        // 간선 생성 과정에서 마우스를 때면 땐 카드로 간선 연결
        if (!isPlace) {
            return null;
        }

        if (!lineStartCardId) {
            return null;
        }

        if (lineStartCardId !== cardId) {
            createLine(lineStartCardId, cardId);
        }
    }

    const onCardChange = (e, cardId) => {
        updateMemoCardText(cardId, e.target.value);
    };

    const onCardSizeClick = (cardId, increment) => {
        updateMemoCardSize(cardId, increment);
    }

    const onLikeBtnClick = (id) => {
        likeCard(id);
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

    const deleteLine = useMutation(({ storage, self }, e, lineId) => {
        e.stopPropagation();
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
        // updateMyPresence({ selectedCardId: null });
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

    const onCanvasPointerUp = () => {
        setIsDraggingCanvas(false);
        setDraggingCardId(null);
        updateMyPresence({ lineStartCardId: null });
        history.resume();
    };

    const onCanvasPointerLeave = () => {
        onCanvasPointerUp();
        updateMyPresence({
            cursor: null,
        });
    };

    // 줌 인/아웃
    const onCanvasWheel = (e) => {
        if (e.deltaY > 0) {
            zoomOut();
        } else {
            zoomIn();
        }
    }

    // useEffect(() => {
    //     function onKeyDown(e) {
    //         switch (e.key) {
    //             case "Delete": {
    //                 const cardId = useSelf((me) => me.presence.selectedCardId);
    //                 if (cardId) {
    //                     deleteCard(cardId);
    //                 }
    //                 break;
    //             }
    //             case "z": {
    //                 if (e.ctrlKey || e.metaKey) {
    //                     if (e.shiftKey) {
    //                         history.redo();
    //                     } else {
    //                         history.undo();
    //                     }
    //                     break;
    //                 }
    //             }
    //         }
    //     }

    //     document.addEventListener("keydown", onKeyDown);

    //     return () => {
    //         document.removeEventListener("keydown", onKeyDown);
    //     };
    // }, [history]);

    // 우클릭
    const onCanvasContextMenu = (e) => {
        e.preventDefault();
        console.log("right click!, e: ", e);
        if (canvasRef.current) {
            const x = Math.round(canvasPos.x
                + (e.clientX - canvasRef.current.getBoundingClientRect().left
                    - canvasRef.current.offsetWidth / 2)
                / ZOOMS[canvasZoomLevel]);
            const y = Math.round(canvasPos.y
                + (e.clientY - canvasRef.current.getBoundingClientRect().top
                    - canvasRef.current.offsetHeight / 2)
                / ZOOMS[canvasZoomLevel]);

            broadcastPing("!", x, y);

            setMyPingPos(null);

            setTimeout(() => {
                setMyPingPos({
                    x: e.clientX - canvasRef.current.getBoundingClientRect().left,
                    y: e.clientY - canvasRef.current.getBoundingClientRect().top,
                });
                // setTimeout(() => {
                //     setMyPingPos(null);
                // }, 1000);
            }, 1);
        }
    }

    // const onCanvasKeyDown = (e) => {
    //     console.log("key event", e);

    //     if (e.key === "Delete") {
    //         // deleteCard();
    //     }
    // }

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

        if (!canvasRef.current) {
            return null;
        }

        if (isInsideCanvas(pingEvent.x, pingEvent.y, 0, 0)) {
            // 핑이 보이는 경우
            const x = canvasRef.current.offsetWidth / 2
                + (pingEvent.x - canvasPos.x) * ZOOMS[canvasZoomLevel];
            const y = canvasRef.current.offsetHeight / 2
                + (pingEvent.y - canvasPos.y) * ZOOMS[canvasZoomLevel];

            return (
                <PingIndicator
                    key={pingEvent.userId}
                    pingType={pingEvent.pingType}
                    x={x}
                    y={y}
                    userId={pingEvent.userId}
                    colorId={pingEvent.colorId}
                    removePingEvent={removePingEvent}
                />
            );
        } else {
            const offset = 35;

            // 캔버스 코너 기울기
            const cSlope = (canvasRef.current.offsetHeight - offset * 2)
                / (canvasRef.current.offsetWidth - offset * 2);
            const pSlope = (pingEvent.y - canvasPos.y) / (pingEvent.x - canvasPos.x);

            // 핑 표시기가 오른쪽 또는 왼쪽 변에 존재하는지 여부
            const isOnXSide = Math.abs(pSlope) < cSlope;

            const x = isOnXSide
                ? (pingEvent.x - canvasPos.x) < 0
                    ? offset // 좌측
                    : canvasRef.current.offsetWidth - offset // 우측
                : canvasRef.current.offsetWidth / 2
                + (canvasRef.current.offsetHeight / 2 - offset)
                * Math.sign(pingEvent.y - canvasPos.y) / pSlope; // 상하단

            const y = isOnXSide
                ? canvasRef.current.offsetHeight / 2
                + (canvasRef.current.offsetWidth / 2 - offset)
                * Math.sign(pingEvent.x - canvasPos.x) * pSlope // 좌우측
                : (pingEvent.y - canvasPos.y) < 0
                    ? offset // 상단
                    : canvasRef.current.offsetHeight - offset; // 하단

            const theta = Math.atan(pSlope) + Math.PI * ((pingEvent.x - canvasPos.x) < 0);
            // const dist = Math.sqrt((pingEvent.x - canvasPos.x)^2 + (pingEvent.y - canvasPos.y)^2);

            // 핑이 안보이는 경우
            return (
                <PingDirectionIndicator
                    key={pingEvent.userId}
                    x={x}
                    y={y}
                    theta={theta}
                    // dist={dist}
                    colorId={pingEvent.colorId}
                />
            );
        }
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
                onCardSizeClick={onCardSizeClick} // memo card
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

        if (!card1 || !card2) {
            return null;
        }

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

    // const plan = pages.get(selectedPageId).get("plan");
    // const pages = useStorage((root) => root.pages);
    // const plan = useStorage((root) => root.pages.get(selectedPageId).plan);
    // console.log("plan ", plan);
    // const placeIds = plan && plan.placeIds;
    // console.log("placeIds ", placeIds);
    const placeIds = useStorage((root) => root.pages.get(selectedPageId).plan.placeIds);
    const planLineList = isPlanOpen ? placeIds.map((placeId, i) => {
        if (i === 0) {
            return;
        }

        if (!canvasRef.current) {
            return null;
        }

        const card1 = cards.get(placeIds[i - 1]);
        const card2 = cards.get(placeIds[i]);

        if (!card1 || !card2) {
            console.log("planLineList error: card1->", card1, " , card2->", card2);
            return;
        }

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
            <PlanLine
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                zoom={ZOOMS[canvasZoomLevel]}
            />
        );
    })
        : null;

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
                <div className="absolute bg-yellow-400 h-[5px] z-[1000]"
                    style={{
                        position: "absolute",
                        height: 5 * ZOOMS[canvasZoomLevel],
                        zIndex: "2",
                        // zIndex: "-9000",
                        //////////////////////
                        transform: `translate(${x}px, ${y}px) translateX(-50%) rotate(${theta}rad)`,
                        width: `${r}px`,
                    }}
                />
                <div
                    // className="bg-yellow-100 border-2 border-gray-500 flex justify-center items-center rounded-full w-8 h-8"
                    className="bg-yellow-100 shadow-md shadow-gray-600 flex justify-center items-center rounded-full w-8 h-8"
                    style={{
                        position: "absolute",
                        transform: `translate(${x2}px, ${y2}px) translate(-50%, -50%)`,
                        zIndex: "2",
                        // zIndex: "-9000",
                    }}
                >
                    {/* <img className="w-6" src={routesearchIcon} /> */}
                    {routesearchIcon}
                </div>
            </>
        );
    };


    return (
        <div className="relative overflow-hidden bg-gray-200 w-full"
            style={{
                height: "calc(100% - 36px)",
            }}
            ref={canvasRef}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerLeave={onCanvasPointerLeave}
            onWheel={onCanvasWheel}
            onContextMenu={onCanvasContextMenu}
        // onKeyDown={onCanvasKeyDown}
        >
            {othersCursorList}
            {pingIndicatorList}
            {
                myPingPos
                    ? <MyPingIndicator x={myPingPos.x} y={myPingPos.y} colorId={colorId} />
                    : null
            }
            {cardList}
            {lineList}
            {planLineList}
            <LineIndicator />

            {/* DEBUG */}
            {/*<button className="bg-red-500"*/}
            {/*  onClick={onClickPingBtn}*/}
            {/*>*/}
            {/*  PING!!*/}
            {/*</button>*/}
            {/*<button className="bg-gray-400"*/}
            {/*  onClick={() => history.undo()}*/}
            {/*>*/}
            {/*  Undo*/}
            {/*</button>*/}
            {/*<button className="bg-gray-400"*/}
            {/*  onClick={() => history.redo()}*/}
            {/*>*/}
            {/*  Redo*/}
            {/*</button>*/}
            {/*<button className="bg-black text-white"*/}
            {/*  onClick={zoomOut}*/}
            {/*>*/}
            {/*  Zoom Out*/}
            {/*</button>*/}
            {/*<button className="bg-black text-white"*/}
            {/*  onClick={zoomIn}*/}
            {/*>*/}
            {/*  Zoom In*/}
            {/*</button>*/}
            {/*<button className="bg-blue-600 text-white"*/}
            {/*  onClick={() => insertPlaceCard(canvasPos.x + 100, canvasPos.y + 100)}*/}
            {/*>*/}
            {/*  Place*/}
            {/*</button>*/}


            <div
                className="relative flex flex-col justify-center items-center bg-white rounded-md w-12 h-28 ml-1 mt-5 px-1 shadow-md shadow-gray-700"
                style={{ zIndex: 11 }}
            >
                <button
                    className="mx-1 flex items-center justify-center text-white hover:bg-blue-100 rounded-lg w-full h-10"
                    onClick={() => insertMemoCard(canvasPos)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#5F5F5F" width="38px" height="38px"
                        viewBox="0 0 16 16">
                        <path
                            d="M14.25 1.5H1.75A1.25 1.25 0 0 0 .5 2.75v10.5a1.25 1.25 0 0 0 1.25 1.25h8.69a1.24 1.24 0 0 0 .93-.41l3.81-4.23A1.24 1.24 0 0 0 15.5 9V2.75a1.25 1.25 0 0 0-1.25-1.25zM1.75 13.25V2.75h12.5v5h-3.81A1.25 1.25 0 0 0 9.19 9v4.23zm8.69 0V9h3.81z" />
                    </svg>
                </button>
                <button
                    className="mt-2.5 mx-1 flex items-center justify-center text-white hover:bg-blue-100 rounded-lg w-full h-10"
                    onClick={() => insertMapCard(canvasPos.x + 100, canvasPos.y + 100)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 6H12.01M9 20L3 17V4L5 5M9 20L15 17M9 20V14M15 17L21 20V7L19 6M15 17V14M15 6.2C15 7.96731 13.5 9.4 12 11C10.5 9.4 9 7.96731 9 6.2C9 4.43269 10.3431 3 12 3C13.6569 3 15 4.43269 15 6.2Z"
                            stroke="#5F5F5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* DEBUG */}
            {/*<div>Page ID: {selectedPageId}</div>*/}
            {/*<div>Middle: {canvasPos.x}, {canvasPos.y}</div>*/}
            {/*<div>isDraggingCanvas: {isDraggingCanvas ? "true" : "false"}</div>*/}
            {/*<div>draggingCardId: {draggingCardId}</div>*/}
            {/*<div>selectedCardId: {selectedCardId}</div>*/}
            {/*<div>lineStartCardId: {lineStartCardId}</div>*/}
            {/*<div>Zoom Level: {ZOOMS[canvasZoomLevel]}</div>*/}
            {/*<div>My ID: {useSelf().connectionId}</div>*/}
            {/*<div>Others ID: {others.map(({ connectionId }) => connectionId)}</div>*/}

            <div className="absolute bg-red-300"
                style={{
                    top: "100%",
                    left: 0,
                    width: "100%",
                    height: "200px",
                    transition: "top 0.2s",
                    zIndex: 11,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation()
                }}
            >
                <Plan
                    isPlanOpen={isPlanOpen}
                    setIsPlanOpen={setIsPlanOpen}
                    isSuggestOpen={isSuggestOpen}
                    setIsSuggestOpen={setIsSuggestOpen}
                />
            </div>
        </div>
    );
}


function PingIndicator({ pingType, x, y, userId, colorId, removePingEvent }) {
    return (
        <div className="absolute flex"
            style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                zIndex: 9,
            }}
        >
            <div className="absolute flex justify-center items-center rounded-full animate-ping-animation"
                style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: COLORS_EFFECT[colorId],
                    opacity: 0.3,
                    transform: `translate(-50%, -50%)`,
                }}
            >
            </div>
            <div className="absolute"
                style={{
                    transform: "translate(-12%, -94%)",
                }}
            >

                <svg xmlns="http://www.w3.org/2000/svg" fill={COLORS_PING[colorId]} width="50px" height="50px" viewBox="0 0 20 20">
                    <path
                        d="M4.774 15.287l-2.105 3.25.224 1.063 1.06-.227 2.104-3.248a8.352 8.352 0 0 1-1.283-.838zm8.912-1.135c.014-.029.023-.061.036-.092.053-.117.1-.234.138-.357.006-.022.009-.044.016-.064a4.48 4.48 0 0 0 .098-.408v-.021c.195-1.169-.145-2.473-.923-3.651l1.11-1.714c1.279.163 2.385-.159 2.917-.982.923-1.423-.2-3.792-2.505-5.293C12.266.068 9.65.005 8.729 1.426c-.534.824-.378 1.967.293 3.073L7.91 6.213c-1.389-.233-2.716-.016-3.703.64-.006.002-.013.004-.017.008a3.735 3.735 0 0 0-.332.254c-.017.014-.037.027-.051.041a3.024 3.024 0 0 0-.271.272c-.02.024-.048.045-.067.07a3.102 3.102 0 0 0-.29.385c-1.384 2.133-.203 5.361 2.633 7.209 2.838 1.848 6.26 1.614 7.641-.519.087-.135.167-.276.233-.421zm-.815-9.958c-.887-.577-1.32-1.487-.965-2.036.354-.547 1.361-.522 2.246.055.889.577 1.318 1.489.965 2.036-.353.547-1.358.522-2.246-.055z" />
                </svg>
            </div>
            <div className="absolute flex justify-center items-center rounded-full"
                style={{
                    width: "120px",
                    height: "120px",
                    transform: `translate(-50%, -50%)`,
                }}
                onMouseEnter={() => removePingEvent(userId)}
            />
        </div>
    );
}

function PingDirectionIndicator({ x, y, theta, colorId }) {
    return (
        <div className="absolute"
            style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                zIndex: 9,
            }}
        >
            <div className="absolute flex justify-center items-center w-10 h-10 rounded-full"
                style={{
                    borderWidth: 4,
                    borderColor: COLORS_PING[colorId],
                    transform: `translate(-50%, -50%)`,
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill={COLORS_PING[colorId]} width="25px" height="25px" viewBox="0 0 18 20">
                    <path
                        d="M4.774 15.287l-2.105 3.25.224 1.063 1.06-.227 2.104-3.248a8.352 8.352 0 0 1-1.283-.838zm8.912-1.135c.014-.029.023-.061.036-.092.053-.117.1-.234.138-.357.006-.022.009-.044.016-.064a4.48 4.48 0 0 0 .098-.408v-.021c.195-1.169-.145-2.473-.923-3.651l1.11-1.714c1.279.163 2.385-.159 2.917-.982.923-1.423-.2-3.792-2.505-5.293C12.266.068 9.65.005 8.729 1.426c-.534.824-.378 1.967.293 3.073L7.91 6.213c-1.389-.233-2.716-.016-3.703.64-.006.002-.013.004-.017.008a3.735 3.735 0 0 0-.332.254c-.017.014-.037.027-.051.041a3.024 3.024 0 0 0-.271.272c-.02.024-.048.045-.067.07a3.102 3.102 0 0 0-.29.385c-1.384 2.133-.203 5.361 2.633 7.209 2.838 1.848 6.26 1.614 7.641-.519.087-.135.167-.276.233-.421zm-.815-9.958c-.887-.577-1.32-1.487-.965-2.036.354-.547 1.361-.522 2.246.055.889.577 1.318 1.489.965 2.036-.353.547-1.358.522-2.246-.055z" />
                </svg>
            </div>
            <div className="absolute"
                style={{
                    color: COLORS_PING[colorId],
                    transform: `translate(-50%, -50%) rotate(${theta}rad) translate(23px, -2px)`,
                }}
            >
                ▶
            </div>
        </div>
    )
}

function MyPingIndicator({ x, y, colorId }) {
    return (
        <div className="absolute flex"
            style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                pointerEvents: "none",
                zIndex: 9,
            }}
        >
            <div className="absolute flex justify-center items-center rounded-full animate-ping-animation-once"
                style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: COLORS_EFFECT[colorId],
                    opacity: 0.3,
                    transform: `translate(-50%, -50%)`,
                }}
            >
            </div>
            <div className="absolute animate-fade-out"
                style={{
                    // fontSize: "100px",
                    transform: "translate(-12%, -94%)",
                }}
            >

                <svg xmlns="http://www.w3.org/2000/svg" fill={COLORS_PING[colorId]} width="50px" height="50px" viewBox="0 0 20 20">
                    <path
                        d="M4.774 15.287l-2.105 3.25.224 1.063 1.06-.227 2.104-3.248a8.352 8.352 0 0 1-1.283-.838zm8.912-1.135c.014-.029.023-.061.036-.092.053-.117.1-.234.138-.357.006-.022.009-.044.016-.064a4.48 4.48 0 0 0 .098-.408v-.021c.195-1.169-.145-2.473-.923-3.651l1.11-1.714c1.279.163 2.385-.159 2.917-.982.923-1.423-.2-3.792-2.505-5.293C12.266.068 9.65.005 8.729 1.426c-.534.824-.378 1.967.293 3.073L7.91 6.213c-1.389-.233-2.716-.016-3.703.64-.006.002-.013.004-.017.008a3.735 3.735 0 0 0-.332.254c-.017.014-.037.027-.051.041a3.024 3.024 0 0 0-.271.272c-.02.024-.048.045-.067.07a3.102 3.102 0 0 0-.29.385c-1.384 2.133-.203 5.361 2.633 7.209 2.838 1.848 6.26 1.614 7.641-.519.087-.135.167-.276.233-.421zm-.815-9.958c-.887-.577-1.32-1.487-.965-2.036.354-.547 1.361-.522 2.246.055.889.577 1.318 1.489.965 2.036-.353.547-1.358.522-2.246-.055z" />
                </svg>

                {/*{pingType}*/}
            </div>
        </div>
    );
}

function PlaceCardContent({ id, card, onLineBtnPointerDown }) {
    return (
        <div className="p-2">
            <div className="nanumbarungothic">
                {card.placeName}
            </div>
            <div className="nanumbarungothic-light">
                {card.placeAddr}
            </div>
            <button
                // className="bg-yellow-100 border-2 border-gray-500 flex justify-center items-center rounded-full w-6 h-6"
                className="bg-yellow-100 shadow shadow-gray-600 flex justify-center items-center rounded-full w-6 h-6"
                style={{ position: "absolute", top: "50%", left: "100%", transform: "translate(-50%, -50%)" }}
                onPointerDown={(e) => onLineBtnPointerDown(e, id)}
            >
                {/* <img className="w-6" src={routesearchIcon} /> */}
                {routesearchIcon}
            </button>
        </div>
    );
}

function MemoCardContent({ id, card, isSelected, onCardChange, onCardSizeClick }) {
    const textLines = card.memoText.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
    ));

    // const textareaRef = useRef();
    // useEffect(() => {
    //     if (isSelected && textareaRef.current) {
    //         console.log("memo edit ", card.memoText);

    //     }
    // }, [card.memoText]);

    return (
        <>
            {
                isSelected
                    ? (<>
                        <textarea className="flex resize-none p-1 w-full h-full"
                            // ref={textareaRef}
                            style={{ backgroundColor: card.fill }}
                            value={card.memoText}
                            onChange={(e) => onCardChange(e, id)}
                        />
                        <div className="absolute flex"
                            style={{
                                top: "100%",
                                left: 0,
                                transform: "translateY(-100%)"
                            }}
                        >
                            <button className="w-[18px] h-[18px] flex justify-center items-center pb-1 rounded-md text-xl text-yellow-600 hover:bg-yellow-200"
                                onClick={() => onCardSizeClick(id, -1)}
                            >
                                -
                            </button>
                            <button className="w-[18px] h-[18px] flex justify-center items-center pb-1 rounded-md text-xl text-yellow-600 hover:bg-yellow-200"
                                onClick={() => onCardSizeClick(id, 1)}
                            >
                                +
                            </button>
                        </div>
                    </>)
                    : (<div className="p-1">
                        {textLines}
                    </div>)
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

    const placeIds = useStorage((root) => root.pages.get(selectedPageId).plan.placeIds);

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

            if (!card1 || !card2) {
                return;
            }

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

        placeIds.map((placeId, i) => {
            const card1 = cards.get(placeIds[i - 1]);
            const card2 = cards.get(placeIds[i]);
            if (!card1 || !card2) {
                return;
            }

            const linePath = [
                new kakao.maps.LatLng(card1.placeY, card1.placeX),
                new kakao.maps.LatLng(card2.placeY, card2.placeX),
            ];

            const polyline = new kakao.maps.Polyline({
                path: linePath, // 선을 구성하는 좌표배열 입니다
                strokeWeight: 7, // 선의 두께 입니다
                strokeColor: '#0000FF', // 선의 색깔입니다
                strokeOpacity: 0.5, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                strokeStyle: 'solid' // 선의 스타일입니다
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

    }, [cardIds, lineIds, placeIds]);

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
    onCardSizeClick,
}) {
    const myColorId = useSelf((me) => me.presence.colorId);
    const selectedByMe = useSelf((me) => me.presence.selectedCardId === id);
    // const selectedByOthers = useOthers((others) =>
    //   others.some((other) => other.presence.selectedCardId === id)
    // );
    const selectedColorIds = useOthers((others) => others.map((other) => {
        if (other.presence.selectedCardId === id) {
            return other.presence.colorId;
        }
    }))

    const selectionColor = selectedByMe
        ? COLORS_BORDER[myColorId]
        : selectedColorIds[0] != null
            ? COLORS_BORDER[selectedColorIds[0]]
            : "transparent";

    const width = card.cardType === "place"
        ? 175
        : card.cardType === "map"
            ? 400
            : MEMO_WIDTH[card.memoSize]; // memo

    const height = card.cardType === "place"
        ? 120
        : card.cardType === "map"
            ? 400
            : MEMO_HEIGHT[card.memoSize]; // memo

    const zIndex = card.cardType === "map"
        ? 0
        : 5; // place, memo

    const borderRadius = card.cardType === "place"
        ? "0.5rem"
        : card.cardType === "map"
            ? "0.2rem"
            : "1px"; // memo


    // 디버깅용ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ
    // const increaseLike = useMutation(({ storage, self }, cardId) => {
    //   const page = storage.get("pages").get(self.presence.selectedPageId);
    //   const card = page.get("cards").get(cardId);
    //   const likedUsers = card.get("likedUsers");

    //   card.update({
    //     likedUsers: [...Array(likedUsers.length + 1).keys()]
    //   })
    // }, []);

    // const decreaseLike = useMutation(({ storage, self }, cardId) => {
    //   const page = storage.get("pages").get(self.presence.selectedPageId);
    //   const card = page.get("cards").get(cardId);
    //   const likedUsers = card.get("likedUsers");

    //   if (likedUsers.length <= 0) {
    //     return;
    //   }

    //   card.update({
    //     likedUsers: [...Array(likedUsers.length - 1).keys()]
    //   })
    // }, []);
    // 디버깅용ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ

    return (
        <div className="absolute shadow-md shadow-gray-600"
            style={{
                borderWidth: "3px",
                borderRadius: borderRadius,
                zIndex: zIndex,
                // zIndex: "-5000",
                ///////////////////////
                width: width,
                height: height,
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zoom}, ${zoom})`,
                borderColor: selectionColor,
                backgroundColor: card.fill,
                transition: "width 0.2s, height 0.2s",
            }}
            onPointerDown={(e) => onCardPointerDown(e, id)}
            onPointerUp={(e) => onCardPointerUp(e, id, card.cardType === "place")}
        >
            {card.cardType === "place"
                ? <PlaceCardContent id={id} card={card} onLineBtnPointerDown={onLineBtnPointerDown} />
                : card.cardType === "memo"
                    ? <MemoCardContent id={id} card={card} isSelected={selectedByMe} onCardChange={onCardChange} onCardSizeClick={onCardSizeClick} />
                    : <MapCardContent id={id} card={card} />
            }

            {
                // 디버깅용ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ
                card.cardType !== "map" &&
                <div className="absolute flex flex-row mt-2"
                    style={{
                        top: "100%",
                    }}
                >
                    {/* {card.likedUsers.includes(myColorId)
                        ? (<button className="text-xl"
                            style={{
                                color: COLORS_LIKE[myColorId],
                                transform: "scaleY(90%)",
                            }}
                            onClick={() => onLikeBtnClick(id)}
                        >
                            ♥
                        </button>)
                        : (<button className="text-xl"
                            style={{
                                color: COLORS_LIKE[myColorId],
                                transform: "scaleY(90%)",
                            }}
                            onClick={() => onLikeBtnClick(id)}
                        >
                            ♡
                        </button>)
                    } */}

                    {/* <button className="text-xl"
                    // <button className="text-xl text-transparent bg-clip-text"
                        style={{
                            // color: COLORS_LIKE[myColorId],
                            // "--tw-gradient-from": "#0000FF var(--tw-gradient-from-position)",
                            // "--tw-gradient-to": "#FF0000 var(--tw-gradient-to-position)",
                            // background: `linear-gradient(#0000FF, #FF0000)`,
                            "-webkit-background-clip": "text",
                            "-webkit-text-fill-color": "transparent",
                            // backgroundColor: "green",
                            background: "green",
                            transform: "scaleY(90%)",
                        }}
                        onClick={() => onLikeBtnClick(id)}
                    >
                        {card.likedUsers.includes(myColorId) ? "♥" : "♡"}
                    </button> */}

                    {card.likedUsers.includes(myColorId)
                        ? (<button onClick={() => onLikeBtnClick(id)} >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" >
                                <defs>
                                    <linearGradient id="grad-me-fill" x1="0%" x2="100%">
                                        <stop offset="0%" style={{ stopColor: COLORS_LIKE_1[myColorId] }} />
                                        <stop offset="100%" style={{ stopColor: COLORS_LIKE_2[myColorId] }} />
                                    </linearGradient>
                                </defs>
                                <path style={{ fill: "url(#grad-me-fill)" }} d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" />
                            </svg>
                        </button>)
                        : (<button
                            onClick={() => onLikeBtnClick(id)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" >
                                <defs>
                                    <linearGradient id="grad-me-empty" x1="0%" x2="100%">
                                        <stop offset="0%" style={{ stopColor: COLORS_LIKE_1[myColorId] }} />
                                        <stop offset="100%" style={{ stopColor: COLORS_LIKE_2[myColorId] }} />
                                    </linearGradient>
                                </defs>
                                <path style={{ fill: "url(#grad-me-empty)" }} d="M8.96173 18.9109L9.42605 18.3219L8.96173 18.9109ZM12 5.50063L11.4596 6.02073C11.601 6.16763 11.7961 6.25063 12 6.25063C12.2039 6.25063 12.399 6.16763 12.5404 6.02073L12 5.50063ZM15.0383 18.9109L15.5026 19.4999L15.0383 18.9109ZM9.42605 18.3219C7.91039 17.1271 6.25307 15.9603 4.93829 14.4798C3.64922 13.0282 2.75 11.3345 2.75 9.1371H1.25C1.25 11.8026 2.3605 13.8361 3.81672 15.4758C5.24723 17.0866 7.07077 18.3752 8.49742 19.4999L9.42605 18.3219ZM2.75 9.1371C2.75 6.98623 3.96537 5.18252 5.62436 4.42419C7.23607 3.68748 9.40166 3.88258 11.4596 6.02073L12.5404 4.98053C10.0985 2.44352 7.26409 2.02539 5.00076 3.05996C2.78471 4.07292 1.25 6.42503 1.25 9.1371H2.75ZM8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.6599C10.6739 20.9854 11.3096 21.25 12 21.25V19.75C11.6904 19.75 11.3261 19.6293 10.8736 19.3648C10.4213 19.1005 9.95208 18.7366 9.42605 18.3219L8.49742 19.4999ZM15.5026 19.4999C16.9292 18.3752 18.7528 17.0866 20.1833 15.4758C21.6395 13.8361 22.75 11.8026 22.75 9.1371H21.25C21.25 11.3345 20.3508 13.0282 19.0617 14.4798C17.7469 15.9603 16.0896 17.1271 14.574 18.3219L15.5026 19.4999ZM22.75 9.1371C22.75 6.42503 21.2153 4.07292 18.9992 3.05996C16.7359 2.02539 13.9015 2.44352 11.4596 4.98053L12.5404 6.02073C14.5983 3.88258 16.7639 3.68748 18.3756 4.42419C20.0346 5.18252 21.25 6.98623 21.25 9.1371H22.75ZM14.574 18.3219C14.0479 18.7366 13.5787 19.1005 13.1264 19.3648C12.6739 19.6293 12.3096 19.75 12 19.75V21.25C12.6904 21.25 13.3261 20.9854 13.8832 20.6599C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999L14.574 18.3219Z" />
                            </svg>
                        </button>)
                    }

                    {/* <button onClick={() => decreaseLike(id)}>{"<"}</button>
          <button onClick={() => increaseLike(id)}>{">"}</button> */}

                    {
                        card.likedUsers.map((colorId) => {
                            if (colorId !== myColorId) {
                                return (
                                    <div
                                        key={colorId}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 24 24" >
                                            <defs>
                                                <linearGradient id={`grad-${colorId}`} x1="0%" x2="100%">
                                                    <stop offset="0%" style={{ stopColor: COLORS_LIKE_1[colorId] }} />
                                                    <stop offset="100%" style={{ stopColor: COLORS_LIKE_2[colorId] }} />
                                                </linearGradient>
                                            </defs>
                                            <path style={{ fill: `url(#grad-${colorId})` }} d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" />
                                        </svg>
                                    </div>
                                );
                                // return (
                                //     <div className="text-xl"
                                //         key={colorId}
                                //         style={{
                                //             color: COLORS_LIKE[colorId],
                                //             transform: "scaleY(90%)",
                                //         }}
                                //     >
                                //         ♥
                                //     </div>
                                // );
                            }
                        })
                    }
                </div>
            }

            {selectedByMe
                ? (<button
                    className="bg-[#ff0000] font-bold text-white shadow-sm shadow-gray-600 text-sm rounded-full w-6 h-6"
                    style={{ position: "absolute", top: "0", left: "100%", transform: "translate(-50%, -50%)", zIndex: "16" }}

                    onPointerDown={() => deleteCard(id)}
                >
                    X
                </button>)
                : null}
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
                {/* <img
                    className="w-6"
                    src={transportRunIcon}
                /> */}
                {transportRunIcon}
            </button>
            <button
                className="flex justify-center items-center bg-white rounded-full w-7 h-7"
                style={{ position: "absolute", transform: "translate(17px, 10px)" }}
                onClick={() => onTransportBtnDown(id, TRANS_METHOD_BUS)}
            >
                {/* <img
                    className="w-6"
                    src={transportBusIcon}
                /> */}
                {transportBusIcon}
            </button>
            <button
                className="flex justify-center items-center bg-white rounded-full w-7 h-7"
                style={{ position: "absolute", transform: "translate(-17px, 10px)" }}
                onClick={() => onTransportBtnDown(id, TRANS_METHOD_CAR)}
            >
                {/* <img
                    className="w-6"
                    src={transportCarIcon}
                /> */}
                {transportCarIcon}
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
        <div className="flex flex-col justify-center items-center">
            {/* <img src={transportIcon} className="w-6 mt-2" /> */}
            {transportIcon}
            <div className="text-xs">
                {distance > 0 ? formatDist(distance) : "- km"}
            </div>
            <div className="text-xs">
                {duration > 0 ? formatDur(duration) : "- min"}
            </div>
        </div>
    );
}

function Line({ id, line, x1, y1, x2, y2, zoom, deleteLine, onTransportBtnDown }) {
    // const [isSelected, setIsSelected] = useState(false);
    const selectedCardId = useSelf((me) => me.presence.selectedCardId);
    const selectedByMe = selectedCardId === line.card1Id || selectedCardId === line.card2Id;

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
                    zIndex: "1",
                    // zIndex: "-5000",
                    //////////////////////
                    transform: `translate(${x}px, ${y}px) translateX(-50%) rotate(${theta}rad)`,
                    width: `${r}px`,
                }}
            />
            <div className="card-line-info justify-center rounded-full gap-0.5 shadow-sm shadow-gray-600 bg-yellow-200"
                style={{
                    borderColor: "black",
                    borderStyle: "solid",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",

                    // transition: "width 0.5s, height 0.5s",

                    position: "absolute",
                    zIndex: "2",
                    // zIndex: "-8000",

                    //////////////////////////////
                    width: "80px",
                    height: "80px",
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${zoom}, ${zoom})`,
                }}
            // onFocus={() => setIsSelected(true)}
            // onBlur={() => setIsSelected(false)}
            >
                {infoBody}
                {selectedByMe
                    ? (<button className="bg-[#ff0000] font-bold text-white shadow-sm shadow-gray-600 text-sm rounded-full w-6 h-6"
                        style={{
                            position: "absolute",
                            left: "80%",
                            top: "8%",
                        }}
                        onClick={(e) => deleteLine(e, id)}
                    >
                        X
                    </button>)
                    : null}
            </div>
        </>
    );
}

function PlanLine({ x1, y1, x2, y2, zoom }) {
    const r = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    const theta = Math.atan((y2 - y1) / (x2 - x1));

    return (
        <div className="absolute bg-blue-500"
            style={{
                position: "absolute",
                height: 8 * zoom,
                zIndex: "1",
                // zIndex: "-5000",
                //////////////////////
                transform: `translate(${x}px, ${y}px) translateX(-50%) rotate(${theta}rad)`,
                width: `${r}px`,
            }}
        />
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