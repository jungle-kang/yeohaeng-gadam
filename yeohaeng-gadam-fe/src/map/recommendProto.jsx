import React, { useState, useEffect } from 'react';

const places = [
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
];

export default function Recommend() {
    const [distRec, setDistRec] = useState([]);
    const [likeRec, setLikeRec] = useState([]);

    function generateRecommend() {
        // TODO
        setDistRec(11);
        setLikeRec(13);
    }

    return (
        <>
            <div>추천해드릴게요</div>
            <button className=""
                onClick={generateRecommend}
            >
                추천하기
            </button>
            <div>거리 기반 추천: {distRec}</div>
            <div>선호 기반 추천: {likeRec}</div>
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