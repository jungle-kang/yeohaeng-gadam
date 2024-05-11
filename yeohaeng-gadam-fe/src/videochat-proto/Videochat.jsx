import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
// import { SocketProvider, useSocket } from './SocketContext';
import { useSelf } from "/liveblocks.config";

// connection settings
const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL;

const TURN_SERVER_INFO = {
  urls: import.meta.env.VITE_TURN_SERVER_URL,
  'username': import.meta.env.VITE_TURN_SERVER_USER_NAME,
  'credential': import.meta.env.VITE_TURN_SERVER_CREDENTIAL,
};

const pc_config = {
  iceServers: [

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
// const AUDIO_SETTINGS = true;
const AUDIO_SETTINGS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export default function Videochat({ roomId }) {
  const localVideoRef = useRef(null); // 내 영상 표시할 video element
  let localStream = null;
  // const [localStream, setLocalStream] = useState(null); // 내 영상
  const [users, setUsers] = useState([]); // 참가중인 다른 이용자 목록
  let pcs = {}; // createPeerConnection으로 생성된 pc와 그 상대의 정보를 저장
  let localSdps = {};
  let remoteSdps = {};

  const socket = io(SIGNALING_SERVER_URL); // signaling server와 통신하는 소켓
  // let savedSocketId = null;
  const [savedSocketId, setSavedSocketId] = useState(null);
  // const socket = useSocket();

  const setLocalStream = async () => {
    if (localStream) {
      console.log("setLocalStream(): localStream already set");
      return;
    }

    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: AUDIO_SETTINGS,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      console.log("setLocalStream(): success");
    } else {
      console.log("setLocalStream(): failed");
    }
  };

  const createPeerConnection = (peerID, email) => {
    console.log("createPeerConnection(): start");
    try {
      const pc = new RTCPeerConnection(pc_config);

      pc.onicecandidate = (e) => {
        console.log("onicecandidate: begin", `(socket id: ${socket.id})`);
        if (!socket.connected) {
          console.log("onicecandidate: socket not connected");
          return;
        }

        if (!e.candidate) {
          console.log("onicecandidate: no candidate");
          return;
        }

        socket.emit('candidate', {
          candidate: e.candidate,
          candidateSendID: socket.id,
          candidateReceiveID: peerID,
        });
        console.log("onicecandidate: emitted candidate");
      };

      // pc.oniceconnectionstatechange = (e) => {
      //     console.log(e);
      // };

      pc.ontrack = (e) => {
        console.log("ontrack: begin", `(socket id: ${socket.id})`);

        setUsers((oldUsers) =>
          oldUsers
            .filter((user) => user.id !== peerID)
            .concat({
              id: peerID,
              email,
              stream: e.streams[0],
            }),
        );
      };

      if (!localStream) {
        console.log("createPeerConnection(): no local stream detected");
        return;
      }

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
        console.log('createPeerConnection(): localStream added', `(socket id: ${socket.id})`);
      });

      console.log("createPeerConnection(): done");

      return pc;
    } catch (e) {
      console.log('createPeerConnection(): error occured');
      console.error(e);
      return undefined;
    }
  };

  // const initializeLocalStream = async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true,
  //   });

  //   if (localVideoRef.current) {
  //     setLocalStream(stream);
  //     localVideoRef.current.srcObject = localStream;
  //     console.log("setLocalStream success");
  //   } else {
  //     console.log("setLocalStream failed");
  //   }
  // };



  //////////////////////////

  const onConnectHandler = async () => {
    if (savedSocketId !== null) {
      console.log("duplicate on connect detected", `(socket id: ${socket.id})`);
      socket.disconnect();
      return;
    }

    await setLocalStream();

    console.log("onConnectHandler(): start");

    if (socket.connected) {
      setSavedSocketId(socket.id); ///////////

      socket.emit('join_room', {
        room: `yhgd-${roomId}`,
        email: 'sample@naver.com',
      });
      console.log("onConnectHandler(): join_room emitted", `(socket id: ${socket.id})`); ////////
    } else {
      console.log("onConnectHandler(): socket is not connected");
    }
  };

  const onAllUsersHandler = (otherUsers) => {
    console.log("onAllUsersHandler(): start", `(socket id: ${socket.id})`);
    console.log("received otherUsers: ", otherUsers);

    otherUsers.forEach(async (user) => {
      const pc = createPeerConnection(user.id, user.email);
      if (!pc) {
        console.log("onAllUsersHandler(): createPC failed");
        return;
      }

      pcs = { ...pcs, [user.id]: pc };

      try {
        const localSdp = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        // localSdps = { ... localSdps, [user.id]: localSdp};

        await pc.setLocalDescription(localSdp);

        socket.emit('offer', {
          sdp: localSdp,
          offerSendID: socket.id,
          offerSendEmail: 'offerSendSample@sample.com',
          offerReceiveID: user.id,
        });
        console.log("onAllUsersHandler(): emitted offer toward ", user.id);

      } catch (e) {
        console.log("onAllUsersHandler(): error");
        console.error(e);
      }
    });

    console.log("onAllUsersHandler(): done", `(socket id: ${socket.id})`);
  };

  const onGetOfferHandler = async (data) => {
    // data 형태: { sdp, offerSendID, offerSendEmail }
    console.log("onGetOfferHandler(): start", `(socket id: ${socket.id})`);
    console.log("received data: ", data);

    const pc = createPeerConnection(data.offerSendID, data.offerSendEmail);

    if (!pc) {
      console.log("onGetOfferHandler(): createPC failed");
      return;
    }

    pcs = { ...pcs, [data.offerSendID]: pc };
    // remoteSdps = { ... remoteSdps, [data.offerSendID]: data.sdp};

    // console.log("pcsRef.current: " + pcsRef.current);
    try {
      // console.log("trying to set remote sdp as ", data);
      await pc.setRemoteDescription(data.sdp);
      // pc.setRemoteDescription(new RTCSessionDescription(sdp));
      // console.log('answer set remote description success', " (socket id: ", sigSocket.id, ")");


      const localSdp = await pc.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });

      // localSdps = { ... localSdps, [data.offerSendID]: localSdp};

      await pc.setLocalDescription(localSdp);
      // pc.setLocalDescription(new RTCSessionDescription(localSdp));


      socket.emit('answer', {
        sdp: localSdp,
        answerSendID: socket.id,
        answerReceiveID: data.offerSendID,
      });


      console.log("onGetOfferHandler(): emitted answer toward ", data.offerSendID);
      console.log("current pcs: ", pcs);

    } catch (e) {
      console.log("onGetOfferHandler(): error");
      console.error(e);
    }
  };

  const onGetAnswerHandler = async (data) => {
    // data 형태: { sdp, answerSendID }
    console.log("onGetAnswerHandler(): start", `(socket id: ${socket.id})`);
    const pc = pcs[data.answerSendID];

    if (!pc) {
      console.log("onGetAnswerHandler(): no pc in pcs");
      return;
    }

    await pc.setRemoteDescription(data.sdp);

    console.log("onGetAnswerHandler(): done");
    console.log("current pcs: ", pcs);
  }

  const onGetCandidateHandler = async (data) => {
    // data 형태: { candidate, candidateSendID }
    console.log("onGetCandidateHandler(): start", `(socket id: ${socket.id})`);
    const pc = pcs[data.candidateSendID];
    if (!pc) {
      console.log("onGetCandidateHandler(): no pc in pcs");
      return;
    }

    await pc.addIceCandidate(data.candidate);

    console.log('onGetCandidateHandler(): add success');
  }

  const onUserExitHandler = (data) => {
    // data 형태: { id }
    console.log("onUserExitHandler(): ", `${data.id} left the room`, `(socket id: ${socket.id})`);
    if (!pcs[data.id]) {
      console.log("onUserExitHandler(): exited user not found in pcs");
      return;
    }

    pcs[data.id].close();
    delete pcs[data.id];
    setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));

    console.log("onUserExitHandler(): done");
  }

  ///////////////////////////////////////////////////////////////////

  // initializeLocalStream();
  // tryJoinRoom();
  // socket.on("connect", tryJoinRoom);

  // useEffect(() => {
  //   if (localStream) {
  //     socket.on("connect", tryJoinRoom);
  //   }
  // }, [localStream === null]);

  socket.on("connect", onConnectHandler);
  // onConnectHandler();
  socket.on("all_users", onAllUsersHandler);
  socket.on("get_offer", onGetOfferHandler);
  socket.on("get_answer", onGetAnswerHandler);
  socket.on("get_candidate", onGetCandidateHandler);
  socket.on("user_exit", onUserExitHandler);



  const Video = ({ email, stream, muted = false }) => {
    const ref = useRef(null);
    // const [isMuted, setIsMuted] = useState(muted);

    // Set the video element's source object to the stream
    useEffect(() => {
      if (stream && ref.current) {
        ref.current.srcObject = stream;
        console.log("stream-video: ", ref.current.srcObject);
        console.log("stream user: ", users)
      }
      console.log(ref)
      // setIsMuted(muted);
      // }, [stream, muted]);
    }, [stream]);

    return (
      <div className="my-2">
        <video
          ref={ref}
          muted={muted}
          autoPlay
          style={{
            aspectRatio: "4/3",
            // width: "100%",
            // width: 240,
            // height: 240,
            // margin: 5,
            backgroundColor: 'black'
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    return (() => {
      if (socket) {
        socket.disconnect();
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => {track.stop()});
      }
    })
  }, [])

  return (
    <div className="mx-2">
      {/* <div>{savedSocketId}</div> */}
      <div>My ID: {useSelf((me) => me.connectionId)}</div>
      <video className="my-2"
        style={{
          aspectRatio: "4/3",
          width: "100%",
          // height: "",
          // margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={localVideoRef}
        autoPlay
      />
      {/* <Video key={socket.id} email="" stream={localStream} muted /> */}
      {users.map((user, index) => (
        // <Video key={user.id} email={user.email} stream={user.stream} />
        <div key={index}>
          <Video key={user.id} email={user.email} stream={user.stream} />
          {/* <h1 >
            {`User ${index + 1}`}
          </h1> */}
        </div>
      ))}
    </div>
  );
}