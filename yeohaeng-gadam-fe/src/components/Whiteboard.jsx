import { useState, useEffect, useRef } from "react";
import {
  useStorage,
  useEventListener,
  useMyPresence,
} from "/liveblocks.config";
import { shallow } from "@liveblocks/react";

import Canvas from "./whiteboard/Canvas";

export default function Whiteboard({ myUserId, myColorId }) {
  const [{ selectedPageId }, updateMyPresence] = useMyPresence();
  // 핑 이벤트 리스트
  const [pingEventList, setPingEventList] = useState([]);

  const pageIds = useStorage(
    (root) => Array.from(root.pages.keys()).sort(),
    shallow
  );

  // 일차 탭 클릭 시 실행
  const onClickTab = (e, pageId) => {
    updateMyPresence({ selectedPageId: pageId });
  };

  // 핑 이벤트 수신
  useEventListener(({ event, user }) => {
    if (event.type === "PING") {
      setPingEventList((prev) => {
        const modifiedPingEventList = prev.filter((pingEvent) => (
          pingEvent.userId !== user.presence.userId
        )); // 핑을 찍은 사용자의 이전 핑은 삭제
        const newPingEvent = {
          userId: user.presence.userId,
          colorId: user.presence.colorId,
          pageId: event.pageId,
          x: event.x,
          y: event.y,
          pingType: event.pingType,
        };
        return ([...modifiedPingEventList, newPingEvent]);
      });
    }
  });

  const pingedPageList = pingEventList.map((pingEvent) => (pingEvent.pageId));

  // liveblocks가 로딩되었는지 확인용
  const pages = useStorage((root) => root.pages);

  useEffect(() => {
    // 로딩 완료 시 첫 탭을 현재 탭으로
    if (pages != null) {
      updateMyPresence({
        selectedPageId: pageIds[0],
        userId: myUserId,
        colorId: myColorId,
      });
    }
  }, [pages == null])

  // 로딩 애니매이션
  if (pages == null) {
    return (
      <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
            strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 4.411 2.686 8.166 6.708 9.708l1.292-2.417z"></path>
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-9 pt-1 flex items-end">
        {pageIds.map((pageId) => {
          return pageId === selectedPageId
            ? (
              // 활성화된 탭
              <button
                className="pl-2 items-center h-full flex w-[12%] min-w-[96px] rounded-t-xl mr-0.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold align-middle"
                key={pageId}
                onClick={(e) => onClickTab(e, pageId)}
              >
                {pages.get(pageId).name}
              </button>
            )
            : (
              pingedPageList.includes(pageId)
                ? (
                  // 핑 된 탭
                  <button
                    className="relative pl-2 items-center h-full flex w-1/12 min-w-[60px] rounded-t-xl mr-0.5 bg-gradient-to-r from-yellow-200 to-yellow-400"
                    key={pageId}
                    onClick={(e) => onClickTab(e, pageId)}
                  >
                    {pages.get(pageId).name}
                    <span className="absolute flex h-3 w-3 ml-3.5 mb-3"
                      style={{
                        left: "100%",
                        top: "0%",
                        transform: "translate(-250%,40%)"
                      }}
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </button>
                )
                : (
                  // 이외 탭
                  <button
                    className="pl-2 items-center h-[80%] text-sm flex w-1/12 min-w-[50px] rounded-t-xl mr-0.5 bg-gray-200 hover:bg-gray-300"
                    key={pageId}
                    onClick={(e) => onClickTab(e, pageId)}
                  >
                    {pages.get(pageId).name}
                  </button>
                )
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
}