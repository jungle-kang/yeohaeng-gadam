import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000'; // 서버 주소에 맞게 설정하세요

// RTCPeerConnection을 생성할 때의 config
const pc_config = {
    iceServers: [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ],
        },
    ],
};

export function VideoTest() {
    //Signaling Server와 통신할 socket
    const socketRef = useRef<Socket>();
    // pc: RTCPeerConnetion
    const pcRef = useRef<RTCPeerConnection>();
    // 본인의 video, audio를 재생할 video 태그의 ref
    const localVideoRef = useRef<HTMLVideoElement>(null);
    //상대방의 video, audio를 재생할 video 태그의 ref
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const setVideoTracks = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            if (!(pcRef.current && socketRef.current)) return;

            // 자신의 video, audio track을 모두 자신의 RTCPeerConnection에 등록한다.
            stream.getTracks().forEach((track) => {
                if (!pcRef.current) return;
                pcRef.current.addTrack(track, stream);
            });

            pcRef.current.onicecandidate = (e) => {
                if (e.candidate) {
                    if (!socketRef.current) return;
                    console.log("onicecandidate");
                    socketRef.current.emit("candidate", e.candidate);
                }
            };

            pcRef.current.oniceconnectionstatechange = (e) => {
                console.log(e);
            };

            pcRef.current.ontrack = (ev) => {
                console.log("add remotetrack success");
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = ev.streams[0];
                }
            };

            // 자신의 video, audio track을 모두 자신의 RTCPeerConnection에 등록한 후에 room에 접속했다고 Signaling Server에 알린다.
            // 왜냐하면 offer or answer을 주고받을 때의 RTCSessionDescription에 해당 video, audio track에 대한 정보가 담겨 있기 때문에
            // 순서를 어기면 상대방의 MediaStream을 받을 수 없음
            socketRef.current.emit("join_room", {
                room: "1234",
            });

        } catch (e) {
            console.error(e);
        }
    };

    const createOffer = async () => {
        console.log("create offer");
        // console.log(pcRef.current);
        // console.log(socketRef.current);
        if (!(pcRef.current && socketRef.current)) return;
        try {
            const sdp = await pcRef.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            // console.log(sdp);
            pcRef.current.setLocalDescription(new RTCSessionDescription(sdp));
            socketRef.current.emit("offer", sdp);
            // console.log(sdp);
        } catch (e) {
            console.error(e);
        }
    };

    const createAnswer = async (sdp: RTCSessionDescription) => {
        if (!(pcRef.current && socketRef.current)) return;
        try {
            pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
            console.log("answer set remote description success");
            const mySdp = await pcRef.current.createAnswer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true,
            });
            console.log("create answer");
            await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
            socketRef.current.emit("answer", mySdp);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        socketRef.current = io(SERVER_URL);
        pcRef.current = new RTCPeerConnection(pc_config);

        //자신을 제외한 같은 방의 모든 user 목록을 받아온다.
        // 해당 user에게 offer signal을 보낸다(createOffer() 함수 호출).
        socketRef.current.on("all_users", (allUsers: Array<{ id: string }>) => {
            if (allUsers.length > 0) {
                createOffer();
            }
        });

        //상대방에게서 offer signal 데이터로 상대방의 RTCSessionDescription을 받는다.
        // 해당 user에게 answer signal을 보낸다(createAnswer(sdp) 함수 호출
        socketRef.current.on("getOffer", (sdp: RTCSessionDescription) => {
            //console.log(sdp);
            console.log("get offer");
            createAnswer(sdp);
        });

        //본인 RTCPeerConnection의 RemoteDescription으로 상대방의 RTCSessionDescription을 설정한다.
        socketRef.current.on("getAnswer", (sdp: RTCSessionDescription) => {
            console.log("get answer");
            if (!pcRef.current) return;
            pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
            //console.log(sdp);
        });

        //본인 RTCPeerConnection의 IceCandidate로 상대방의 RTCIceCandidate를 설정한다
        socketRef.current.on(
            "getCandidate",
            async (candidate: RTCIceCandidateInit) => {
                if (!pcRef.current) return;
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("candidate add success");
            }
        );

        setVideoTracks();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, []);

    return (
        <div>
            <video
                style={{
                    width: 240,
                    height: 240,
                    margin: 5,
                    backgroundColor: "black",
                }}
                muted
                ref={localVideoRef}
                autoPlay
            />
            <video
                id="remotevideo"
                style={{
                    width: 240,
                    height: 240,
                    margin: 5,
                    backgroundColor: "black",
                }}
                ref={remoteVideoRef}
                autoPlay
            />
        </div>
    );
};

export default VideoTest;
