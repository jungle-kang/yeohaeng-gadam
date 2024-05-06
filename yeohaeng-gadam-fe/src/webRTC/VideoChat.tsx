import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Video from './Components/Video';

const SOCKET_SERVER_URL = "http://localhost:3000";

type WebRTCUser = {
    id: string;
    email: string;
    stream: MediaStream;
};

//RTCPeerConnection을 생성할 때의 config
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

// // 소켓정보를 담을 Ref
// const socketRef = useRef<Socket>();
// // peerConnection
// const pcRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
// const localVideoRef = useRef<HTMLVideoElement>(null);
// // const localStreamRef = useRef<MediaStream>();
// // const [users, setUsers] = useState<WebRTCUser[]>([]);
// const remoteVideoRef = useRef<HTMLVideoElement>(null);

const VideoChat = () => {
    const [myStream, setMyStream] = useState(null);
    const [muted, setMuted] = useState(true);
    const [cameraOff, setCameraOff] = useState(false);
    const [cameras, setCameras] = useState([]);
    const videoRef = useRef(null);
    const camerasSelectRef = useRef(null);

    // screen sharing
    const [socket, setSocket] = useState(null);
    const [roomName, setRoomName] = useState("");
    const [nickname, setNickname] = useState("");
    const [messages, setMessages] = useState([]);
    const [captureStream, setCaptureStream] = useState(null);
    const chatInputRef = useRef(null);
    const roomFormRef = useRef(null);

    const [peerConnections, setPeerConnections] = useState({});
    const [remoteStreams, setRemoteStreams] = useState([]);

    const HIDDEN_CN = "hidden";

    const [pcObj, setPcObj] = useState({});

    // Retrieve available cameras
    const getCameras = async (currentStream) => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === "videoinput");
            const currentCameraLabel = currentStream.getVideoTracks()[0]?.label;

            const cameraOptions = videoDevices.map((camera) => ({
                label: camera.label,
                deviceId: camera.deviceId,
                selected: camera.label === currentCameraLabel,
            }));

            setCameras(cameraOptions);
        } catch (error) {
            console.error("Error fetching camera devices:", error);
        }
    };

    // Initialize the local media stream
    const getMedia = async (deviceId = null) => {
        const initialConstraints = {
            audio: true,
            video: { facingMode: "user" },
        };
        const cameraConstraints = {
            audio: true,
            video: { deviceId: { exact: deviceId } },
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                deviceId ? cameraConstraints : initialConstraints
            );

            // Set the video stream to the video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMyStream(stream);

            // Fetch cameras if not switching
            if (!deviceId) {
                stream.getAudioTracks().forEach((track) => (track.enabled = false));
                await getCameras(stream);
            }
        } catch (error) {
            console.error("Error getting media devices:", error);
        }
    };

    // Handle mute button click
    const handleMuteClick = () => {
        if (myStream) {
            myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
            setMuted((prev) => !prev);
        }
    };

    // Handle camera toggle click
    const handleCameraClick = () => {
        if (myStream) {
            myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
            setCameraOff((prev) => !prev);
        }
    };

    // Handle camera selection change
    const handleCameraChange = async (event) => {
        await getMedia(event.target.value);

        // If there are existing peer connections, update the video track
        // Example peerConnection updating logic, replace with your own:
        // peerConnections.forEach(peerConnection => {
        //   const newVideoTrack = myStream.getVideoTracks()[0];
        //   const videoSender = peerConnection
        //     .getSenders()
        //     .find(sender => sender.track.kind === "video");
        //   if (videoSender) videoSender.replaceTrack(newVideoTrack);
        // });
    };

    // Initialize the media stream on component mount
    useEffect(() => {
        getMedia();
    }, []);






    // Initialize Socket.IO connection and event handlers
    useEffect(() => {
        const socketInstance = io(SOCKET_SERVER_URL); // Replace SOCKET_SERVER_URL with the actual server URL
        setSocket(socketInstance);

        socketInstance.on("chat", (message) => {
            setMessages((prevMessages) => [...prevMessages, { text: message, isMine: false }]);
        });

        return () => socketInstance.disconnect();
    }, []);

    // Start Screen Capture (Screen Sharing)
    const startCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            setCaptureStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
            console.error("Error starting screen capture:", error);
        }
    };

    // Handle room join form submission
    const handleWelcomeSubmit = async (event) => {
        event.preventDefault();
        const roomNameInput = roomFormRef.current.querySelector("#roomName");
        const nicknameInput = roomFormRef.current.querySelector("#nickname");
        const newRoomName = roomNameInput.value;
        const newNickname = nicknameInput.value;

        if (socket && !socket.connected) {
            socket.connect();
        }

        setRoomName(newRoomName);
        setNickname(newNickname);

        socket.emit("join_room", newRoomName, newNickname);

        roomNameInput.value = "";
        nicknameInput.value = "";
    };

    // Handle chat message submission
    const handleChatSubmit = (event) => {
        event.preventDefault();
        const message = chatInputRef.current.value;
        chatInputRef.current.value = "";

        if (socket) {
            socket.emit("chat", `${nickname}: ${message}`, roomName);
        }

        setMessages((prevMessages) => [...prevMessages, { text: `You: ${message}`, isMine: true }]);
    };

    // Leave the room
    const leaveRoom = () => {
        if (socket) {
            socket.disconnect();
        }

        setRoomName("");
        setNickname("");
        setMessages([]);
        setCaptureStream(null);

        if (videoRef.current) videoRef.current.srcObject = null;
    };

    // /* socket code */

    // const NOTICE_CN = "noticeChat";

    // // Function to create a new peer connection
    // createConnection = (remoteSocketId, remoteNickname) => {
    //     const newPc = new RTCPeerConnection({ /* Your ICE server config here */ });

    //     newPc.onicecandidate = (event) => {
    //         if (event.candidate && socket) {
    //             socket.emit("ice", event.candidate, remoteSocketId);
    //         }
    //     };

    //     newPc.ontrack = (event) => {
    //         // Add the new remote stream to the UI
    //         const videoElement = document.createElement("video");
    //         videoElement.srcObject = event.streams[0];
    //         videoElement.autoplay = true;
    //         document.querySelector("#streams").appendChild(videoElement);
    //     };

    //     setPcObj((prev) => ({ ...prev, [remoteSocketId]: newPc }));
    //     return newPc;
    // };

    // // Function to display a modal message
    // const paintModal = (message) => {
    //     alert(message); // Simple modal alternative; replace with an actual modal in your UI
    // };

    // // Function to write a message to the chat
    // const writeChat = (message, className = null) => {
    //     setMessages((prevMessages) => [...prevMessages, { text: message, className }]);
    // };

    // // Function to remove a video stream by its socket ID
    // const removeVideo = (leavedSocketId) => {
    //     const videoElement = document.querySelector(`#video-${leavedSocketId}`);
    //     if (videoElement) {
    //         videoElement.remove();
    //     }
    // };

    // // Handle incoming socket events
    // useEffect(() => {
    //     const socketInstance = io(SOCKET_SERVER_URL);
    //     setSocket(socketInstance);

    //     socketInstance.on("reject_join", () => {
    //         paintModal("Sorry, the room is already full.");
    //         setRoomName("");
    //         setNickname("");
    //     });

    //     socketInstance.on("accept_join", async (userObjArr) => {
    //         await initCall(); // Ensure media is initialized

    //         if (userObjArr.length === 1) return;

    //         writeChat("Notice!", NOTICE_CN);

    //         userObjArr.forEach(async (user) => {
    //             try {
    //                 const newPc = createConnection(user.socketId, user.nickname);
    //                 const offer = await newPc.createOffer();
    //                 await newPc.setLocalDescription(offer);
    //                 socketInstance.emit("offer", offer, user.socketId, nickname);
    //                 writeChat(`__${user.nickname}__`, NOTICE_CN);
    //             } catch (err) {
    //                 console.error(err);
    //             }
    //         });
    //         writeChat("is in the room.", NOTICE_CN);
    //     });

    //     socketInstance.on("offer", async (offer, remoteSocketId, remoteNickname) => {
    //         try {
    //             const newPc = createConnection(remoteSocketId, remoteNickname);
    //             await newPc.setRemoteDescription(offer);
    //             const answer = await newPc.createAnswer();
    //             await newPc.setLocalDescription(answer);
    //             socketInstance.emit("answer", answer, remoteSocketId);
    //             writeChat(`Notice! __${remoteNickname}__ joined the room`, NOTICE_CN);
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     });

    //     socketInstance.on("answer", async (answer, remoteSocketId) => {
    //         if (pcObj[remoteSocketId]) {
    //             await pcObj[remoteSocketId].setRemoteDescription(answer);
    //         }
    //     });

    //     socketInstance.on("ice", async (ice, remoteSocketId) => {
    //         if (pcObj[remoteSocketId]) {
    //             await pcObj[remoteSocketId].addIceCandidate(ice);
    //         }
    //     });

    //     socketInstance.on("chat", (message) => {
    //         writeChat(message);
    //     });

    //     socketInstance.on("leave_room", (leavedSocketId, nickname) => {
    //         removeVideo(leavedSocketId);
    //         writeChat(`Notice! ${nickname} left the room.`, NOTICE_CN);
    //     });

    //     return () => socketInstance.disconnect();
    // }, [pcObj, nickname]);

    // // RTC code

    // const ICE_SERVERS = [
    //     {
    //         urls: [
    //             "stun:stun.l.google.com:19302",
    //             "stun:stun1.l.google.com:19302",
    //             "stun:stun2.l.google.com:19302",
    //             "stun:stun3.l.google.com:19302",
    //             "stun:stun4.l.google.com:19302",
    //         ],
    //     },
    // ];

    // // Function to create a new peer connection
    // const createConnection = (remoteSocketId, remoteNickname) => {
    //     const myPeerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    //     myPeerConnection.addEventListener("icecandidate", (event) => {
    //         if (event.candidate && socket) {
    //             socket.emit("ice", event.candidate, remoteSocketId);
    //         }
    //     });

    //     myPeerConnection.addEventListener("track", (event) => {
    //         const peerStream = event.streams[0];
    //         setRemoteStreams((prev) => [
    //             ...prev.filter((stream) => stream.id !== remoteSocketId),
    //             { id: remoteSocketId, nickname: remoteNickname, stream: peerStream },
    //         ]);
    //     });

    //     // Add local tracks to the connection
    //     myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));

    //     // Save the peer connection object in state
    //     setPeerConnections((prev) => ({ ...prev, [remoteSocketId]: myPeerConnection }));

    //     return myPeerConnection;
    // };

    // Socket event constants
    const NOTICE_CN = "noticeChat";
    const ICE_SERVERS = [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ],
        },
    ];

    // Function to create a new peer connection
    const createConnection = (remoteSocketId, remoteNickname) => {
        const myPeerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        myPeerConnection.addEventListener("icecandidate", (event) => {
            if (event.candidate && socket) {
                socket.emit("ice", event.candidate, remoteSocketId);
            }
        });

        myPeerConnection.addEventListener("track", (event) => {
            const peerStream = event.streams[0];
            setRemoteStreams((prev) => [
                ...prev.filter((stream) => stream.id !== remoteSocketId),
                { id: remoteSocketId, nickname: remoteNickname, stream: peerStream },
            ]);
        });

        // Add local tracks to the connection
        myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));

        // Save the peer connection object in state
        setPeerConnections((prev) => ({ ...prev, [remoteSocketId]: myPeerConnection }));

        return myPeerConnection;
    };

    // Handle socket event listeners and socket connections
    useEffect(() => {
        const socketInstance = io(SOCKET_SERVER_URL);
        setSocket(socketInstance);

        socketInstance.on("reject_join", () => {
            paintModal("Sorry, the room is already full.");
            setRoomName("");
            setNickname("");
        });

        socketInstance.on("accept_join", async (userObjArr) => {
            await initCall(); // Ensure media is initialized

            if (userObjArr.length === 1) return;

            writeChat("Notice!", NOTICE_CN);

            userObjArr.forEach(async (user) => {
                try {
                    const newPc = createConnection(user.socketId, user.nickname);
                    const offer = await newPc.createOffer();
                    await newPc.setLocalDescription(offer);
                    socketInstance.emit("offer", offer, user.socketId, nickname);
                    writeChat(`__${user.nickname}__`, NOTICE_CN);
                } catch (err) {
                    console.error(err);
                }
            });
            writeChat("is in the room.", NOTICE_CN);
        });

        socketInstance.on("offer", async (offer, remoteSocketId, remoteNickname) => {
            try {
                const newPc = createConnection(remoteSocketId, remoteNickname);
                await newPc.setRemoteDescription(offer);
                const answer = await newPc.createAnswer();
                await newPc.setLocalDescription(answer);
                socketInstance.emit("answer", answer, remoteSocketId);
                writeChat(`Notice! __${remoteNickname}__ joined the room`, NOTICE_CN);
            } catch (err) {
                console.error(err);
            }
        });

        socketInstance.on("answer", async (answer, remoteSocketId) => {
            if (peerConnections[remoteSocketId]) {
                await peerConnections[remoteSocketId].setRemoteDescription(answer);
            }
        });

        socketInstance.on("ice", async (ice, remoteSocketId) => {
            if (peerConnections[remoteSocketId]) {
                await peerConnections[remoteSocketId].addIceCandidate(ice);
            }
        });

        socketInstance.on("chat", (message) => {
            writeChat(message);
        });

        socketInstance.on("leave_room", (leavedSocketId, nickname) => {
            removeVideo(leavedSocketId);
            writeChat(`Notice! ${nickname} left the room.`, NOTICE_CN);
        });

        return () => socketInstance.disconnect();
    }, [peerConnections, nickname]);


    // Function to arrange video streams (adjust as needed)
    const sortStreams = (numberOfPeople) => {
        const className = `people${numberOfPeople}`;
        setRemoteStreams((prevStreams) =>
            prevStreams.map((stream) => ({ ...stream, className }))
        );
    };

    // Use socket listeners for events
    useEffect(() => {
        const socketInstance = io(SOCKET_SERVER_URL);
        setSocket(socketInstance);

        socketInstance.on("reject_join", () => {
            // Handle room full situation
        });

        socketInstance.on("accept_join", async (userObjArr) => {
            // Create peer connections for each new user
            if (userObjArr.length > 1) {
                userObjArr.forEach((user) => {
                    const newPc = createConnection(user.socketId, user.nickname);
                    // Further RTC connection logic...
                });
            }
        });

        socketInstance.on("offer", async (offer, remoteSocketId, remoteNickname) => {
            // Process incoming offers and send answers
            const newPc = createConnection(remoteSocketId, remoteNickname);
            await newPc.setRemoteDescription(offer);
            const answer = await newPc.createAnswer();
            await newPc.setLocalDescription(answer);
            socketInstance.emit("answer", answer, remoteSocketId);
        });

        socketInstance.on("answer", async (answer, remoteSocketId) => {
            const pc = peerConnections[remoteSocketId];
            if (pc) await pc.setRemoteDescription(answer);
        });

        socketInstance.on("ice", async (ice, remoteSocketId) => {
            const pc = peerConnections[remoteSocketId];
            if (pc) await pc.addIceCandidate(ice);
        });

        return () => socketInstance.disconnect();
    }, [peerConnections]);



    return (
        <div>
            {/* Room Form */}
            <div ref={roomFormRef}>
                <form onSubmit={handleWelcomeSubmit}>
                    <input id="roomName" type="text" placeholder="Room Name" required />
                    <input id="nickname" type="text" placeholder="Nickname" required />
                    <button type="submit">Join Room</button>
                </form>
            </div>

            {/* Video Area */}
            <div>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "500px" }} />
                <button onClick={startCapture}>Start Screen Sharing</button>
            </div>

            {/* Remote Streams */}
            <div id="streams">
                {remoteStreams.map((streamObj) => (
                    <div key={streamObj.id} className={streamObj.className || ""}>
                        <video
                            autoPlay
                            playsInline
                            width="400"
                            height="400"
                            srcObject={streamObj.stream}
                        />
                        <h3 id="userNickname">{streamObj.nickname}</h3>
                    </div>
                ))}
            </div>

            {/* Chat Box */}
            <ul>
                {messages.map((message, index) => (
                    <li key={index} className={message.isMine ? "myChat" : "noticeChat"}>
                        {message.text}
                    </li>
                ))}
            </ul>

            <form id="chatForm" onSubmit={handleChatSubmit}>
                <input ref={chatInputRef} type="text" placeholder="Type a message..." required />
                <button type="submit">Send</button>
            </form>

            {/* Leave Room Button */}
            <button onClick={leaveRoom}>Leave Room</button>
        </div>
    );
};


export default VideoChat;
