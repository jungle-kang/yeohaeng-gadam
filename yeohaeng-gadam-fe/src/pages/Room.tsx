// import {useParams} from "react-router-dom";
import React, {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { createClient } from "@liveblocks/client";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useMutation } from "/liveblocks.config";

import RoomContent from "../components/RoomContent";
import {getCookie} from "./TestBoard.tsx";
import {jwtDecode} from "jwt-decode";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_KEY = import.meta.env.VITE_LIVEBLOCKS_API_PUBLIC;


const client = createClient({
  publicApiKey: API_KEY,
});

const Room = () => {
    const accessToken:string = getCookie('access_token')? getCookie('access_token'):'' ;
    let id = '';
    // @ts-ignore
    if(accessToken!== '') {
        id = jwtDecode(accessToken).id;
    }
    const navigate = useNavigate();
    const {roomId} = useParams<{roomId:string}>();
    const roomProviderId = "whiteboard-" + roomId
    
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
            try{
                console.log('room id:',roomId,', user id:',id);
                const response = await fetch(`/api/room/enter?room_id=${roomId}&user_id=${id}`,{
                    method: 'PATCH',
                    credentials: 'include'
                }).then(res =>res.json())
                console.log('enter response:',response);
                if (!response.data){
                    // alert('로그인이 필요합니다.111');
                    toast.error("방에 인원수가 가득찼어요😓")
                    navigate('/');
                }
            }catch(e){
                console.error('enter error:',e);
            }
        }
        const meCheck = async () =>{
            try{
                const response = await fetch(`/api/auth/me/${id}`,{
                    method: 'GET',
                    credentials: 'include',
                }).then(res=>res.json())
                if(response.data) {
                    enter();
                }else{
                    alert('로그인이 필요합니다.222');
                    navigate('/');
                }
            }catch(e){
                console.log(e);
            }
        }
        if (accessToken){
            meCheck();
        }else {
            // alert('방에 참가하려면 로그인을 해주세요.');
            toast.error("방에 참여하려면 로그인을 해주세요😉")
            navigate('/');
        }
    }, []);
    return (
        <RoomProvider
          id={roomProviderId}
          initialPresence={{
            cursor: null,
            selectedPageId: null,
            selectedCardId: null,
            lineStartCardId: null,
            // selectedShape: null, /////////
            // lineStartShape: null, //////
          }}
          initialStorage={{
            pages: new LiveMap(),
            // cards: new LiveMap(),
            // shapes: new LiveMap(), ///////////
            // lines: new LiveMap(),
          }}
        >
          <RoomContent roomId={roomId} userId={id}/>
        </RoomProvider>
        )
        
}

export default Room