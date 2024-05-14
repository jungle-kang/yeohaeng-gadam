import React, { useState, useEffect } from 'react';
import { permutations } from 'itertools';
import SelectBox from '../components/SelectBox';

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

// console.log("PERM TEST: ", permutations([1, 2, 3, 4], 3));

// const testperm = permutations([1, 2, 3, 4], 3);
// testperm.forEach((perm) => {
//     console.log(perm);
// })

const placesDummy = [
  {
    placeName: "Haeundae Beach",
    placeX: 35.1585,
    placeY: 129.1600,
    likes: 4,
  },
  {
    placeName: "Gwangalli Beach",
    placeX: 35.1568,
    placeY: 129.1191,
    likes: 3,
  },
  {
    placeName: "Gamcheon Culture Village",
    placeX: 35.0988,
    placeY: 129.0107,
    likes: 1,
  },
  {
    placeName: "Busan Tower",
    placeX: 35.0975,
    placeY: 129.0359,
    likes: 3,
  },
  {
    placeName: "Jagalchi Fish Market",
    placeX: 35.0965,
    placeY: 129.0349,
    likes: 4,
  },
  {
    placeName: "Beomeosa Temple",
    placeX: 35.2164,
    placeY: 129.0596,
    likes: 1,
  },
  {
    placeName: "Taejongdae Park",
    placeX: 35.0919,
    placeY: 129.0230,
    likes: 4,
  },
  {
    placeName: "Dalmaji Hill",
    placeX: 35.1634,
    placeY: 129.0630,
    likes: 0,
  },
  {
    placeName: "Yongdusan Park",
    placeX: 35.1028,
    placeY: 129.0368,
    likes: 2,
  },
  {
    placeName: "Shinsegae Centum City",
    placeX: 35.1672,
    placeY: 129.1320,
    likes: 2,
  },
  {
    placeName: "UN Memorial Cemetery",
    placeX: 35.1532,
    placeY: 129.1183,
    likes: 2,
  },
  {
    placeName: "Seomyeon",
    placeX: 35.1577,
    placeY: 129.0565,
    likes: 5,
  },
  {
    placeName: "Nampo-dong",
    placeX: 35.0979,
    placeY: 129.0346,
    likes: 4,
  },
  {
    placeName: "Igidae Park",
    placeX: 35.1283,
    placeY: 129.1003,
    likes: 3,
  },
  {
    placeName: "Gukje Market",
    placeX: 35.0981,
    placeY: 129.0304,
    likes: 3,
  },
  {
    placeName: "BIFF Square",
    placeX: 35.0983,
    placeY: 129.0333,
    likes: 4,
  },
  {
    placeName: "Songdo Beach",
    placeX: 35.0746,
    placeY: 129.0200,
    likes: 3,
  },
  {
    placeName: "Hwangnyeongsan Mountain",
    placeX: 35.1536,
    placeY: 129.0593,
    likes: 1,
  },
  {
    placeName: "Oryukdo Skywalk",
    placeX: 35.0913,
    placeY: 129.0850,
    likes: 3,
  },
  {
    placeName: "Haedong Yonggungsa Temple",
    placeX: 35.1901,
    placeY: 129.2150,
    likes: 4,
  }
];

const distanceMatrix = null;

// 거리 행렬을 계산합니다.
// const distanceMatrix = places.map((place1) =>
//   places.map((place2) =>
//     getDistFromCord(place1.placeY, place1.placeX, place2.placeY, place2.placeX)
//   )
// );

// const PLACE_NUM = 4;

// console.log("distMat: ", distanceMatrix);



export default function Recommend() {
  const [distRec, setDistRec] = useState([]);
  const [likeRec, setLikeRec] = useState([]);
  const [placeNum, setPlaceNum] = useState(6);

  const [{ userId, cursor, selectedPageId, selectedCardId, lineStartCardId }, updateMyPresence] = useMyPresence();
  const pages = useStorage((root) => root.pages);
  // const cardIds = useStorage(
  //   (root) => Array.from(root.pages.get(selectedPageId).cards.keys()),
  //   shallow
  // );

  // function generateRecommend() {
  //     // TODO
  //     setDistRec(11);
  //     setLikeRec(13);
  // }

  // 장소 간 거리 행렬
  const distMatrix = distanceMatrix;

  // 순열 생성 함수
  const getPermutations = (arr, selectNumber) => {
    const results = [];
    if (selectNumber === 1) return arr.map((value) => [value]);
    arr.forEach((fixed, index, origin) => {
      const rest = [...origin.slice(0, index), ...origin.slice(index + 1)];
      const permutations = getPermutations(rest, selectNumber - 1);
      const attached = permutations.map((permutation) => [fixed, ...permutation]);
      results.push(...attached);
    });
    return results;
  };

  // 가장 짧은 경로 찾는 함수
  const findShortestPath = (waypoints, distMatrix, places, start, end, placeNum, scoreFunc) => {
    console.log("waypoints: ", waypoints);

    let shortestDistance = Infinity;
    let shortestPath = [];

    const restWaypoints = start < end
      ? [...waypoints.slice(0, start), ...waypoints.slice(start + 1, end), ...waypoints.slice(end + 1)]
      : [...waypoints.slice(0, end), ...waypoints.slice(end + 1, start), ...waypoints.slice(start + 1)];
    // const restWaypoints = waypoints.slice(0, 1);

    console.log("restWaypoints: ", restWaypoints);

    // const permutations = getPermutations(restWaypoints, placeNum - 2);
    const placePerm = permutations(restWaypoints, placeNum - 2);

    console.log("permutations: ", placePerm);
    placePerm.forEach((perm) => {
      const path = [start, ...perm, end];
      const distance = path.reduce((acc, cur, i) => {
        if (i === path.length - 1) return acc;
        // const curDist = distMatrix[cur][path[i + 1]];
        const curDist = scoreFunc(places[cur], places[path[i + 1]]);
        return acc + curDist;
      }, 0);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        shortestPath = path;
      }
    });
    return { shortestPath, shortestDistance };
  };

  // React 상태 및 실행 로직
  const [result, setResult] = useState({ shortestPath: [], shortestDistance: 0 });

  const handleFindPath = (placeNum) => {
    // Liveblocks로부터 카드 데이터 받기
    const cards = pages.get(selectedPageId).cards;
    const cardIds = Array.from(pages.get(selectedPageId).cards.keys());
    const filteredCardIds = cardIds.filter((cardId) => (
      cards.get(cardId).cardType === "place"
    ));

    const places = filteredCardIds.map((cardId) => cards.get(cardId));

    // console.log("Filtered cards: ", filteredCardIds);

    // filteredCardIds.map((cardId) => {
    //   console.log(cards.get(cardId));
    // })

    console.log("places: ", places);

    // 거리 행렬을 계산합니다.
    const distanceMatrix = places.map((place1) =>
      places.map((place2) =>
        getDistFromCord(place1.placeX, place1.placeY, place2.placeX, place2.placeY)
      )
    );

    // console.log("distmat: ", distanceMatrix); 

    // 거리 기반 추천
    const { shortestPath, shortestDistance } = findShortestPath(
      [...Array(places.length).keys()], // 입력할 방문 장소 인덱스의 배열
      distanceMatrix,                   // 방문 장소의 거리 행렬
      places,                           // 방문 장소 리스트 (좋아요 확인용)
      0,                                // 출발 장소 인덱스
      1,                                // 도착 장소 인덱스
      placeNum,                         // 방문할 장소의 총 개수 (출발 도착 포함)
      scoreFuncDist,                    // 두 장소에 대한 점수 계산 함수 (낮을수록 좋음)
    );

    // console.log("path: ", shortestPath, ", dist: ", shortestDistance);

    shortestPath.reduce((acc, cur, i) => {
      if (i === shortestPath.length - 1) return acc;
      const curDist = distanceMatrix[cur][shortestPath[i + 1]];
      console.log(`${places[cur].placeName}(${cur}) to ${places[shortestPath[i + 1]].placeName}(${shortestPath[i + 1]}) dist: ${curDist}`);
      return acc + curDist;
    }, 0);

    setDistRec(
      shortestPath.reduce((acc, cur, i) => {
        if (i === 0) return places[cur].placeName;
        return acc + "->" + places[cur].placeName;
      }, "")
      + `, 거리: ${shortestDistance}km`
    );

    // 좋아요 기반 추천
    const likeResult = findShortestPath(
      [...Array(places.length).keys()], // 입력할 방문 장소 인덱스의 배열
      distanceMatrix,                   // 방문 장소의 거리 행렬
      places,                           // 방문 장소 리스트 (좋아요 확인용)
      0,                                // 출발 장소 인덱스
      1,                                // 도착 장소 인덱스
      placeNum,                         // 방문할 장소의 총 개수 (출발 도착 포함)
      scoreFuncLikeSub,                    // 두 장소에 대한 점수 계산 함수 (낮을수록 좋음)
    );

    const likePath = likeResult["shortestPath"];
    const likeDistance = likeResult["shortestDistance"];

    console.log("path: ", likePath, ", dist: ", likeDistance);

    likePath.reduce((acc, cur, i) => {
      if (i === likePath.length - 1) return acc;
      const curDist = distanceMatrix[cur][likePath[i + 1]];
      console.log(`${places[cur].placeName}(${cur}) to ${places[likePath[i + 1]].placeName}(${likePath[i + 1]}) dist: ${curDist}`);
      return acc + curDist;
    }, 0);

    setLikeRec(
      likePath.reduce((acc, cur, i) => {
        if (i === 0) return places[cur].placeName;
        return acc + "->" + places[cur].placeName;
      }, "")
      + `, 거리: ${likeDistance}km`
    );

  };

  const handleSelectChange = (item) => {
    setPlaceNum(item);
  }

  return (
    <>
      <div>코스 추천</div>
      <SelectBox selectList={[2, 3, 4, 5, 6, 7, 8]} defaultValue={6}
        onSelectChange={handleSelectChange} />
      <button className=""
        // onClick={generateRecommend}
        onClick={() => handleFindPath(placeNum)}
      >
        추천하기
      </button>
      <div>거리 기반 추천: {distRec}</div>
      <div>선호 기반 추천: {likeRec}</div>
    </>
  );
}

/////////////////////////////// 장소 점수 계산 함수 ///////////////////////////////
// 거리가 점수
function scoreFuncDist(place1, place2) {
  const score = getDistFromCord(place1.placeX, place1.placeY, place2.placeX, place2.placeY);
  return score;
}

// 좋아요 개수 +1로 거리를 나눔
function scoreFuncLike(place1, place2) {
  const score =
    getDistFromCord(place1.placeX, place1.placeY, place2.placeX, place2.placeY)
    / (1 + place1.likedUsers.length + place2.likedUsers.length);

  return score;
}

// 좋아요 하나당 거리 10% 차감
function scoreFuncLikeSub(place1, place2) {
  const score =
    getDistFromCord(place1.placeX, place1.placeY, place2.placeX, place2.placeY)
    // * (1 - 0.1125 * place1.likedUsers.length - 0.1125 * place2.likedUsers.length);
    * (1 - 0.2 * place1.likedUsers.length)
    * (1 - 0.2 * place2.likedUsers.length);

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

