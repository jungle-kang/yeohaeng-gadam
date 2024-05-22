import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider } from "/liveblocks.config";

import RoomContent from "../components/RoomContent";
import { getCookie } from "./TestBoard.tsx";
import { jwtDecode } from "jwt-decode";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Liveblocks API Room 세팅
const API_KEY = import.meta.env.VITE_LIVEBLOCKS_API_PUBLIC;

const client = createClient({
    publicApiKey: API_KEY,
});

const Room = () => {
    const [content, setContent] = useState(
        // 로딩 애니매이션
        <div className="flex items-center justify-center"
            style={{
                height: "calc(100vh - 88px)",
            }}
        >
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                    strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 4.411 2.686 8.166 6.708 9.708l1.292-2.417z"></path>
            </svg>
        </div>
    );
    const accessToken: string = getCookie('access_token') ? getCookie('access_token') : '';
    let id = null;
    let userName = "John Doe";
    // @ts-ignore
    if (accessToken !== '') {
        const decodedJwt = jwtDecode(accessToken);
        id = decodedJwt.id;
        userName = decodedJwt.firstName + decodedJwt.lastName;
    }
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();
    const roomProviderId = "whiteboard-" + roomId

    const initPresence = {
        userId: null, // DB에 저장된 사용자 ID
        colorId: null, // DB에 저장된 사용자 색상 ID
        cursor: null, // 커서 위치
        selectedPageId: null, // 선택된 페이지
        selectedCardId: null, // 선택된 카드
        lineStartCardId: null, // 간선 시작 카드
    };

    const initPages = new LiveMap();

    useEffect(() => {
        const enter = async () => {
            try {
                // console.log('room id:', roomId, ', user id:', id);
                const response = await fetch(`/api/room/enter?room_id=${roomId}&user_id=${id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                }).then(res => res.json());
                // console.log('enter response:', response);
                if (!response.data) {
                    toast.error('방에 인원이 가득찼습니다🌞');
                    navigate('/');
                }
            } catch (e) {
                console.error('enter error:', e);
            }
        }

        const initializeLB = async () => {
            // 사용자 인증
            try {
                const response = await fetch(`/api/auth/me/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                }).then(res => res.json());
                if (response.data) {
                    await enter();
                } else {
                    toast.error('로그인이 필요합니다');
                    navigate('/');
                }
            } catch (e) {
                console.log(e);
            }
            // 초기 pages 데이터 세팅
            try {
                const response = await fetch(`/api/room?id=${roomId}`, {
                    method: 'GET',
                    credentials: 'include',
                }).then(res => res.json());
                if (response.data) {
                    const startDate = new Date(response.data[0].start_date);
                    const endDate = new Date(response.data[0].end_date);
                    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24); // 여행 일차 수 계산
                    for (let i = 0; i <= days; i++) {
                        const newPage = new LiveObject({
                            name: `${i + 1}일차`,
                            plan: new LiveObject({
                                startId: null,
                                endId: null,
                                placeIds: [],
                            }),
                            cards: new LiveMap(),
                            lines: new LiveMap(),
                        });
                        initPages.set(`day-${i + 1}`, newPage);
                    }
                } else {
                    console.log("initializeLB(): no room found");
                }
            } catch (e) {
                console.log(e);
            }

            // 내 커서 색깔 불러오기
            let colorId = 5;
            try {
                const response = await fetch(`/api/entry/room?room_id=${roomId}`, {
                    method: 'GET',
                    credentials: 'include',
                }).then(res => res.json());

                const myIdx = response.data[0].users.findIndex((userId) => userId == id);
                colorId = response.data[0].colors[myIdx];
            } catch (e) {
                console.log(e);
            }

            setContent(
                <RoomProvider
                    id={roomProviderId}
                    initialPresence={initPresence}
                    initialStorage={{ pages: initPages }}
                >
                    <RoomContent roomId={roomId} userId={id} userName={userName} colorId={colorId} />
                </RoomProvider>
            );
        }
        if (accessToken) {
            initializeLB(); // 초기 Liveblocks 데이터 세팅
        } else {
            toast.error("방에 참여하려면 로그인을 해주세요😉");
            navigate('/');
        }
    }, []);

    return (
        <>
            {content}
        </>
    );
}

export default Room;
