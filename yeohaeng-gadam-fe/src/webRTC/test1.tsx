import React, { useState, useRef, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { WebRTCUser } from './types';

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
const SOCKET_SERVER_URL = 'http://localhost:3000';

const NtoN = () => {
    // const socketRef = useRef<Socket>();
    const sigSocket = io(SOCKET_SERVER_URL);
    // const pcsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    let pcs = {};
    const localVideoRef = useRef<HTMLVideoElement>(null);
    // const localStreamRef = useRef<MediaStream>();
    let myLocalStream = null;
    const [users, setUsers] = useState<WebRTCUser[]>([]);

    const getLocalStream = async () => {
        console.log("getLocalStream start", " (socket id: ", sigSocket.id, ")"); ////////
        // const getLocalStream = useEffect(async () => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: 240,
                    height: 240,
                },
            });
            myLocalStream = localStream;
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
            console.log("localstream set", " (socket id: ", sigSocket.id, ")"); ////////
            // console.log("current socket: ", sigSocket); ////////
            if (sigSocket === null) {
                console.log("sigSocket is null"); ////////  
                return;
            }
            sigSocket.emit('join_room', {
                room: '1234',
                email: 'sample@naver.com',
            });
            console.log("join_room emitted", " (socket id: ", sigSocket.id, ")"); ////////
        } catch (e) {
            console.log(`getUserMedia error: ${e}`);
        }
    };

    // const getLocalStream = useCallback(async () => {
    //     console.log("getLocalStream start"); ////////
    //     // const getLocalStream = useEffect(async () => {
    //     try {
    //         const localStream = await navigator.mediaDevices.getUserMedia({
    //             audio: true,
    //             video: {
    //                 width: 240,
    //                 height: 240,
    //             },
    //         });
    //         myLocalStream = localStream;
    //         if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    //         console.log("localstream set"); ////////
    //         console.log("current socket: ", sigSocket); ////////
    //         if (sigSocket === null) {
    //             console.log("sigSocket is null"); ////////  
    //             return;
    //         }
    //         sigSocket.emit('join_room', {
    //             room: '1234',
    //             email: 'sample@naver.com',
    //         });
    //         console.log("join_room emitted"); ////////
    //     } catch (e) {
    //         console.log(`getUserMedia error: ${e}`);
    //     }
    // }, []);

    const createPeerConnection = (socketID: string, email: string) => {
        try {
            const pc = new RTCPeerConnection(pc_config);

            pc.onicecandidate = (e) => {
                if (sigSocket === null || !e.candidate) return;
                console.log('onicecandidate', " (socket id: ", sigSocket.id, ")");
                sigSocket.emit('candidate', {
                    candidate: e.candidate,
                    candidateSendID: sigSocket.id,
                    candidateReceiveID: socketID,
                });
            };

            // pc.oniceconnectionstatechange = (e) => {
            //     console.log(e);
            // };

            pc.ontrack = (e) => {
                console.log('ontrack success', " (socket id: ", sigSocket.id, ")");
                setUsers((oldUsers) =>
                    oldUsers
                        .filter((user) => user.id !== socketID)
                        .concat({
                            id: socketID,
                            email,
                            stream: e.streams[0],
                        }),
                );
            };

            if (myLocalStream) {
                myLocalStream.getTracks().forEach((track) => {
                    if (!myLocalStream) return;
                    pc.addTrack(track, myLocalStream);
                    console.log('myLocalStream added', " (socket id: ", sigSocket.id, ")");
                });
            } else {
                console.log('no local stream');
            }

            return pc;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    };

    // const createPeerConnection = useCallback((socketID: string, email: string) => {
    //     try {
    //         const pc = new RTCPeerConnection(pc_config);

    //         pc.onicecandidate = (e) => {
    //             if (sigSocket === null || !e.candidate) return;
    //             console.log('onicecandidate');
    //             sigSocket.emit('candidate', {
    //                 candidate: e.candidate,
    //                 candidateSendID: sigSocket.id,
    //                 candidateReceiveID: socketID,
    //             });
    //         };

    //         // pc.oniceconnectionstatechange = (e) => {
    //         //     console.log(e);
    //         // };

    //         pc.ontrack = (e) => {
    //             console.log('ontrack success');
    //             setUsers((oldUsers) =>
    //                 oldUsers
    //                     .filter((user) => user.id !== socketID)
    //                     .concat({
    //                         id: socketID,
    //                         email,
    //                         stream: e.streams[0],
    //                     }),
    //             );
    //         };

    //         if (myLocalStream) {
    //             myLocalStream.getTracks().forEach((track) => {
    //                 if (!myLocalStream) return;
    //                 pc.addTrack(track, myLocalStream);
    //                 console.log('myLocalStream added');
    //             });
    //         } else {
    //             console.log('no local stream');
    //         }

    //         return pc;
    //     } catch (e) {
    //         console.error(e);
    //         return undefined;
    //     }
    // }, []);

    // sigSocket.on("connect", getLocalStream);
    // getLocalStream();

    sigSocket.on('all_users', (allUsers: Array<{ id: string; email: string }>) => {
        console.log("socket.io received all_users", " (socket id: ", sigSocket.id, ")");
        allUsers.forEach(async (user) => {
            // if (!localStreamRef.current) return;
            const pc = createPeerConnection(user.id, user.email);
            if (!pc || sigSocket === null) return;
            pcs = { ...pcs, [user.id]: pc };
            try {
                const localSdp = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                });
                console.log('create offer success', " (socket id: ", sigSocket.id, ")");
                // console.log("localSdp: " + localSdp);
                pc.setLocalDescription(new RTCSessionDescription(localSdp));
                sigSocket.emit('offer', {
                    sdp: localSdp,
                    offerSendID: sigSocket.id,
                    offerSendEmail: 'offerSendSample@sample.com',
                    offerReceiveID: user.id,
                });
                console.log("emitted offer toward ", user.id);
                // console.log("localSdp: " + localSdp.sdp);
            } catch (e) {
                console.error(e);
            }
        });
        console.log("on all_users done, pcs: ", pcs);
    });

    sigSocket.on(
        'getOffer',
        async (data: {
            sdp: RTCSessionDescription;
            offerSendID: string;
            offerSendEmail: string;
        }) => {
            console.log("socket.io received getOffer", " (socket id: ", sigSocket.id, ")");
            const { sdp, offerSendID, offerSendEmail } = data;
            console.log('get offer', " (socket id: ", sigSocket.id, ")");
            // console.log("get offer: " + sdp);
            // console.log("get offer: " + offerSendID);
            // console.log("get offer: " + offerSendEmail);
            // if (!localStreamRef.current) return;
            const pc = createPeerConnection(offerSendID, offerSendEmail);
            if (!pc || sigSocket === null) return;
            pcs = { ...pcs, [offerSendID]: pc };
            // console.log("pcsRef.current: " + pcsRef.current);
            try {
                // console.log("trying to set remote sdp as ", data);
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                // pc.setRemoteDescription(new RTCSessionDescription(sdp));
                // console.log('answer set remote description success', " (socket id: ", sigSocket.id, ")");
                // const localSdp = await pc.createAnswer({
                //     offerToReceiveVideo: true,
                //     offerToReceiveAudio: true,
                // });
                // await pc.setLocalDescription(new RTCSessionDescription(localSdp));
                // pc.setLocalDescription(new RTCSessionDescription(localSdp));
                // sigSocket.emit('answer', {
                //     sdp: localSdp,
                //     answerSendID: sigSocket.id,
                //     answerReceiveID: offerSendID,
                // });
                // console.log("send answer sdp: " + sdp);
                // console.log("send answerID: " + sigSocket.id,);
                // console.log("send answerRID: " + offerSendID);


            } catch (e) {
                console.error(e);
            }
        },
    );

    // sigSocket.on(
    //     'getAnswer',
    //     (data: { sdp: RTCSessionDescription; answerSendID: string }) => {
    //         console.log("socket.io received getAnswer", " (socket id: ", sigSocket.id, ")");
    //         const { sdp, answerSendID } = data;
    //         console.log('get answer');
    //         const pc: RTCPeerConnection = pcs[answerSendID];
    //         if (!pc) return;
    //         pc.setRemoteDescription(new RTCSessionDescription(sdp));
    //     },
    // );

    sigSocket.on(
        'getCandidate',
        async (data: { candidate: RTCIceCandidateInit; candidateSendID: string }) => {
            console.log("socket.io received getCandidate", " (socket id: ", sigSocket.id, ")");
            const pc: RTCPeerConnection = pcs[data.candidateSendID];
            console.log("pc: ", pc);
            if (!pc) {
                console.log("pc is null");
                return;
            }
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('candidate add success');
        },
    );

    // sigSocket.on('user_exit', (data: { id: string }) => {
    //     console.log("socket.io received user_exit", " (socket id: ", sigSocket.id, ")");
    //     if (!pcs[data.id]) return;
    //     pcs[data.id].close();
    //     delete pcs[data.id];
    //     setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));
    // });



    getLocalStream();
    useEffect(() => {
        console.log("connected? ", sigSocket.connected);
        // if (!sigSocket.connected) {
        //     console.log("sigSocket is not connected");
        //     return;
        // }
        // if (sigSocket !== null) {
        //     console.log("sigSocket already exists");
        //     return; // useEFfect가 두 번 실행되므로 두번째 실행에서는 아무것도 하지 않도록 함
        // }

        // console.log("useEffect start"); //

        // sigSocket = io(SOCKET_SERVER_URL);
        // sigSocket.on("connect", getLocalStream);
        // // getLocalStream();

        // sigSocket.on('all_users', (allUsers: Array<{ id: string; email: string }>) => {
        //     allUsers.forEach(async (user) => {
        //         console.log("socket.io received all_users");
        //         // if (!localStreamRef.current) return;
        //         const pc = createPeerConnection(user.id, user.email);
        //         if (!pc || sigSocket === null) return;
        //         pcs = { ...pcs, [user.id]: pc };
        //         try {
        //             const localSdp = await pc.createOffer({
        //                 offerToReceiveAudio: true,
        //                 offerToReceiveVideo: true,
        //             });
        //             console.log('create offer success');
        //             // console.log("localSdp: " + localSdp);
        //             await pc.setLocalDescription(new RTCSessionDescription(localSdp));
        //             sigSocket.emit('offer', {
        //                 sdp: localSdp,
        //                 offerSendID: sigSocket.id,
        //                 offerSendEmail: 'offerSendSample@sample.com',
        //                 offerReceiveID: user.id,
        //             });
        //             // console.log("localSdp: " + localSdp.sdp);
        //         } catch (e) {
        //             console.error(e);
        //         }
        //     });
        // });

        // sigSocket.on(
        //     'getOffer',
        //     async (data: {
        //         sdp: RTCSessionDescription;
        //         offerSendID: string;
        //         offerSendEmail: string;
        //     }) => {
        //         console.log("socket.io received getOffer");
        //         const { sdp, offerSendID, offerSendEmail } = data;
        //         console.log('get offer');
        //         // console.log("get offer: " + sdp);
        //         // console.log("get offer: " + offerSendID);
        //         // console.log("get offer: " + offerSendEmail);
        //         // if (!localStreamRef.current) return;
        //         const pc = createPeerConnection(offerSendID, offerSendEmail);
        //         if (!pc || sigSocket === null) return;
        //         pcs = { ...pcs, [offerSendID]: pc };
        //         // console.log("pcsRef.current: " + pcsRef.current);
        //         try {
        //             // await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        //             pc.setRemoteDescription(new RTCSessionDescription(sdp));
        //             console.log('answer set remote description success');
        //             const localSdp = await pc.createAnswer({
        //                 offerToReceiveVideo: true,
        //                 offerToReceiveAudio: true,
        //             });
        //             // await pc.setLocalDescription(new RTCSessionDescription(localSdp));
        //             pc.setLocalDescription(new RTCSessionDescription(localSdp));
        //             sigSocket.emit('answer', {
        //                 sdp: localSdp,
        //                 answerSendID: sigSocket.id,
        //                 answerReceiveID: offerSendID,
        //             });
        //             console.log("send answer sdp: " + sdp);
        //             console.log("send answerID: " + sigSocket.id,);
        //             console.log("send answerRID: " + offerSendID);

        //         } catch (e) {
        //             console.error(e);
        //         }
        //     },
        // );

        // sigSocket.on(
        //     'getAnswer',
        //     (data: { sdp: RTCSessionDescription; answerSendID: string }) => {
        //         console.log("socket.io received getAnswer");
        //         const { sdp, answerSendID } = data;
        //         console.log('get answer');
        //         const pc: RTCPeerConnection = pcs[answerSendID];
        //         if (!pc) return;
        //         pc.setRemoteDescription(new RTCSessionDescription(sdp));
        //     },
        // );

        // sigSocket.on(
        //     'getCandidate',
        //     async (data: { candidate: RTCIceCandidateInit; candidateSendID: string }) => {
        //         console.log("socket.io received getCandidate");
        //         const pc: RTCPeerConnection = pcs[data.candidateSendID];
        //         if (!pc) return;
        //         await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        //         console.log('candidate add success');
        //     },
        // );

        // sigSocket.on('user_exit', (data: { id: string }) => {
        //     console.log("socket.io received user_exit");
        //     if (!pcs[data.id]) return;
        //     pcs[data.id].close();
        //     delete pcs[data.id];
        //     setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));
        // });



        // return () => {
        //     if (socketRef.current) {
        //         socketRef.current.disconnect();
        //     }
        //     users.forEach((user) => {
        //         if (!pcsRef.current[user.id]) return;
        //         pcsRef.current[user.id].close();
        //         delete pcsRef.current[user.id];
        //     });
        // };
        return () => {
            sigSocket?.disconnect();
            users.forEach((user) => {
                pcs[user.id]?.close();
                delete pcs[user.id];
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // }, []);


    interface Props {
        email: string;
        stream: MediaStream;
        muted?: boolean;
    }

    const Video = ({ email, stream, muted = false }: Props) => {
        const ref = useRef<HTMLVideoElement>(null);
        // const [isMuted, setIsMuted] = useState(muted);

        // Set the video element's source object to the stream
        useEffect(() => {
            if (ref.current) {
                ref.current.srcObject = stream;
                console.log("stream-video: ", ref.current.srcObject);
                console.log("stream user: ", users)
            }
            console.log(ref)
            // setIsMuted(muted);
            // }, [stream, muted]);
        }, [stream]);

        return (
            <div>
                <video
                    ref={ref}
                    // muted={isMuted}
                    autoPlay
                    style={{ width: 240, height: 240, margin: 5, backgroundColor: 'black' }}
                />
                <div>{email}</div>
            </div>
        );
    };

    return (
        <div>
            <video
                style={{
                    width: 240,
                    height: 240,
                    margin: 5,
                    backgroundColor: 'black',
                }}
                muted
                ref={localVideoRef}
                autoPlay
            />
            {users.map((user, index) => (
                // <Video key={user.id} email={user.email} stream={user.stream} />
                <div key={index}>
                    <Video key={user.id} email={user.email} stream={user.stream} />
                    <h1 >
                        {`User ${index + 1}`}
                    </h1>
                </div>
            ))}
        </div>
    );
};

export default NtoN;