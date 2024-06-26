import React, { useState, useEffect, useRef } from 'react';
import { socket } from './socket';

import { COLORS_NAMETAG } from "/src/components/whiteboard/userColors"

// connection settings
const TURN_SERVER_INFO = {
  urls: import.meta.env.VITE_TURN_SERVER_URL,
  'username': import.meta.env.VITE_TURN_SERVER_USER_NAME,
  'credential': import.meta.env.VITE_TURN_SERVER_CREDENTIAL,
};

const pc_config = {
  iceServers: [
    TURN_SERVER_INFO, // COTURN 서버 사용 시 주석 해제
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

export default function Videochat({ roomId, myName, myColorId }) {
  const localVideoRef = useRef(null); // 내 영상 표시할 video element
  let localStream = null;
  const [users, setUsers] = useState([]); // 참가중인 다른 이용자 목록
  let pcs = {}; // createPeerConnection으로 생성된 pc와 그 상대의 정보를 저장

  const setLocalStream = async () => {
    // if (localStream) {
    //   console.log("setLocalStream(): localStream already set");
    //   return;
    // }

    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: AUDIO_SETTINGS,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      // console.log("setLocalStream(): success");
    } else {
      console.log("setLocalStream(): failed");
    }
  };

  const createPeerConnection = (peerID, name, colorId) => {
    // console.log("createPeerConnection(): start");
    try {
      const pc = new RTCPeerConnection(pc_config);

      pc.onicecandidate = (e) => {
        // console.log("onicecandidate: begin", `(socket id: ${socket.id})`);
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
        // console.log("onicecandidate: emitted candidate");
      };

      pc.ontrack = (e) => {
        // console.log("ontrack: begin", `(socket id: ${socket.id})`);

        setUsers((oldUsers) =>
          oldUsers
            .filter((user) => user.id !== peerID)
            .concat({
              id: peerID,
              name,
              colorId,
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
        // console.log('createPeerConnection(): localStream added', `(socket id: ${socket.id})`);
      });

      // console.log("createPeerConnection(): done");

      return pc;
    } catch (e) {
      console.log('createPeerConnection(): error occured');
      console.error(e);
      return undefined;
    }
  };

  const onConnectHandler = async () => {
    await setLocalStream();

    // console.log("onConnectHandler(): start");

    if (socket.connected) {
      socket.emit('join_room', {
        room: `yhgd-${roomId}`,
        name: myName,
        colorId: myColorId,
      });
      // console.log("onConnectHandler(): join_room emitted", `(socket id: ${socket.id})`); ////////
    } else {
      console.log("onConnectHandler(): socket is not connected");
    }
  };

  const onAllUsersHandler = (otherUsers) => {
    // console.log("onAllUsersHandler(): start", `(socket id: ${socket.id})`);
    // console.log("received otherUsers: ", otherUsers);

    otherUsers.forEach(async (user) => {
      const pc = createPeerConnection(user.id, user.name, user.colorId);
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

        await pc.setLocalDescription(localSdp);

        socket.emit('offer', {
          sdp: localSdp,
          offerSendID: socket.id,
          offerSendName: myName,
          offerSendColorID: myColorId,
          offerReceiveID: user.id,
        });
        // console.log("onAllUsersHandler(): emitted offer toward ", user.id);

      } catch (e) {
        console.log("onAllUsersHandler(): error");
        console.error(e);
      }
    });

    // console.log("onAllUsersHandler(): done", `(socket id: ${socket.id})`);
  };

  const onGetOfferHandler = async (data) => {
    // data 형태: { sdp, offerSendID, offerSendEmail }
    // console.log("onGetOfferHandler(): start", `(socket id: ${socket.id})`);
    // console.log("received data: ", data);

    const pc = createPeerConnection(data.offerSendID, data.offerSendName, data.offerSendColorID);

    if (!pc) {
      console.log("onGetOfferHandler(): createPC failed");
      return;
    }

    pcs = { ...pcs, [data.offerSendID]: pc };

    // console.log("pcsRef.current: " + pcsRef.current);
    try {
      // console.log("trying to set remote sdp as ", data);
      await pc.setRemoteDescription(data.sdp);
      // console.log('answer set remote description success', " (socket id: ", sigSocket.id, ")");


      const localSdp = await pc.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });

      await pc.setLocalDescription(localSdp);

      socket.emit('answer', {
        sdp: localSdp,
        answerSendID: socket.id,
        answerReceiveID: data.offerSendID,
      });


      // console.log("onGetOfferHandler(): emitted answer toward ", data.offerSendID);
      // console.log("current pcs: ", pcs);

    } catch (e) {
      console.log("onGetOfferHandler(): error");
      console.error(e);
    }
  };

  const onGetAnswerHandler = async (data) => {
    // data 형태: { sdp, answerSendID }
    // console.log("onGetAnswerHandler(): start", `(socket id: ${socket.id})`);
    const pc = pcs[data.answerSendID];

    if (!pc) {
      console.log("onGetAnswerHandler(): no pc in pcs");
      return;
    }

    await pc.setRemoteDescription(data.sdp);

    // console.log("onGetAnswerHandler(): done");
    // console.log("current pcs: ", pcs);
  }

  const onGetCandidateHandler = async (data) => {
    // data 형태: { candidate, candidateSendID }
    // console.log("onGetCandidateHandler(): start", `(socket id: ${socket.id})`);
    const pc = pcs[data.candidateSendID];
    if (!pc) {
      console.log("onGetCandidateHandler(): no pc in pcs");
      return;
    }

    await pc.addIceCandidate(data.candidate);

    // console.log('onGetCandidateHandler(): add success');
  }

  const onUserExitHandler = (data) => {
    // data 형태: { id }
    // console.log("onUserExitHandler(): ", `${data.id} left the room`, `(socket id: ${socket.id})`);
    if (!pcs[data.id]) {
      console.log("onUserExitHandler(): exited user not found in pcs");
      return;
    }

    pcs[data.id].close();
    delete pcs[data.id];
    setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));

    // console.log("onUserExitHandler(): done");
  }

  socket.on("connect", onConnectHandler);
  socket.on("all_users", onAllUsersHandler);
  socket.on("get_offer", onGetOfferHandler);
  socket.on("get_answer", onGetAnswerHandler);
  socket.on("get_candidate", onGetCandidateHandler);
  socket.on("user_exit", onUserExitHandler);

  const Video = ({ name, colorId, stream, muted = false }) => {
    const ref = useRef(null);

    useEffect(() => {
      ref.current.srcObject = stream;
    }, [])

    return (
      <div className="my-1 flex flex-col justify-center items-start">
        <video
          className="rounded-xl shadow-sm shadow-gray-700"
          ref={ref}
          muted={muted}
          autoPlay
          style={{
            aspectRatio: "4/3",
            height: "15vh",
            backgroundColor: "black",
          }}
        />
        <div className="flex flex-row items-center mt-1 ml-3">
          <div className="rounded-full w-3 h-3 mr-2"
            style={{
              backgroundColor: COLORS_NAMETAG[colorId]
            }}
          />
          <div className="nanumbarungothic text-bold rounded-full text-sm"
          >
            {name}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    socket.connect();

    return (() => {
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop()
        });
      }
    })
  }, []);

  return (
    <div className="flex flex-col mx-2">
      <div className="my-1 flex flex-col justify-center items-start">
        <video className="rounded-xl shadow-sm shadow-gray-700"
          style={{
            aspectRatio: "4/3",
            height: "15vh",
            backgroundColor: "black",
          }}
          muted
          ref={localVideoRef}
          autoPlay
        />
        <div className="flex flex-row items-center mt-1 ml-3">
          <div className="rounded-full w-3 h-3 mr-2"
            style={{
              backgroundColor: COLORS_NAMETAG[myColorId]
            }}
          />
          <div className="nanumbarungothic text-bold rounded-full text-sm"
          >
            나
          </div>
        </div>

      </div>
      {users.map((user, index) => (
        <div key={index}>
          <Video key={user.id} name={user.name} colorId={user.colorId} stream={user.stream} />
        </div>
      ))}
    </div>
  );
}