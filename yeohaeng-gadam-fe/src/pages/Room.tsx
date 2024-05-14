// import {useParams} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useMutation } from "/liveblocks.config";

import RoomContent from "../components/RoomContent";
import { getCookie } from "./TestBoard.tsx";
import { jwtDecode } from "jwt-decode";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Liveblocks API Room 세팅
const API_KEY = import.meta.env.VITE_LIVEBLOCKS_API_PUBLIC;

const client = createClient({
    publicApiKey: API_KEY,
});

const Room = () => {
    const [content, setContent] = useState(<div>입장 중...</div>);
    const accessToken: string = getCookie('access_token') ? getCookie('access_token') : '';
    let id = null;
    // @ts-ignore
    if (accessToken !== '') {
        id = jwtDecode(accessToken).id;
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

    // let content = <div>입장 중...</div>;

    useEffect(() => {
        const enter = async () => {
            <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            try {
                console.log('room id:', roomId, ', user id:', id);
                const response = await fetch(`/api/room/enter?room_id=${roomId}&user_id=${id}`, {
                    method: 'PATCH',
                    credentials: 'include'
                }).then(res => res.json());
                console.log('enter response:', response);
                if (!response.data) {
                    alert('로그인이 필요합니다.111');
                    navigate('/');
                }
            } catch (e) {
                console.error('enter error:', e);
            }
        }
        const meCheck = async () => {
            try {
                const response = await fetch(`/api/auth/me/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                }).then(res => res.json());
                if (response.data) {
                    enter();
                } else {
                    alert('로그인이 필요합니다.222');
                    navigate('/');
                }
            } catch (e) {
                console.log(e);
            }
        }
        const initializeLB = async () => {
            try {
                const response = await fetch(`/api/room?id=${roomId}`, {
                    method: 'GET',
                    credentials: 'include',
                }).then(res => res.json());
                if (response.data) {
                    // console.log("GET res: ", response.data);
                    const startDate = new Date(response.data[0].start_date);
                    const endDate = new Date(response.data[0].end_date);
                    // console.log("start date: ", startDate);
                    // console.log("end date: ", endDate);
                    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                    // console.log("days: ", days);
                    for (let i = 0; i <= days; i++) {
                        const newPage = new LiveObject({
                            name: `${i + 1}일차`,
                            plan: new LiveObject(),
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
        }
        if (accessToken) {
            meCheck();
            initializeLB(); // 초기 Liveblocks 데이터 세팅
            // console.log("initPages: ", initPages);
            const colorId = 0; ///////////////////////////////////////////////////////////
            setContent(
                <RoomProvider
                    id={roomProviderId}
                    initialPresence={initPresence}
                    initialStorage={{ pages: initPages }}
                >
                    <RoomContent roomId={roomId} userId={id} colorId={colorId} />
                </RoomProvider>
            );
            // setReady(true); // 화이트보드 로딩 준비 완료
        } else {
            // alert('방에 참가하려면 로그인을 해주세요.');
            toast.error("방에 참여하려면 로그인을 해주세요😉")
            navigate('/');
        }
    }, []);

    // const content = ready
    //     ? <RoomProvider
    //         id={roomProviderId}
    //         initialPresence={initPresence}
    //         initialStorage={{pages: initPages}}
    //     >
    //         <RoomContent roomId={roomId} userId={id} />
    //     </RoomProvider>
    //     : <div>입장 중...</div>

    return content;

    // return (
    //     {
    //         id === 
    //         ? <div>입장 중...</div>
    //         : (<RoomProvider
    //             id={roomProviderId}
    //             initialPresence={initPresence}
    //             initialStorage={initStorage}
    //         >
    //             <RoomContent roomId={roomId} userId={id} />
    //         </RoomProvider>)
    // }
    // );

}

export default Room