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
                    colorId: user.presence.colorId,
                    pageId: event.pageId,
                    x: event.x,
                    y: event.y,
                    pingType: event.pingType,
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
                                    // 그냥 탭
                                    <button
                                        className="pl-2 items-center h-[80%] text-sm flex w-1/12 min-w-[50px] rounded-t-xl mr-0.5 bg-gray-200 hover:bg-gray-300"
                                        key={pageId}
                                        onClick={(e) => onClickTab(e, pageId)}
                                    >
                                        {pages.get(pageId).name}
                                    </button>
                                )
                        );

                    //
                    // const tabColor = pageId === selectedPageId
                    //     ? "green"
                    //     : pingedPageList.includes(pageId)
                    //         ? "yellow"
                    //         : "grey";
                    // const height = page === selectedPageId
                    //     ? ""
                    // return (
                    //     <button className="h-full flex w-1/12 rounded-t-xl ml-0.5"
                    //             key={pageId}
                    //             style={{ backgroundColor: tabColor }}
                    //             onClick={(e) => onClickTab(e, pageId)}
                    //     >
                    //       {pages.get(pageId).name}
                    //     </button>
                    // );
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
}