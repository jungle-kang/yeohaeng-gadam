import React, { useState } from 'react';
import { permutations } from 'itertools';
import { toast } from "react-toastify";

import {
  useStorage,
  useMutation,
  useMyPresence,
} from "/liveblocks.config";

const DEAFULT_PLACE_NUM = 4;
const MAX_LIKES = 4; // 최대 좋아요 수; 이상적으로는 방 정보에서 받아옴
const MAX_DISCOUNT = 0.8; // 좋아요 수에 비례한 최대 거리 감쇠 계수
const PLACE_LIMIT = 16; // 경로 계산 목적지 수 한도; 초과하면 휴리스틱 적용

export default function SuggestCourse({ setIsSuggestOpen }) {
  const [pathDisc, setPathDisc] = useState("");
  const [placeNum, setPlaceNum] = useState(DEAFULT_PLACE_NUM);
  const [suggestIds, setSuggestIds] = useState([]);

  const [{ selectedPageId }] = useMyPresence();
  const pages = useStorage((root) => root.pages);

  // 거리 행렬 생성
  const getDistMatrix = (places) => {
    return (
      places.map((place1) =>
        places.map((place2) =>
          scoreFuncLikeSub(place1, place2)
        )
      )
    );
  };

  // 타원 거리 기반 제외 알고리즘
  const trimCandidatesOval = (distMatrix, candidateNum, initialCandidates) => {
    let candidates = initialCandidates;

    // 각 목적지에서 출발지와 도착지까지의 거리 합 배열
    const scoreArr = distMatrix.map((distArr) => {
      const curScore = initialCandidates.reduce((acc, cur) => {
        return acc + distArr[cur];
      }, 0);

      return curScore;
    });

    // candidateNum만큼의 목적지를 선택
    for (let i = initialCandidates.length; i < candidateNum; i++) {
      // 출발지와 도착지까지의 거리 합이 가장 작은 목적지를 선택
      let minScore = Infinity;
      let minCandidate = null;

      scoreArr.forEach((curScore, idx) => {
        if (candidates.includes(idx)) {
          return;
        }
        if (curScore < minScore) {
          minScore = curScore;
          minCandidate = idx;
        }
      });

      candidates = [...candidates, minCandidate];
    }

    return candidates;
  };

  // 가장 짧은 경로 찾는 함수
  const findShortestPath = (waypoints, distMatrix, start, end, placeNum) => {
    let minScore = Infinity;
    let bestPath = [];

    const startIdx = waypoints.findIndex((i) => i === start);
    const endIdx = waypoints.findIndex((i) => i === end);

    const restWaypoints = startIdx < endIdx // 출발지와 도착지를 waypoints에서 제외
      ? [...waypoints.slice(0, startIdx), ...waypoints.slice(startIdx + 1, endIdx), ...waypoints.slice(endIdx + 1)]
      : [...waypoints.slice(0, endIdx), ...waypoints.slice(endIdx + 1, startIdx), ...waypoints.slice(startIdx + 1)];

    // 경로로 가능한 모든 경우의 수 계산
    const placePerm = permutations(restWaypoints, placeNum - 2);

    placePerm.forEach((perm) => {
      const path = [start, ...perm, end];
      const curScore = path.reduce((acc, cur, i) => {
        if (i === path.length - 1) return acc;
        const curDist = distMatrix[cur][path[i + 1]];
        return acc + curDist;
      }, 0);

      if (curScore < minScore) {
        minScore = curScore;
        bestPath = path;
      }
    });

    return { bestPath, minScore };
  };

  // AWS Lambda
  // const lambdaCall = async ({ places, placeCardIds, startIdx, endIdx, placeNum, PLACE_LIMIT, MAX_DISCOUNT, MAX_LIKES }) => {
  //   try {
  //     const response = await fetch('/lambda', {
  //       method: 'POST',
  //       credentials: 'include',
  //       body: JSON.stringify({
  //         "places": places,
  //         "placeCardIds": placeCardIds,
  //         "startIdx" : startIdx,
  //         "endIdx" : endIdx,
  //         "placeNum" : placeNum,
  //         "PLACE_LIMIT" : PLACE_LIMIT,
  //         "MAX_DISCOUNT": MAX_DISCOUNT,
  //         "MAX_LIKES": MAX_LIKES
  //       }),
  //     });
  //     const result = await response.json();
  //     // console.log("lambda response: ", result);
  //     return result;
  //   } catch (e) {
  //     console.error('lambda fail: ', e);
  //     return null;
  //   }
  // };

  const handleFindPath = (placeNum) => {
    const plan = pages.get(selectedPageId).plan;
    const startId = plan.startId;
    const endId = plan.endId;
    if (!startId || !endId) {
      toast.info("출발지와 도착지를 설정해주세요!")
      return;
    }

    // Liveblocks로부터 카드 데이터 받기
    const cards = pages.get(selectedPageId).cards;
    const cardIds = Array.from(pages.get(selectedPageId).cards.keys());
    const placeCardIds = cardIds.filter((cardId) => (
      cards.get(cardId).cardType === "place"
    ));

    if (placeCardIds.length < placeNum) {
      toast.info("목적지 수가 카드 수보다 많아요!")

      return;
    }

    const places = placeCardIds.map((cardId) => cards.get(cardId));
    const startIdx = placeCardIds.findIndex((cardId) => cardId === startId);
    const endIdx = placeCardIds.findIndex((cardId) => cardId === endId);

    const distMatrix = getDistMatrix(places); // 거리 행렬 생성

    // 완전 탐색에 사용할 목적지 후보; 목적지 수가 너무 많으면 휴리스틱 사용
    const candidates = placeCardIds.length > PLACE_LIMIT
      ? trimCandidatesOval(distMatrix, PLACE_LIMIT, [startIdx, endIdx]) // 너무 많으면 알고리즘으로 걸러내기
      : [...Array(places.length).keys()] // 많지 않으면 모두 사용

    const result = findShortestPath(
      candidates, // 입력할 방문 장소 인덱스의 배열
      distMatrix, // 거리 행렬
      startIdx,   // 출발 장소 인덱스
      endIdx,     // 도착 장소 인덱스
      placeNum,   // 방문할 장소의 총 개수 (출발 도착 포함)
    );

    const bestPath = result["bestPath"];

    setSuggestIds(bestPath.slice());

    setPathDisc(
      bestPath.reduce((acc, cur, i) => {
        if (i === 0) return places[cur].placeName;
        return acc + "👉" + places[cur].placeName;
      }, "")
    );
  };

  // AWS Lambda
  // const handleFindPathLambda = async (placeNum) => {
  //   const plan = pages.get(selectedPageId).plan;
  //   const startId = plan.startId;
  //   const endId = plan.endId;
  //   if (!startId || !endId) {
  //     toast.info("출발지와 도착지를 설정해주세요!")
  //     return;
  //   }

  //   // Liveblocks로부터 카드 데이터 받기
  //   const cards = pages.get(selectedPageId).cards;
  //   const cardIds = Array.from(pages.get(selectedPageId).cards.keys());
  //   const placeCardIds = cardIds.filter((cardId) => (
  //     cards.get(cardId).cardType === "place"
  //   ));

  //   if (placeCardIds.length < placeNum) {
  //     toast.info("목적지 수가 카드 수보다 많아요!")

  //     return;
  //   }

  //   const places = placeCardIds.map((cardId) => cards.get(cardId));
  //   const startIdx = placeCardIds.findIndex((cardId) => cardId === startId);
  //   const endIdx = placeCardIds.findIndex((cardId) => cardId === endId);

  //   // console.log("lambda call args: ",{
  //   //   places, placeCardIds, startIdx, endIdx, placeNum, PLACE_LIMIT, MAX_DISCOUNT, MAX_LIKES
  //   // });

  //   const result = await lambdaCall({
  //     places, placeCardIds, startIdx, endIdx, placeNum, PLACE_LIMIT, MAX_DISCOUNT, MAX_LIKES
  //   });

  //   //////////////////////////////////////////////////////////////////////////
  //   // input: places, placeCardIds, PLACE_LIMIT, startIdx, endIdx, placeNum, MAX_DISCOUNT, MAX_LIKES

  //   // const distMatrix = getDistMatrix(places); // 거리 행렬 생성

  //   // // let candidates = [...Array(places.length).keys()]; // 완전 탐색에 사용할 목적지 후보

  //   // // 목적지 수가 너무 많으면 휴리스틱 사용
  //   // if (placeCardIds.length > PLACE_LIMIT) {
  //   //   console.log("handleFindPath(): too many places, use heuristics");
  //   //   // 프림 알고리즘 사용하여 출발/도착지점과 가까운 목적지를 걸러내기
  //   //   // candidates = trimCandidates(distMatrix, PLACE_LIMIT, [startIdx, endIdx]);

  //   // }
  //   // // 완전 탐색에 사용할 목적지 후보
  //   // const candidates = placeCardIds.length > PLACE_LIMIT
  //   //   // ? trimCandidatesPrim(distMatrix, PLACE_LIMIT, [startIdx, endIdx]) // 너무 많으면 프림 알고리즘으로 걸러내기
  //   //   ? trimCandidatesOval(distMatrix, PLACE_LIMIT, [startIdx, endIdx]) // 너무 많으면 알고리즘으로 걸러내기
  //   //   : [...Array(places.length).keys()] // 많지 않으면 모두 사용

  //   // // console.log("Filtered cards: ", placeCardIds);

  //   // console.log("places: ", places);

  //   // const result = findShortestPath(
  //   //   candidates, // 입력할 방문 장소 인덱스의 배열
  //   //   // places,     // 방문 장소 리스트 (좋아요 확인용)
  //   //   distMatrix, // 거리 행렬
  //   //   startIdx,   // 출발 장소 인덱스
  //   //   endIdx,     // 도착 장소 인덱스
  //   //   placeNum,   // 방문할 장소의 총 개수 (출발 도착 포함)
  //   // );

  //   //////////////////////////////////////////////////////////////////////////

  //   console.log(result);

  //   const bestPath = result["bestPath"];

  //   console.log("bestPath ", bestPath);

  //   setSuggestIds(bestPath.slice());

  //   setPathDisc(
  //     bestPath.reduce((acc, cur, i) => {
  //       if (i === 0) return places[cur].placeName;
  //       return acc + "👉" + places[cur].placeName;
  //     }, "")
  //   );
  // };

  // const handleSelectChange = (item) => {
  //   setPlaceNum(item);
  // }

  /////////////////////////////////// 패널 조작

  const setCardAsStart = useMutation(({ storage, self }) => {
    const selectedPageId = self.presence.selectedPageId;
    const selectedCardId = self.presence.selectedCardId;
    if (selectedCardId == null) {
      return;
    }

    const card = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);
    if (card.get("cardType") !== "place") {
      return;
    }

    const plan = storage.get("pages").get(selectedPageId).get("plan");

    plan.update({
      startId: selectedCardId,
    })

    if (plan.get("endId") === selectedCardId) {
      plan.update({
        endId: null,
      })
    }
  }, []);

  const setCardAsEnd = useMutation(({ storage, self }) => {
    const selectedPageId = self.presence.selectedPageId;
    const selectedCardId = self.presence.selectedCardId;
    if (selectedCardId == null) {
      return;
    }

    const card = storage.get("pages").get(selectedPageId).get("cards").get(selectedCardId);
    if (card.get("cardType") !== "place") {
      return;
    }

    const plan = storage.get("pages").get(selectedPageId).get("plan");

    plan.update({
      endId: selectedCardId,
    })

    if (plan.get("startId") === selectedCardId) {
      plan.update({
        startId: null,
      })
    }
  }, []);

  const onApplyBtnClick = useMutation(({ storage, self }, suggestPath) => {
    if (suggestPath.length === 0) {
      return;
    }

    const selectedPageId = self.presence.selectedPageId;
    const cards = storage.get("pages").get(selectedPageId).get("cards");
    const cardIds = Array.from(cards.keys());
    const placeCardIds = cardIds.filter((cardId) => (
      cards.get(cardId).get("cardType") === "place"
    ));

    const plan = storage.get("pages").get(selectedPageId).get("plan");

    const newPlan = suggestPath.reduce((acc, cur, i) => {
      return [...acc, placeCardIds[cur]];
    }, []);

    plan.update({
      placeIds: newPlan,
    })

    setIsSuggestOpen(false);
  }, []);

  const cards = pages && pages.get(selectedPageId).cards;

  const startCardId = useStorage((root) =>
    root.pages.get(selectedPageId).plan.startId
  );
  const endCardId = useStorage((root) =>
    root.pages.get(selectedPageId).plan.endId
  );

  const startPlaceName = cards && startCardId && cards.get(startCardId) && cards.get(startCardId).placeName;
  const endPlaceName = cards && endCardId && cards.get(endCardId) && cards.get(endCardId).placeName;

  return (
    <div>
      <div className="flex">
        <div className="nanumbarungothic mt-1.5 ml-2">
          목적지 수
        </div>

        <input className="m-1 bg-gray-200 rounded-md pl-2 w-10"
          type="number" min="2" max="8" defaultValue={DEAFULT_PLACE_NUM}
          onChange={(e) => {
            setPlaceNum(e.target.value)
          }}
        />

        <button
          className="bg-white ring-1 text-sm nanumbarungothic hover:bg-gray-200 px-1 rounded-md ml-1.5 mt-1 px-1"
          onClick={setCardAsStart}
        >
          출발설정
        </button>
        <button className="bg-white ring-1 text-sm nanumbarungothic hover:bg-gray-200 rounded-md ml-1.5 mt-1 px-1"
          onClick={setCardAsEnd}
        >
          도착설정
        </button>
        <button className="bg-white ring-1 text-sm nanumbarungothic hover:bg-gray-200 rounded-md ml-1.5 mt-1 px-1"
          onClick={() => handleFindPath(placeNum)}
        >
          추천하기
        </button>
        <button className="bg-white ring-1 text-sm nanumbarungothic hover:bg-gray-200 rounded-md ml-1.5 mt-1 px-1"
          onClick={() => onApplyBtnClick(suggestIds)}
        >
          적용하기
        </button>
        {/* <button className="bg-white ring-1 text-sm nanumbarungothic hover:bg-gray-200 rounded-md ml-1.5 mt-1 px-1"
          onClick={() => handleFindPathLambda(placeNum)}
          // onClick={lambdaTest}
        >
          람다
        </button> */}
      </div>

      <div className="flex ml-2 mt-3">
        <div className="nanumbarungothic text-blue-700 w-28">
          출발 지점
        </div>
        <div className="nanumbarungothic-light w-full">
          {startPlaceName}
        </div>
      </div>
      <div className="flex ml-2">
        <div className="nanumbarungothic text-blue-700 w-28">
          도착 지점
        </div>
        <div className="nanumbarungothic-light w-full">
          {endPlaceName}
        </div>
      </div>
      <div className="flex ml-2">
        <div className="nanumbarungothic text-blue-700 w-28">
          추천 경로
        </div>
        <div className="nanumbarungothic-light w-full">
          {pathDisc}
        </div>
      </div>
    </div>
  );
}


// 좋아요 하나당 거리 20% 차감하여 점수 계산
function scoreFuncLikeSub(place1, place2) {
  const score =
    getDistFromCord(place1.placeX, place1.placeY, place2.placeX, place2.placeY)
    * (1 - MAX_DISCOUNT / MAX_LIKES * place1.likedUsers.length)
    * (1 - MAX_DISCOUNT / MAX_LIKES * place2.likedUsers.length);

  return score;
}

// 각도에서 라디안으로 변환
function deg2rad(deg) {
  return deg * (Math.PI / 180);
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

