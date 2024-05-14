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
}